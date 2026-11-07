// MahaDiagno AI — tools exposed to the model. Every lookup is scoped to ctx.userId.
// Each tool returns { result, card? }: `result` is a compact object sent back to the
// model (JSON string), `card` is UI data returned to the app in `cards[]`.
import prisma from '../../Utils/prismaclint.js'
import { nowIST, isValidDate, weekdayOf, addDays, daysBetween, normTime } from './time.js'

const ACTIVE_STATUSES = ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS']
const LAB_STATUSES = ['SCHEDULED', 'ACCEPTED', 'COMPLETED', 'CANCELLED']
const SEARCH_WINDOW_DAYS = 14
const CANCEL_NOTE = 'Refund goes to the original payment method in 5–7 working days. A 2% + GST gateway fee is deducted.'

// ---------- helpers ----------

const round2 = (n) => Math.round(n * 100) / 100

const haversineKm = (lat1, lng1, lat2, lng2) => {
    const toRad = (d) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const validLocation = (loc) => {
    const lat = Number(loc?.latitude)
    const lng = Number(loc?.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
    if (lat === 0 && lng === 0) return null
    return { lat, lng }
}

const distanceFrom = (loc, doctor) => {
    if (!loc || doctor.lat == null || doctor.lng == null || doctor.lat === '' || doctor.lng === '') return null
    const lat = parseFloat(doctor.lat)
    const lng = parseFloat(doctor.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return Math.round(haversineKm(loc.lat, loc.lng, lat, lng) * 10) / 10
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9ऀ-ॿ ]+/g, ' ').replace(/\s+/g, ' ').trim()

const toId = (v) => {
    const n = Number(v)
    return Number.isInteger(n) && n > 0 ? n : null
}

// slots of a timing that are free on `date` (and in the future if date is today)
const freeSlotsOf = (timing, date, now) =>
    (timing?.slots ?? [])
        .filter(s => !(s.doctorappointment ?? []).some(a => a.date === date))
        .filter(s => date !== now.date || normTime(s.startTime) > now.time)
        .sort((a, b) => normTime(a.startTime).localeCompare(normTime(b.startTime)))

const slotDto = (slot, timing, date) => ({
    slotId: slot.id,
    timingId: timing.id,
    date,
    startTime: normTime(slot.startTime),
    endTime: normTime(slot.endTime),
    fee: timing.fee ?? 0,
})

// timings (+slots +active bookings in [from, from+days)) for a set of doctors
const loadTimings = async (doctorIds, from, days) => {
    const dates = Array.from({ length: days }, (_, i) => addDays(from, i))
    return prisma.timings.findMany({
        where: { doctorId: { in: doctorIds } },
        select: {
            id: true, day: true, isAvailable: true, fee: true, doctorId: true,
            slots: {
                select: {
                    id: true, startTime: true, endTime: true,
                    doctorappointment: {
                        where: { date: { in: dates }, status: { in: ACTIVE_STATUSES } },
                        select: { date: true },
                    },
                },
            },
        },
    })
}

// first date in [from, from+days) where the doctor has a free slot
const nextAvailable = (timings, from, days, now) => {
    for (let i = 0; i < days; i++) {
        const date = addDays(from, i)
        const wd = weekdayOf(date)
        const t = timings.find(x => x.day === wd && x.isAvailable)
        if (t && freeSlotsOf(t, date, now).length > 0) return date
    }
    return null
}

// lowest fee among days the doctor actually consults (available + has slots); falls back to any available day
const minFee = (timings) => {
    const avail = timings.filter(t => t.isAvailable && t.fee != null)
    const withSlots = avail.filter(t => (t.slots ?? []).length > 0)
    const fees = (withSlots.length ? withSlots : avail).map(t => t.fee)
    return fees.length ? Math.min(...fees) : null
}

const checkDate = (date, now) => {
    if (!isValidDate(date)) return 'date must be in YYYY-MM-DD format'
    if (date < now.date) return `date ${date} is in the past (today is ${now.date})`
    return null
}

// ---------- tools ----------

async function list_specializations() {
    const specs = await prisma.specialization.findMany({
        select: { id: true, key: true, label: true, symptoms: { select: { name: true } } },
        orderBy: { id: 'asc' },
    })
    return {
        result: {
            specializations: specs.map(s => ({ id: s.id, label: s.label, key: s.key, commonSymptoms: s.symptoms.map(x => x.name) })),
        },
    }
}

async function search_doctors(args, ctx) {
    const now = nowIST()
    const loc = validLocation(ctx.location)
    const specText = norm(args.specialization)
    const symptomsText = norm(args.symptoms)
    const query = String(args.query ?? '').trim().slice(0, 100)
    let from = now.date
    if (args.date) {
        const err = checkDate(args.date, now)
        if (err) return { result: { error: err } }
        from = args.date
    }

    const specs = await prisma.specialization.findMany({
        select: { id: true, key: true, label: true, symptoms: { select: { name: true } } },
    })

    // free-text specialization → ids (label/key, case-insensitive, either direction)
    let specIds = null
    let matchedLabel = null
    if (specText) {
        const hits = specs.filter(s => {
            const l = norm(s.label), k = norm(s.key.replace(/[-_]/g, ' '))
            return l.includes(specText) || k.includes(specText) || specText.includes(l) || specText.includes(k)
        })
        if (!hits.length) {
            return {
                result: {
                    error: `No specialization matches "${args.specialization}".`,
                    availableSpecializations: specs.map(s => s.label),
                    hint: 'Pick one of availableSpecializations and call search_doctors again.',
                },
            }
        }
        specIds = hits.map(s => s.id)
        matchedLabel = hits.length === 1 ? hits[0].label : null
    }

    // symptoms → specializations via the symptom table (only used to boost ranking / when no specialization given)
    let symptomSpecIds = []
    if (symptomsText) {
        const words = symptomsText.split(' ').filter(w => w.length > 2)
        symptomSpecIds = specs
            .filter(s => s.symptoms.some(sym => {
                const n = norm(sym.name)
                return symptomsText.includes(n) || words.some(w => n.includes(w))
            }))
            .map(s => s.id)
        if (!specIds && symptomSpecIds.length) {
            specIds = symptomSpecIds
            if (symptomSpecIds.length === 1) matchedLabel = specs.find(s => s.id === symptomSpecIds[0]).label
        }
    }

    const baseWhere = {}
    if (specIds) baseWhere.specializationId = { in: specIds }
    if (query) {
        baseWhere.OR = ['displayName', 'fName', 'lName', 'clinicName', 'clinicAddress']
            .map(f => ({ [f]: { contains: query, mode: 'insensitive' } }))
    }
    const select = {
        id: true, displayName: true, imageUrl: true, clinicName: true, clinicAddress: true,
        lat: true, lng: true, isVerified: true,
        specialization: { select: { id: true, label: true } },
    }

    let note = null
    let doctors = await prisma.doctor.findMany({ where: { ...baseWhere, isVerified: true }, select })
    if (!doctors.length) {
        doctors = await prisma.doctor.findMany({ where: baseWhere, select })
        if (doctors.length) note = 'No verified doctors matched, so these results include doctors who are not verified yet. Tell the user.'
    }
    if (!doctors.length) {
        return {
            result: {
                doctors: [],
                message: 'No doctors found for this search in MahaDiagno.',
                ...(specIds ? { searchedSpecializations: specs.filter(x => specIds.includes(x.id)).map(x => x.label) } : {}),
                availableSpecializations: specs.map(s => s.label),
            },
        }
    }

    const timings = await loadTimings(doctors.map(d => d.id), from, SEARCH_WINDOW_DAYS)
    const ranked = doctors.map(d => {
        const t = timings.filter(x => x.doctorId === d.id)
        const nextAvailableDate = nextAvailable(t, from, SEARCH_WINDOW_DAYS, now)
        return {
            ...d,
            distanceKm: distanceFrom(loc, d),
            feeFrom: minFee(t),
            nextAvailableDate,
            specialtyMatch: (specIds?.includes(d.specialization.id) ? 1 : 0) + (symptomSpecIds.includes(d.specialization.id) ? 1 : 0),
            daysUntil: nextAvailableDate ? daysBetween(from, nextAvailableDate) : Infinity,
        }
    })

    ranked.sort((a, b) =>
        (b.specialtyMatch - a.specialtyMatch) ||
        (a.daysUntil - b.daysUntil) ||
        ((a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)) ||
        ((a.feeFrom ?? Infinity) - (b.feeFrom ?? Infinity)) ||
        (a.id - b.id))

    const top = ranked.slice(0, 5)
    const label = matchedLabel ? (matchedLabel.endsWith('s') ? matchedLabel : `${matchedLabel}s`) : 'Doctors'
    const card = {
        type: 'doctors',
        title: loc ? `${label} near you` : (matchedLabel ? label : 'Doctors for you'),
        doctors: top.map(d => ({
            id: d.id,
            displayName: d.displayName,
            imageUrl: d.imageUrl,
            specialization: { id: d.specialization.id, label: d.specialization.label },
            clinicName: d.clinicName,
            clinicAddress: d.clinicAddress,
            distanceKm: d.distanceKm,
            feeFrom: d.feeFrom,
            nextAvailableDate: d.nextAvailableDate,
            isVerified: d.isVerified,
            consultation: 'Video consultation',
        })),
    }

    return {
        result: {
            shownToUserAsCards: true,
            ...(note ? { note } : {}),
            searchedFrom: from,
            ...(specIds ? { searchedSpecializations: specs.filter(x => specIds.includes(x.id)).map(x => x.label) } : {}),
            locationUsed: Boolean(loc),
            doctors: top.map(d => ({
                id: d.id,
                name: d.displayName,
                specialization: d.specialization.label,
                distanceKm: d.distanceKm,
                feeFrom: d.feeFrom,
                nextAvailableDate: d.nextAvailableDate,
                verified: d.isVerified,
            })),
            totalMatches: ranked.length,
        },
        card,
    }
}

async function get_doctor_slots(args) {
    const now = nowIST()
    const doctorId = toId(args.doctorId)
    if (!doctorId) return { result: { error: 'doctorId is required' } }
    const err = checkDate(args.date, now)
    if (err) return { result: { error: err } }
    const date = args.date

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true, displayName: true, specialization: { select: { label: true } } },
    })
    if (!doctor) return { result: { error: `Doctor ${doctorId} not found` } }

    const timings = await loadTimings([doctorId], date, SEARCH_WINDOW_DAYS)
    const weekday = weekdayOf(date)
    const timing = timings.find(t => t.day === weekday)

    if (!timing || !timing.isAvailable) {
        return {
            result: {
                doctor: doctor.displayName, date, weekday, available: false,
                reason: `${doctor.displayName} does not consult on ${weekday}s.`,
                nextAvailableDate: nextAvailable(timings, date, SEARCH_WINDOW_DAYS, now),
            },
        }
    }

    const free = freeSlotsOf(timing, date, now)
    if (!free.length) {
        return {
            result: {
                doctor: doctor.displayName, date, weekday, available: false,
                reason: date === now.date ? 'No free slots left today.' : 'All slots are booked on this date.',
                nextAvailableDate: nextAvailable(timings, addDays(date, 1), SEARCH_WINDOW_DAYS, now),
            },
        }
    }

    const slots = free.map(s => slotDto(s, timing, date))
    return {
        result: {
            shownToUserAsCards: true,
            doctor: doctor.displayName, doctorId, date, weekday, fee: timing.fee ?? 0,
            freeSlotCount: slots.length,
            freeSlots: slots.slice(0, 16).map(s => `${s.startTime}-${s.endTime} (slotId ${s.slotId})`),
        },
        card: {
            type: 'slots',
            doctor: { id: doctor.id, displayName: doctor.displayName, specialization: { label: doctor.specialization.label } },
            date,
            fee: timing.fee ?? 0,
            slots,
        },
    }
}

async function prepare_doctor_booking(args) {
    const now = nowIST()
    const askedDoctorId = args.doctorId != null ? toId(args.doctorId) : null
    const slotId = toId(args.slotId)
    if (!slotId) return { result: { error: 'slotId is required' } }
    const err = checkDate(args.date, now)
    if (err) return { result: { error: err } }
    const date = args.date
    const weekday = weekdayOf(date)

    const slot = await prisma.slots.findUnique({
        where: { id: slotId },
        select: {
            id: true, startTime: true, endTime: true,
            timings: { select: { id: true, day: true, isAvailable: true, fee: true, doctorId: true } },
            doctorappointment: { where: { date, status: { in: ACTIVE_STATUSES } }, select: { id: true } },
        },
    })
    if (!slot) return { result: { error: `Slot ${slotId} not found. Call get_doctor_slots first.` } }
    // doctorId is optional: the slot-tap chat message only carries the slot id
    const doctorId = slot.timings.doctorId
    if (askedDoctorId && askedDoctorId !== doctorId) {
        return { result: { error: `Slot ${slotId} does not belong to doctor ${askedDoctorId}. Call get_doctor_slots first.` } }
    }
    if (slot.timings.day !== weekday) {
        return { result: { error: `Slot ${slotId} is a ${slot.timings.day} slot but ${date} is a ${weekday}. Call get_doctor_slots for that date.` } }
    }
    if (!slot.timings.isAvailable) {
        return { result: { error: `The doctor does not consult on ${weekday}s.` } }
    }
    if (slot.doctorappointment.length > 0) {
        return { result: { error: 'This slot is already booked. Offer other slots from get_doctor_slots.' } }
    }
    if (date === now.date && normTime(slot.startTime) <= now.time) {
        return { result: { error: 'This slot time has already passed today.' } }
    }

    // same shape as GET /api/v1/doctor/get/:id (getDoctorById). Other patients'
    // bookings (doctorappointment) are deliberately not sent: an empty array keeps the shape.
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: {
            id: true, fName: true, lName: true, displayName: true, phoneNumber: true, email: true,
            clinicName: true, clinicAddress: true, imageUrl: true,
            specialization: true, experience: true, education: true, timings: true,
            isVerified: true,
        },
    })
    if (!doctor) return { result: { error: `Doctor ${doctorId} not found` } }
    const fullDoctor = { ...doctor, doctorappointment: [] }

    const slotData = slotDto(slot, slot.timings, date)
    return {
        result: {
            shownToUserAsCards: true,
            bookingDraftReady: true,
            doctor: doctor.displayName, date, weekday,
            time: `${slotData.startTime}-${slotData.endTime}`, fee: slotData.fee,
            nextStep: 'User must tap "Confirm & Pay" on the card. Booking is complete only after payment.',
        },
        card: { type: 'booking_draft', doctor: fullDoctor, slot: slotData },
    }
}

async function get_my_appointments(args, ctx) {
    const filter = ['upcoming', 'past', 'all'].includes(args.filter) ? args.filter : 'upcoming'
    const now = nowIST()

    const rows = await prisma.doctorappointment.findMany({
        where: { userId: ctx.userId },
        select: {
            id: true, status: true, date: true, prescriptionUrl: true,
            patientFirstName: true, patientLastName: true,
            slot: { select: { startTime: true, endTime: true } },
            doctor: { select: { id: true, displayName: true, imageUrl: true, specialization: { select: { label: true } } } },
        },
    })

    const key = (a) => `${a.date} ${normTime(a.slot?.startTime)}`
    const isUpcoming = (a) => ACTIVE_STATUSES.includes(a.status) && a.date >= now.date
    let list = rows
    if (filter === 'upcoming') list = rows.filter(isUpcoming).sort((a, b) => key(a).localeCompare(key(b)))
    else if (filter === 'past') list = rows.filter(a => !isUpcoming(a)).sort((a, b) => key(b).localeCompare(key(a)))
    else list = [...rows].sort((a, b) => key(b).localeCompare(key(a)))
    list = list.slice(0, 10)

    const titles = { upcoming: 'Your upcoming appointments', past: 'Your past appointments', all: 'Your appointments' }
    const appointments = list.map(a => ({
        id: a.id,
        status: a.status,
        date: a.date,
        slot: { startTime: normTime(a.slot?.startTime), endTime: normTime(a.slot?.endTime) },
        doctor: {
            id: a.doctor.id, displayName: a.doctor.displayName,
            specialization: { label: a.doctor.specialization?.label ?? null }, imageUrl: a.doctor.imageUrl,
        },
        patientName: `${a.patientFirstName ?? ''} ${a.patientLastName ?? ''}`.trim(),
        hasPrescription: Boolean(a.prescriptionUrl),
        canCancel: a.status === 'SCHEDULED',
    }))

    return {
        result: {
            filter, count: appointments.length, shownToUserAsCards: appointments.length > 0,
            appointments: appointments.map(a => ({
                id: a.id, status: a.status, date: a.date, time: a.slot.startTime,
                doctor: a.doctor.displayName, patient: a.patientName, canCancel: a.canCancel,
            })),
        },
        card: appointments.length ? { type: 'appointments', title: titles[filter], appointments } : undefined,
    }
}

async function request_cancel_appointment(args, ctx) {
    const appointmentId = toId(args.appointmentId)
    if (!appointmentId) return { result: { error: 'appointmentId is required' } }

    const a = await prisma.doctorappointment.findFirst({
        where: { id: appointmentId, userId: ctx.userId },
        select: {
            id: true, status: true, date: true,
            slot: { select: { startTime: true, endTime: true, timings: { select: { fee: true, day: true } } } },
            doctor: { select: { displayName: true } },
        },
    })
    if (!a) return { result: { error: `Appointment ${appointmentId} was not found in this user's appointments.` } }
    if (a.status !== 'SCHEDULED') {
        return {
            result: {
                canCancel: false, status: a.status,
                reason: `Only SCHEDULED appointments can be cancelled; this one is ${a.status}.`,
            },
        }
    }

    // same formula as cancelAppointment: amount − (2% + 18% GST on that 2%)
    const paidAmount = a.slot?.timings?.fee ?? 0
    const fee = 0.02 * paidAmount
    const refundEstimate = round2(paidAmount - (fee + 0.18 * fee))

    return {
        result: {
            shownToUserAsCards: true, confirmationRequired: true,
            appointmentId: a.id, doctor: a.doctor.displayName, date: a.date, time: normTime(a.slot?.startTime),
            paidAmount, refundEstimate,
            nextStep: 'Nothing is cancelled yet. The user must tap "Yes, cancel" on the card.',
        },
        card: {
            type: 'cancel_confirm',
            appointment: {
                id: a.id, date: a.date,
                slot: { startTime: normTime(a.slot?.startTime), endTime: normTime(a.slot?.endTime) },
                doctor: { displayName: a.doctor.displayName },
            },
            paidAmount,
            refundEstimate,
            note: CANCEL_NOTE,
        },
    }
}

const labStage = (t) => {
    switch (t.status) {
        case 'SCHEDULED': return 'Booked – waiting for lab to accept'
        case 'ACCEPTED': return 'Sample collector assigned'
        case 'COMPLETED': return t.reportReady ? 'Report ready' : 'Sample collected – report pending'
        case 'CANCELLED': return 'Cancelled'
        default: return t.status
    }
}

async function get_my_lab_tests(args, ctx) {
    const status = args.status ? String(args.status).toUpperCase() : null
    if (status && !LAB_STATUSES.includes(status)) {
        return { result: { error: `status must be one of ${LAB_STATUSES.join(', ')}` } }
    }
    const rows = await prisma.appointment.findMany({
        where: { userId: ctx.userId, ...(status ? { status } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
            id: true, status: true, createdAt: true, isPaid: true, modeOfPayment: true,
            isReportUploaded: true, reportName: true, addressId: true,
            patient_first_name: true, patient_last_name: true,
            serviceId: { select: { title: true, price: true } },
            partner: { select: { hospitalName: true } },
            address: { select: { area: true, district: true } },
        },
    })

    const tests = rows.map(r => {
        const reportReady = Boolean(r.isReportUploaded && r.reportName)
        const t = {
            id: r.id,
            title: r.serviceId?.title ?? 'Lab test',
            labName: r.partner?.hospitalName ?? null,
            status: r.status,
            stage: null,
            createdAt: r.createdAt.toISOString(),
            isPaid: r.isPaid,
            modeOfPayment: r.modeOfPayment,
            reportReady,
            reportName: reportReady ? r.reportName : null,
            homeCollection: r.addressId != null,
        }
        t.stage = labStage(t)
        return t
    })

    return {
        result: {
            count: tests.length, shownToUserAsCards: tests.length > 0,
            tests: tests.map((t, i) => ({
                id: t.id, title: t.title, lab: t.labName, status: t.status, stage: t.stage,
                bookedOn: t.createdAt.slice(0, 10), paid: t.isPaid, reportReady: t.reportReady,
                patient: `${rows[i].patient_first_name} ${rows[i].patient_last_name}`.trim(),
                collectionArea: rows[i].address ? `${rows[i].address.area}, ${rows[i].address.district}` : null,
            })),
        },
        card: tests.length ? { type: 'lab_tests', title: status ? `Your ${status.toLowerCase()} lab tests` : 'Your lab tests', tests } : undefined,
    }
}

async function get_my_medicine_orders(args, ctx) {
    const orderId = args.orderId != null ? toId(args.orderId) : null
    if (args.orderId != null && !orderId) return { result: { error: 'orderId must be a positive integer' } }

    const rows = await prisma.order.findMany({
        where: { userId: ctx.userId, ...(orderId ? { id: orderId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
            id: true, orderstatus: true, createdAt: true, totalAmount: true, isPaid: true, modeOfPayment: true,
            orderItem: { select: { quantity: true, medicine: { select: { name: true } } } },
            pharmacyVendor: { select: { shopName: true, phoneNumber: true } },
        },
    })
    if (orderId && !rows.length) return { result: { error: `Order ${orderId} was not found in this user's orders.` } }

    const orders = rows.map(o => ({
        id: o.id,
        status: o.orderstatus,
        createdAt: o.createdAt.toISOString(),
        totalAmount: o.totalAmount,
        isPaid: o.isPaid,
        modeOfPayment: o.modeOfPayment,
        itemCount: o.orderItem.length,
        items: o.orderItem.map(i => ({ name: i.medicine?.name ?? 'Item', quantity: i.quantity })),
        pharmacy: { shopName: o.pharmacyVendor?.shopName ?? null, phoneNumber: o.pharmacyVendor?.phoneNumber ?? null },
    }))

    return {
        result: {
            count: orders.length, shownToUserAsCards: orders.length > 0,
            orders: orders.map(o => ({
                id: o.id, status: o.status, orderedOn: o.createdAt.slice(0, 10), total: o.totalAmount,
                paid: o.isPaid, items: o.items.map(i => `${i.name} x${i.quantity}`).slice(0, 5), pharmacy: o.pharmacy.shopName,
            })),
        },
        card: orders.length ? { type: 'orders', title: orderId ? `Order #${orderId}` : 'Your medicine orders', orders } : undefined,
    }
}

// ---------- registry ----------

const impl = {
    list_specializations,
    search_doctors,
    get_doctor_slots,
    prepare_doctor_booking,
    get_my_appointments,
    request_cancel_appointment,
    get_my_lab_tests,
    get_my_medicine_orders,
}

const fn = (name, description, properties = {}, required = []) => ({
    type: 'function',
    function: {
        name, description,
        parameters: { type: 'object', properties, required, additionalProperties: false },
    },
})

export const toolDefinitions = [
    fn('list_specializations', 'List the doctor specializations available in MahaDiagno, with common symptoms for each. Use it to map symptoms to a specialist.'),
    fn('search_doctors', 'Search MahaDiagno doctors (verified first). Ranked by specialty match, earliest availability, distance (if the user location is known) and fee. Returns the top 5 and shows them to the user as cards.', {
        specialization: { type: 'string', description: 'Specialization label or key, e.g. "Cardiologist". Prefer a label from list_specializations.' },
        symptoms: { type: 'string', description: 'User symptoms in English, e.g. "fever and cough"' },
        query: { type: 'string', description: 'Doctor or clinic name / area to match' },
        date: { type: 'string', description: 'Preferred date YYYY-MM-DD (availability is checked from this date)' },
    }),
    fn('get_doctor_slots', 'Get free appointment slots of one doctor on one date. Shows the slots to the user as a card.', {
        doctorId: { type: 'integer' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
    }, ['doctorId', 'date']),
    fn('prepare_doctor_booking', 'Validate a chosen slot and prepare a booking draft card. Does NOT book or charge: the user completes the booking by paying from the card.', {
        doctorId: { type: 'integer', description: 'Optional; inferred from the slot when omitted' },
        slotId: { type: 'integer' },
        date: { type: 'string', description: 'YYYY-MM-DD' },
    }, ['slotId', 'date']),
    fn('get_my_appointments', "Get the user's doctor appointments. Shows them as cards.", {
        filter: { type: 'string', enum: ['upcoming', 'past', 'all'] },
    }),
    fn('request_cancel_appointment', 'Prepare a cancellation confirmation card with the refund estimate. Does NOT cancel; the user must confirm on the card. Only SCHEDULED appointments can be cancelled.', {
        appointmentId: { type: 'integer' },
    }, ['appointmentId']),
    fn('get_my_lab_tests', "Get the user's lab test / diagnostic bookings with their stage and report status. Shows them as cards.", {
        status: { type: 'string', enum: LAB_STATUSES },
    }),
    fn('get_my_medicine_orders', "Get the user's medicine orders (or one order). Shows them as cards.", {
        orderId: { type: 'integer' },
    }),
]

// ctx = { userId, location }
export const runTool = async (name, rawArgs, ctx) => {
    const tool = impl[name]
    if (!tool) return { result: { error: `Unknown tool ${name}` } }
    let args = rawArgs
    if (typeof rawArgs === 'string') {
        try { args = rawArgs.trim() ? JSON.parse(rawArgs) : {} } catch { return { result: { error: 'Invalid JSON arguments' } } }
    }
    if (!args || typeof args !== 'object') args = {}
    try {
        return await tool(args, ctx)
    } catch (error) {
        console.log(`AI tool ${name} failed:`, error)
        return { result: { error: 'Internal error while fetching data. Apologise and suggest trying again.' } }
    }
}

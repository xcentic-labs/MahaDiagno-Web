// Date/time helpers pinned to Asia/Kolkata (IST, no DST).
export const TZ = 'Asia/Kolkata'
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const partsFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

// { date: 'YYYY-MM-DD', time: 'HH:mm', weekday: 'Saturday' } for "now" in IST
export const nowIST = (at = new Date()) => {
    const p = Object.fromEntries(partsFmt.formatToParts(at).map(x => [x.type, x.value]))
    const date = `${p.year}-${p.month}-${p.day}`
    return { date, time: `${p.hour}:${p.minute}`, weekday: weekdayOf(date) }
}

export const isValidDate = (s) => {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
    const d = new Date(`${s}T00:00:00Z`)
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

// weekday name of a calendar date (timezone independent)
export const weekdayOf = (date) => WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]

export const addDays = (date, n) => {
    const d = new Date(`${date}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + n)
    return d.toISOString().slice(0, 10)
}

export const daysBetween = (a, b) =>
    Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000)

// "HH:mm" strings compare correctly lexicographically when zero padded
export const normTime = (t) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(t ?? ''))
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(t ?? '')
}

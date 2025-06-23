export default function getExpiresAt(monthsToAdd) {
    const now = new Date(); // purchasedAt = now
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // Create a new date based on months to add
    const newMonth = month + monthsToAdd;
    const expiresAt = new Date(now);

    expiresAt.setFullYear(year + Math.floor(newMonth / 12));
    expiresAt.setMonth(newMonth % 12);

    // Handle edge case where day may not exist in target month
    if (expiresAt.getDate() < day) {
        expiresAt.setDate(0);
    }

    return expiresAt.toISOString(); // return in DateTime format
}

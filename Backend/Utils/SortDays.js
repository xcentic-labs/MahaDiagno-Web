export const sortDays = (data) => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return data.sort((a, b) => {
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });
}
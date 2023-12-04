const today = new Date();

export const currentMonth = today.getMonth() + 1;

// prettier-ignore
const monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
export const currentMonthName = monthNames[today.getMonth()];

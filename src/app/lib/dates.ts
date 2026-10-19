// Small date helpers shared by the product search UI (leads search + results filters).

export const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

export const todayDateInputValue = () => toDateInputValue(new Date());

export const daysAgoDateInputValue = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInputValue(date);
};

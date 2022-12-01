const getMonthString = (date: Date) => {
  return date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
};
const getDayString = (date: Date) => {
  return date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
};

const dateStringHelper = {
  getDayString,
  getMonthString,
};

export default dateStringHelper;

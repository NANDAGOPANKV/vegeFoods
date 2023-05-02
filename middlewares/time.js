const getFullCurrentDate = () => {
  let currentDate = new Date();
  // day
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = currentDate.getDay();
  const dayName = daysOfWeek[dayOfWeek];

  // current date
  // adjust 0 before single digit date
  let date = ("0" + currentDate.getDate()).slice(-2);

  // current month
  let month = ("0" + (currentDate.getMonth() + 1)).slice(-2);

  // current year
  let year = currentDate.getFullYear();

  // current hours
  let hours = currentDate.getHours();

  // current minutes
  let minutes = currentDate.getMinutes();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  const completeDate =
    dayName + hours + ":" + minutes + "   " + date + "/" + month + "/" + year;
  return completeDate;
};

module.exports = { getFullCurrentDate };

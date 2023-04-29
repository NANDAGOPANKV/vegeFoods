const getFullCurrentDate = () => {
  let currentDate = new Date();

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
    hours + ":" + minutes + "   " + date + "/" + month + "/" + year;
  return completeDate;
};

module.exports = { getFullCurrentDate };

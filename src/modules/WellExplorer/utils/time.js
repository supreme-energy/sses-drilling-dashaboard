import moment from "moment";

export const getHoursDif = (start, end) => {
  const startTime = moment(start);
  const endTime = moment(end);
  const duration = moment.duration(endTime.diff(startTime));
  return duration.asHours();
};

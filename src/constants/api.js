export const GET_WELL_LIST = "/joblist.php";
export const getWellInfo = wellName => `/wellinfo.php?seldbname=${wellName}`;
export const getWellSurvey = wellName => `/surveys.php?seldbname=${wellName}`;

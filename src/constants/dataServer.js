export const fields = {
  USERNAME: "username",
  PASSWORD: "password",
  ENDPOINT: "host",
  TYPE: "connection_type"
};
export const labels = {
  USERNAME: "User Name",
  PASSWORD: "Password",
  ENDPOINT: "Server End Point",
  TYPE: "Server Type"
};
export const connectionTypes = {
  POLARIS: "polaris",
  WellData: "welldata",
  RigMinder: "rigminder",
  Hess: "hess",
  DigiDrill: "digidrill"
};
export const initialServerState = {
  [fields.USERNAME]: "",
  [fields.PASSWORD]: "",
  [fields.ENDPOINT]: "",
  [fields.TYPE]: ""
};

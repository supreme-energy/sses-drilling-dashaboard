export const serverFields = {
  USERNAME: "username",
  PASSWORD: "password",
  ENDPOINT: "host",
  TYPE: "connection_type"
};
export const wellFields = {
  START_DEPTH: "aisd",
  GR_IMPORT: "auto_gr_mnemonic",
  WELL: "nameWell",
  WELL_BORE: "nameWellbore",
  WELL_LOG: "name"
};
export const serverLabels = {
  USERNAME: "User Name",
  PASSWORD: "Password",
  ENDPOINT: "Server End Point",
  TYPE: "Server Type"
};
export const wellLabels = {
  START_DEPTH: "Survey Start Depth",
  GR_IMPORT: "Gamma Ray Import Mnemonic",
  WELL: "Well",
  WELL_BORE: "Well Bore",
  WELL_LOG: "Well Log"
};
export const connectionTypes = {
  POLARIS: "polaris",
  WellData: "welldata",
  RigMinder: "rigminder",
  Hess: "hess",
  DigiDrill: "digidrill"
};
export const initialServerState = {
  [serverFields.USERNAME]: "",
  [serverFields.PASSWORD]: "",
  [serverFields.ENDPOINT]: "",
  [serverFields.TYPE]: ""
};
export const initialWellState = {
  [wellFields.START_DEPTH]: "",
  [wellFields.GR_IMPORT]: "",
  [wellFields.WELL]: "",
  [wellFields.WELL_BORE]: "",
  [wellFields.WELL_LOG]: ""
};

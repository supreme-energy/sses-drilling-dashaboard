export const serverFields = {
  USERNAME: "username",
  PASSWORD: "password",
  ENDPOINT: "host",
  TYPE: "connection_type"
};
export const wellFields = {
  START_DEPTH: "aisd",
  GR_IMPORT: "auto_gr_mnemonic",
  WELL: "welluid",
  WELLBORE: "boreuid",
  WELL_LOG: "logid"
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
  WELLBORE: "Well Bore",
  WELL_LOG: "Well Log"
};
export const connectionTypes = {
  POLARIS: "polaris",
  WellData: "welldata",
  RigMinder: "rigminder",
  Hess: "hess",
  DigiDrill: "digidrill",
  LasFile: "lasfile"
};
export const initialServerState = {
  [serverFields.USERNAME]: "",
  [serverFields.PASSWORD]: "",
  [serverFields.ENDPOINT]: "",
  [serverFields.TYPE]: connectionTypes.POLARIS
};
export const initialWellState = {
  [wellFields.START_DEPTH]: "",
  [wellFields.GR_IMPORT]: "",
  [wellFields.WELL]: "",
  [wellFields.WELLBORE]: "",
  [wellFields.WELL_LOG]: ""
};

<<<<<<< HEAD
export const serverFields = {
=======
export const fields = {
>>>>>>> develop
  USERNAME: "username",
  PASSWORD: "password",
  ENDPOINT: "host",
  TYPE: "connection_type"
};
<<<<<<< HEAD
export const wellFields = {
  START_DEPTH: "aisd",
  GR_IMPORT: "auto_gr_mnemonic",
  WELL: "host",
  WELL_BORE: "connection_type",
  WELL_LOG: "connection_type"
};
export const serverLabels = {
=======
export const labels = {
>>>>>>> develop
  USERNAME: "User Name",
  PASSWORD: "Password",
  ENDPOINT: "Server End Point",
  TYPE: "Server Type"
};
<<<<<<< HEAD
export const wellLabels = {
  START_DEPTH: "Survey Start Depth",
  GR_IMPORT: "Gamma Ray Import Mnemonic",
  WELL: "Well",
  WELL_BORE: "Well Bore",
  WELL_LOG: "Well Log"
};
=======
>>>>>>> develop
export const connectionTypes = {
  POLARIS: "polaris",
  WellData: "welldata",
  RigMinder: "rigminder",
  Hess: "hess",
  DigiDrill: "digidrill"
};
export const initialServerState = {
<<<<<<< HEAD
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
=======
  [fields.USERNAME]: "",
  [fields.PASSWORD]: "",
  [fields.ENDPOINT]: "",
  [fields.TYPE]: ""
>>>>>>> develop
};

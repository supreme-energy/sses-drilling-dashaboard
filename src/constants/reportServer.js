export const PERSONNEL = {
  field: "cat",
  label: "Personnel"
};

export const NAME = {
  field: "name",
  label: "Name"
};

export const EMAIL = {
  field: "email",
  label: "Email Address"
};

export const PHONE = {
  field: "phone",
  label: "Phone"
};

export const REPORTS = {
  field: "reports",
  label: "Reports"
};

export const INITIAL_MAILING_LIST_STATE = {
  [PERSONNEL.field]: "",
  [NAME.field]: "",
  [PHONE.field]: "",
  [EMAIL.field]: "",
  [REPORTS.field]: ""
};

export const REPORT_LIST = {
  "Combo Dashboard": false,
  "Structural Guidance": false,
  "Drilling Analytics": false,
  "Directional Guidance": false,
  "Key Performance Indicator": false,
  "Survey Sheet": false,
  "Lateral Plot (Only)": false,
  "Horizontal Plot (Only)": false,
  "LAS Data": false,
  '1" MD Logs': false,
  '2" MD Logs': false,
  '5" MD Logs': false,
  '1" TVD Logs': false,
  '2" TVD Logs': false,
  '5" TVD Logs': false,
  allReportsSelected: false
};

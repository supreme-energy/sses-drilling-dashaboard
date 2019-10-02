export const MD = "MD";
export const DL = "Dogleg";
export const AZM = "AZM";
export const INC = "INC";
export const DIP = "Dip";
export const CL = "CL";
export const PA1 = "PA1";
export const PA2 = "PA2";
export const MOTOR_YIELD = "Motor Yield";
export const ENABLED_FIELDS_DEPTH = [MD, CL, AZM, INC];
export const ENABLED_FIELDS_LAST_DL = [AZM, INC];
export const ENABLED_FIELDS_PROJECTION = [AZM, INC, MOTOR_YIELD];

export const bitProjectionInitialState = {
  meth: 0,
  bprj_pos_tcl: 0,
  svycnt: 0,
  svysel: 0,
  currid: 0,
  newid: "",
  project: "bit",
  bitoffset: 0,
  propazm: 0,
  data: "",
  cl: 0,
  md: 0,
  inc: 0,
  azm: 0,
  tvd: 0,
  vs: 0,
  ca: 0,
  cd: 0,
  tpos: 0,
  tot: 0,
  bot: 0,
  dip: 0,
  fault: 0,
  pmd: 0,
  pinc: 0,
  pazm: 0,
  ptvd: 0,
  pca: 0,
  pcd: 0,
  bprjpostcl: 0,
  autoposdec: 0
};

export const projectToPlanState = {
  calctype: "",
  motoryield: 0,
  pavsdel: 0,
  tinc: 0,
  tazm: 0,
  svycnt: 0,
  svysel: 0,
  currid: "",
  newid: "",
  project: "ahead",
  bitoffset: 0,
  propazm: 0,
  meth: 3,
  data: "",
  md: 0,
  inc: 0,
  azm: 0,
  tvd: 0,
  vs: 0,
  ca: 0,
  cd: 0,
  tpos: 0,
  tot: 0,
  dip: 0,
  fault: 0,
  pmd: 0,
  pinc: 0,
  pazm: 0,
  ptvd: 0,
  pca: 0,
  pcd: 0,
  tf: 0
};

export const bitContainerPages = {
  pages: [
    [["CL", "AZM"], ["MD", "INC"]],
    [["VS", "NS"], ["EW", "CD"]],
    [["CA", "DL"], ["TVD", "Fault"]],
    [["TCL", "Pos-TCL"], ["TOT", "BOT"]],
    [["Dip"]]
  ]
};

export const projectionPages = {
  pages: [[["INC", "AZM"], ["Motor Yield", "Slide"]], [["TF", "TVD"], ["VS", "MD"]], [["EW", "NS"]]]
};

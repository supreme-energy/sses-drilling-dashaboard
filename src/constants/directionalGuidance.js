export const MD = "MD";
export const DL = "Dogleg";
export const AZM = "AZM";
export const INC = "INC";
export const DIP = "Dip";
export const CL = "CL";
export const FOOTAGE = "FOOTAGE";
export const ENABLED_FIELDS_DEPTH = [MD, CL, AZM, INC];
export const ENABLED_FIELDS_LAST_DL = [MD, CL, AZM, INC];

export const bitProjectionInitialState = {
  meth: 0,
  bprj_pos_tcl: 0,
  svycnt: 0,
  svysel: 0,
  currid: 0,
  newid: 0,
  project: 0,
  bitoffset: 0,
  propazm: 0,
  data: 0,
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

export const bitContainerPages = {
  pages: [
    [["CL", "AZM"], ["MD", "INC"]],
    [["VS", "NS"], ["EW", "CD"]],
    [["CA", "DL"], ["TVD", "TF"]],
    [["TCL", "Pos-TCL"], ["TOT", "BOT"]],
    [["Dip", "Fault"]]
  ]
};

export const projectionPages = [
  {
    page: 0,
    columns: [
      [
        {
          label: "Inclination",
          value: 0
        },
        {
          label: "TVD",
          value: 0
        }
      ],
      [
        {
          label: "Azimuth",
          value: 0
        },
        {
          label: "Distance/Length",
          value: 0
        },
        {
          label: "Slide Length",
          value: 0
        }
      ],
      [
        {
          label: "Motor Yield",
          value: 0
        },
        {
          label: "TF Direction",
          value: 0
        }
      ]
    ]
  },
  {
    page: 1,
    columns: [
      [
        {
          label: "MD",
          value: 0
        },
        {
          label: "TF Dir.",
          value: 0
        }
      ],
      [
        {
          label: "Yield",
          value: 0
        },
        {
          label: "NS",
          value: 0
        }
      ],
      [
        {
          label: "Slide",
          value: 0
        },
        {
          label: "EW",
          value: 0
        }
      ]
    ]
  },
  {
    page: 2,
    columns: [
      [
        {
          label: "VS",
          value: 0
        }
      ]
    ]
  }
];

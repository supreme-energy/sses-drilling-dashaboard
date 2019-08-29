import { createMuiTheme } from "@material-ui/core/styles";

export const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    body2: {
      color: "rgba(0, 0, 0, 0.6)"
    },
    subtitle1: {
      color: "rgba(0, 0, 0, 0.6)"
    },
    caption: {
      color: "rgba(0,0,0,0.6)"
    },
    condensed: {
      fontFamily: "Roboto Condensed"
    }
  },
  palette: {
    primary: {
      main: "#207003"
    },
    secondary: {
      main: "#86863B"
    },
    success: {
      main: "#75BA2F"
    },
    warning: {
      main: "#EE2211"
    },
    sectionTitle: {
      main: "#86863B"
    },
    yellow: {
      main: "#E9CA00"
    },
    lateralLabel: {
      main: "#86863B"
    },
    surfaceLabel: {
      main: "#406DC5"
    },
    intermadiateLabel: {
      main: "#538531"
    },
    curveLabel: {
      main: "#7D7D7D"
    }
  },
  drillingStatusColor: "#4B921B",
  trippingStatusColor: "#B00020",
  overrides: {
    MuiTab: {
      root: {
        "&:focus": {
          outline: "none"
        }
      }
    },
    MuiIconButton: {
      root: {
        "&:focus": {
          outline: "none"
        }
      }
    },
    MuiButton: {
      root: {
        padding: "8px 16px"
      }
    },
    MuiSlider: {
      track: { backgroundColor: "#B6BA3E" },
      thumb: { backgroundColor: "#B6BA3E" }
    }
  }
});

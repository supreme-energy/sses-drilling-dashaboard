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
    }
  },
  palette: {
    primary: {
      main: "#207003"
    },
    success: {
      main: "#75BA2F"
    },
    warning: {
      main: "#EE2211"
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
    MuiButton: {
      root: {
        padding: "8px 16px"
      }
    }
  }
});

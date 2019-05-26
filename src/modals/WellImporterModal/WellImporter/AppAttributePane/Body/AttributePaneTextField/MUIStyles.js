const styles = theme => {
  return {
    root: {
      backgroundColor: "white"
    },
    cssUnderline: {
      "&:after": {
        borderBottomColor: theme.palette.primary.main,
        borderWidth: 2
      },
      "&:before": {
        borderColor: "lightgray",
        borderWidth: 1
      }
    },
    helperTextRoot: {
      color: theme.palette.primary.main
    },
    icon: {
      color: theme.palette.primary.light
    }
  };
};

export default styles;

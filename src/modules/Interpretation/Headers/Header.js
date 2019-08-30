import React from "react";
import { Box, Typography } from "@material-ui/core";
import css from "./styles.scss";

export default function Header({ color, range, name }) {
  return (
    <Box
      display="flex"
      pl={0.5}
      pr={0.5}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      className={css.header}
      style={{ backgroundColor: color }}
    >
      <Typography variant="caption">{range[0]}</Typography>
      <Typography variant="caption">{name}</Typography>
      <Typography variant="caption">{range[1]}</Typography>
    </Box>
  );
}

Header.defaultProps = {
  range: []
};

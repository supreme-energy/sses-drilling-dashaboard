import React from "react";
import TableCell from "@material-ui/core/TableCell";
import { Box } from "@material-ui/core";
import classNames from "classnames";
import css from "./styles.scss";

export default function Header({ fields }) {
  return (
    <Box className={css.header} display="flex" flexDirection="row">
      {fields.map(f => (
        <TableCell size="small" component="div" className={classNames("flex", css.headCell)} variant="head">
          {f}
        </TableCell>
      ))}
    </Box>
  );
}

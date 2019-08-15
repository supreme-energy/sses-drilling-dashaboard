import React from "react";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import classes from "./styles.scss";

export default function DataTable({ handleClose, isVisible, data, graph }) {
  return (
    <Dialog className={classes.root} onClose={handleClose} open={isVisible}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell>MD</TableCell>
            <TableCell align="right">{graph}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell component="th" scope="row">
                {row.md}
              </TableCell>
              <TableCell align="right">{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Dialog>
  );
}

DataTable.propTypes = {
  handleClose: PropTypes.func,
  isVisible: PropTypes.bool,
  data: PropTypes.array,
  graph: PropTypes.string
};

import React, { useMemo } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import classNames from "classnames";

import { useFilteredWellData } from "../../../App/Containers";
import classes from "./Details.scss";

function SurveyIcon({ row }) {
  const surveyMarker = <img src="/survey.svg" />;
  const lastSurveyMarker = <img src="/lastSurvey.svg" />;
  const bitProjMarker = <img src="/bitProjection.svg" />;
  const PAMarker = <img src="/projectAhead.svg" />;
  if (row.isProjection) {
    return PAMarker;
  } else if (row.isBitProj) {
    return bitProjMarker;
  } else if (row.isLastSurvey) {
    return lastSurveyMarker;
  } else {
    return surveyMarker;
  }
}

export default function DetailsTable(props) {
  const { selected } = props;
  // const { surveys, projections } = useFilteredWellData();
  // const rawSections = useMemo(() => surveys.concat(projections), [surveys, projections]);
  const details = selected && selected.prevOp ? [selected.prevOp, selected.op, selected.nextOp] : [];

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell className={classes.cell}>Survey</TableCell>
          <TableCell className={classes.cell}>Depth</TableCell>
          <TableCell className={classes.cell}>Inclination</TableCell>
          <TableCell className={classes.cell}>Azimuth</TableCell>
          <TableCell className={classes.cell}>TVD</TableCell>
          <TableCell className={classes.cell}>Dog Leg</TableCell>
          <TableCell className={classes.cell}>VS</TableCell>
          <TableCell className={classes.cell}>Fault</TableCell>
          <TableCell className={classes.cell}>Dip</TableCell>
          <TableCell className={classes.cell}>TCL</TableCell>
          <TableCell className={classes.cell}>Pos-TCL</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {details.map(row => (
          <TableRow
            key={row.id}
            className={classNames(classes.row, {
              [classes.PARow]: row.isProjection,
              [classes.surveyRow]: row.isSurvey,
              [classes.lastSurveyRow]: row.isLastSurvey,
              [classes.bitProjRow]: row.isBitProj
            })}
          >
            <TableCell className={classes.cell} component="th" scope="row">
              <SurveyIcon row={row} />
              {row.id}
            </TableCell>
            <TableCell className={classes.cell}>{row.md}</TableCell>
            <TableCell className={classes.cell}>{row.inc}</TableCell>
            <TableCell className={classes.cell}>{row.azm}</TableCell>
            <TableCell className={classes.cell}>{row.tvd.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.dl}</TableCell>
            <TableCell className={classes.cell}>{row.vs}</TableCell>
            <TableCell className={classes.cell}>{row.fault}</TableCell>
            <TableCell className={classes.cell}>{row.dip}</TableCell>
            <TableCell className={classes.cell}>{row.tcl.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.pos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

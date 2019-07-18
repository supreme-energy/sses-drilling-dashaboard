import React, { useMemo } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import classNames from "classnames";

import surveySVG from "../../../../assets/survey.svg";
import lastSurveySVG from "../../../../assets/lastSurvey.svg";
import bitProjectionSVG from "../../../../assets/bitProjection.svg";
import projectAheadSVG from "../../../../assets/projectAhead.svg";
import classes from "./Details.scss";
import { useCrossSectionContainer } from "../../../App/Containers";

function SurveyIcon({ row }) {
  const surveyMarker = <img src={surveySVG} />;
  const lastSurveyMarker = <img src={lastSurveySVG} />;
  const bitProjMarker = <img src={bitProjectionSVG} />;
  const PAMarker = <img src={projectAheadSVG} />;
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

export default function DetailsTable({ showFullTable = false }) {
  const { selectedSections, calcSections } = useCrossSectionContainer();
  let details;

  if (showFullTable) {
    details = calcSections.slice().reverse();
  } else {
    const selectedIndex = useMemo(() => {
      return calcSections.findIndex(s => selectedSections[s.id]);
    }, [calcSections, selectedSections]);
    details = calcSections.slice(selectedIndex - 2, selectedIndex + 1).reverse();
  }

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow className={classes.row}>
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
              {row.name}
            </TableCell>
            <TableCell className={classes.cell}>{row.md.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.inc.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.azm.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.tvd.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.dl.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.vs.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.fault.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.dip.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{row.tcl.toFixed(2)}</TableCell>
            <TableCell className={classes.cell}>{(row.tcl - row.tvd).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

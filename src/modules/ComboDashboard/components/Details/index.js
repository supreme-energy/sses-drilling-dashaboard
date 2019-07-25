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
import trashcanIcon from "../../../../assets/deleteForever.svg";
import classes from "./Details.scss";
import { useCrossSectionContainer } from "../../../App/Containers";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";

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

function Cell(value, editable, changeHandler, field) {
  if (editable) {
    return (
      <TextField
        id={field}
        value={value}
        onChange={e => changeHandler(e.target.value)}
        type="number"
        className={classNames(classes.textField, classes.cell)}
        InputLabelProps={{
          shrink: true
        }}
      />
    );
  } else {
    return <TableCell className={classes.cell}>{value}</TableCell>;
  }
}

export default function DetailsTable({ showFullTable = false }) {
  const { selectedSections, calcSections } = useCrossSectionContainer();
  let details;

  const selectedIndex = useMemo(() => {
    return calcSections.findIndex(s => selectedSections[s.id]);
  }, [calcSections, selectedSections]);
  const selectedId = (calcSections[selectedIndex] || {}).id;

  if (showFullTable) {
    details = calcSections.slice().reverse();
  } else {
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
          {showFullTable && <TableCell className={classes.cell}>TOT</TableCell>}
          {showFullTable && <TableCell className={classes.cell}>BOT</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {details.map(row => {
          const editable = selectedId === row.id && !showFullTable;
          return (
            <TableRow
              key={row.id}
              className={classNames(classes.row, {
                [classes.PARow]: row.isProjection,
                [classes.surveyRow]: row.isSurvey,
                [classes.lastSurveyRow]: row.isLastSurvey,
                [classes.bitProjRow]: row.isBitProj,
                [classes.selected]: selectedId === row.id
              })}
            >
              <TableCell className={classes.cell} component="th" scope="row">
                <SurveyIcon row={row} />
                {row.name}
              </TableCell>
              {Cell(row.md.toFixed(2), editable, v => console.log(v))}
              {Cell(row.inc.toFixed(2), editable, v => console.log(v))}
              {Cell(row.azm.toFixed(2), editable, v => console.log(v))}
              {Cell(row.tvd.toFixed(2), editable, v => console.log(v))}
              {Cell(row.dl.toFixed(2), false)}
              {Cell(row.vs.toFixed(2), editable, v => console.log(v))}
              {Cell(row.fault.toFixed(2), editable, v => console.log(v))}
              {Cell(row.dip.toFixed(2), editable, v => console.log(v))}
              {Cell(row.tcl.toFixed(2), editable, v => console.log(v))}
              {Cell((row.tcl - row.tvd).toFixed(2), editable, v => console.log(v))}
              {showFullTable && Cell(row.tot.toFixed(2), false)}
              {showFullTable && Cell(row.bot.toFixed(2), false)}
              <TableCell className={classNames(classes.cell, classes.actions)}>
                <IconButton
                  size="small"
                  aria-label="Delete row"
                  onClick={() => {
                    console.log(row.name);
                  }}
                >
                  <img src={trashcanIcon} />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

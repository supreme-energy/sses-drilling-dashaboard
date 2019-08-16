import React, { useMemo } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import classNames from "classnames";

import { useCrossSectionContainer } from "../../../App/Containers";
import Knob from "./knob";
import surveySVG from "../../../../assets/survey.svg";
import lastSurveySVG from "../../../../assets/lastSurvey.svg";
import bitProjectionSVG from "../../../../assets/bitProjection.svg";
import projectAheadSVG from "../../../../assets/projectAhead.svg";
import trashcanIcon from "../../../../assets/deleteForever.svg";
import classes from "./Details.scss";
import { useComboContainer } from "../../containers/store";

function SurveyIcon({ row }) {
  let sourceType;
  if (row.isProjection) {
    sourceType = projectAheadSVG;
  } else if (row.isBitProj) {
    sourceType = bitProjectionSVG;
  } else if (row.isLastSurvey) {
    sourceType = lastSurveySVG;
  } else {
    sourceType = surveySVG;
  }
  return <img className={classes.marker} src={sourceType} alt="survey type icon" />;
}

const iconStyle = {
  marginRight: 0
};

function Cell(value, editable, changeHandler, Icon) {
  if (editable) {
    return (
      <TextField
        value={value}
        onChange={e => changeHandler(e.target.value)}
        type="number"
        className={classNames(classes.textField, classes.cell)}
        InputLabelProps={{
          shrink: true
        }}
        InputProps={
          Icon && {
            startAdornment: (
              <InputAdornment position="start" style={iconStyle}>
                <Icon className={classes.icon} />
              </InputAdornment>
            )
          }
        }
      />
    );
  } else {
    return <TableCell className={classes.cell}>{value}</TableCell>;
  }
}

export default function DetailsTable({ showFullTable = false }) {
  const { selectedSections, calcSections } = useCrossSectionContainer();
  const [, , { updateSegments }] = useComboContainer();
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
          const update = field => {
            return value => updateSegments({ [row.md]: { [field]: Number(value) } });
          };
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
              {Cell(row.md.toFixed(2), editable, update("md"))}
              {Cell(row.inc.toFixed(2), editable, update("inc"))}
              {Cell(row.azm.toFixed(2), editable, update("azm"))}
              {Cell(row.tvd.toFixed(2), editable, update("tvd"))}
              {Cell(row.dl.toFixed(2), false)}
              {Cell(row.vs.toFixed(2), editable, update("vs"))}
              {Cell(row.fault.toFixed(2), editable, update("fault"), a =>
                Knob({
                  ...a,
                  fill: `#${row.color.toString(16).padStart(6, 0)}`,
                  outline: `#${row.selectedColor.toString(16).padStart(6, 0)}`
                })
              )}
              {Cell(row.dip.toFixed(2), editable, update("dip"), a =>
                Knob({ ...a, fill: `#${row.color.toString(16).padStart(6, 0)}`, outline: "#FFF" })
              )}
              {Cell(row.tcl.toFixed(2), editable, update("tcl"))}
              {Cell((row.tcl - row.tvd).toFixed(2), editable, console.log)}
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

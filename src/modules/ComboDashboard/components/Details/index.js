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
import projectAheadSVG from "../../../../assets/projectionAutoDip.svg";
import projectionStatic from "../../../../assets/projectionStatic.svg";
import projectionDirectional from "../../../../assets/projectionDirectional.svg";
import trashcanIcon from "../../../../assets/deleteForever.svg";
import classes from "./Details.scss";
import { useUpdateSegmentsById } from "../../../Interpretation/actions";
import { MD_INC_AZ, TVD_VS } from "../../../../constants/calcMethods";
import { useSaveSurveysAndProjections } from "../../../App/actions";

function SurveyIcon({ row }) {
  let sourceType;
  if (row.isProjection) {
    if (row.method === TVD_VS) {
      sourceType = projectionStatic;
    } else if (row.method === MD_INC_AZ) {
      sourceType = projectionDirectional;
    } else {
      sourceType = projectAheadSVG;
    }
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

function Cell(value, editable, changeHandler, markAsInput = false, Icon) {
  if (editable) {
    return (
      <TextField
        value={value}
        onChange={e => changeHandler(e.target.value)}
        type="number"
        className={classNames(classes.textField, classes.cell, { [classes.methodInput]: markAsInput })}
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
  const { selectedSections, calcSections, deleteProjection } = useCrossSectionContainer();
  const updateSegments = useUpdateSegmentsById();
  const { debouncedSave } = useSaveSurveysAndProjections();

  const selectedIndex = useMemo(() => {
    return calcSections.findIndex(s => selectedSections[s.id]);
  }, [calcSections, selectedSections]);
  const selectedId = useMemo(() => (calcSections[selectedIndex] || {}).id, [calcSections, selectedIndex]);

  const details = useMemo(() => {
    if (showFullTable) {
      return calcSections.slice().reverse();
    } else {
      return calcSections.slice(selectedIndex - 2, selectedIndex + 1).reverse();
    }
  }, [calcSections, showFullTable, selectedIndex]);

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
          {showFullTable && <TableCell className={classes.cell}>NS</TableCell>}
          {showFullTable && <TableCell className={classes.cell}>EW</TableCell>}
          <TableCell className={classes.cell}>Fault</TableCell>
          <TableCell className={classes.cell}>Dip</TableCell>
          <TableCell className={classes.cell}>TCL</TableCell>
          <TableCell className={classes.cell}>Pos-TCL</TableCell>
          {showFullTable && <TableCell className={classes.cell}>TOT</TableCell>}
          {showFullTable && <TableCell className={classes.cell}>BOT</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {details.map((row, index) => {
          const editable = selectedId === row.id && !showFullTable;
          const update = (field, method) => {
            return value => {
              updateSegments({ [row.id]: { [field]: Number(value), ...(method && { method }) } });
              debouncedSave();
            };
          };
          return (
            <TableRow
              key={`${row.id}${index}`}
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
              {Cell(row.md.toFixed(2), editable, update("md", MD_INC_AZ), row.method === MD_INC_AZ)}
              {Cell(row.inc.toFixed(2), editable, update("inc", MD_INC_AZ), row.method === MD_INC_AZ)}
              {Cell(row.azm.toFixed(2), editable, update("azm", MD_INC_AZ), row.method === MD_INC_AZ)}
              {Cell(row.tvd.toFixed(2), editable && row.isProjection, update("tvd", TVD_VS), row.method === TVD_VS)}
              {Cell(row.dl.toFixed(2), false)}
              {Cell(row.vs.toFixed(2), editable && row.isProjection, update("vs", TVD_VS), row.method === TVD_VS)}
              {showFullTable && Cell(row.ns.toFixed(2), false)}
              {showFullTable && Cell(row.ew.toFixed(2), false)}
              {Cell(row.fault.toFixed(2), editable, update("fault"), false, a =>
                Knob({
                  ...a,
                  fill: `#${row.color.toString(16).padStart(6, 0)}`,
                  outline: `#${row.selectedColor.toString(16).padStart(6, 0)}`
                })
              )}
              {Cell(row.dip.toFixed(2), editable, update("dip"), false, a =>
                Knob({ ...a, fill: `#${row.color.toString(16).padStart(6, 0)}`, outline: "#FFF" })
              )}
              {Cell(row.tcl.toFixed(2), false)}
              {Cell(row.pos.toFixed(2), false)}
              {showFullTable && Cell(row.tot.toFixed(2), false)}
              {showFullTable && Cell(row.bot.toFixed(2), false)}
              <TableCell className={classNames(classes.cell, classes.actions)}>
                {row.isProjection && (
                  <IconButton
                    size="small"
                    aria-label="Delete row"
                    onClick={() => {
                      deleteProjection(row.id);
                    }}
                  >
                    <img src={trashcanIcon} />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
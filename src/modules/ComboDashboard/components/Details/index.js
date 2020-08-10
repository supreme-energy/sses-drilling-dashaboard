import React, { useMemo, useCallback, useEffect, useState } from "react";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import classNames from "classnames";

import { useCrossSectionContainer } from "../../../App/Containers";
import Knob from "./knob";
import surveySVG from "../../../../assets/survey.svg";
import tieInSVG from "../../../../assets/tieIn.svg";
import lastSurveySVG from "../../../../assets/lastSurvey.svg";
import bitProjectionSVG from "../../../../assets/bitProjection.svg";
import projectAheadSVG from "../../../../assets/projectionAutoDip.svg";
import projectionStatic from "../../../../assets/projectionStatic.svg";
import projectionDirectional from "../../../../assets/projectionDirectional.svg";
import trashcanIcon from "../../../../assets/deleteForever.svg";
import classes from "./Details.scss";
import { useUpdateSegmentsById, useSelectionActions } from "../../../Interpretation/actions";
import { MD_INC_AZ, TVD_VS } from "../../../../constants/calcMethods";
import { useSaveSurveysAndProjections } from "../../../App/actions";
import { limitAzm } from "../CrossSection/formulas";
import { EMPTY_FIELD } from "../../../../constants/format";
import isNumber from "../../../../utils/isNumber";
import useRef from "react-powertools/hooks/useRef";
import { NumericTextField, withFocusState } from "../../../../components/DebouncedInputs";
import { List } from "react-virtualized";
import { useComboContainer } from "../../containers/store";
import { useSize } from "react-hook-size";

const noRowsRenderer = () => <div>No data</div>;

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
  } else if (row.isTieIn) {
    sourceType = tieInSVG;
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

const NumericInputCell = withFocusState(props => (
  <NumericTextField {...props} onChange={value => props.isFocused && props.onChange(value)} />
));

const TextFieldCell = ({ markAsInput, icon, onChange, value }) => {
  const internalState = useRef({ handleChange: onChange });
  internalState.current.handleChange = onChange;
  const Icon = icon;
  const el = useMemo(
    () => (
      <NumericInputCell
        value={value}
        type="number"
        onChange={internalState.current.handleChange}
        className={classNames(classes.textField, classes.cell, { [classes.methodInput]: markAsInput })}
        InputLabelProps={{
          shrink: true
        }}
        InputProps={
          icon && {
            startAdornment: (
              <InputAdornment position="start" style={iconStyle}>
                <Icon className={classes.icon} />
              </InputAdornment>
            )
          }
        }
      />
    ),
    [icon, markAsInput, value]
  );
  return el;
};

function Cell(value, editable, changeHandler, markAsInput = false, Icon) {
  if (editable) {
    return (
      <TextFieldCell value={value} onChange={changeHandler} markAsInput={markAsInput} icon={Icon} defaultStep={0.25} />
    );
  } else {
    return (
      <TableCell component="div" className={classes.cell}>
        {(isNumber(value) && value.toFixed(2)) || EMPTY_FIELD}
      </TableCell>
    );
  }
}

const VirtualizedList = ({ data, selectedIndex, ...props }) => {
  const [scrollTop, changeScrollTop] = useState(0);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const { width, height } = useSize(containerRef);
  const nrItems = data.length;
  const [{ enforceSelectionInTableViewportId }] = useComboContainer();
  const handleMouseWheel = useCallback(
    e => {
      const inputTarget = e.target && e.target.tagName.toLowerCase() === "input";
      const mouseWheelOverFocusedInput = inputTarget && e.target === document.activeElement;

      if (!mouseWheelOverFocusedInput) {
        changeScrollTop(st =>
          Math.min(Math.max(st - e.wheelDeltaY / 3, 0), gridRef.current.Grid._scrollingContainer.scrollHeight - height)
        );
        e.preventDefault();
      }
    },
    [height]
  );

  useEffect(() => {
    const scrollingContainer = containerRef.current;
    scrollingContainer && scrollingContainer.addEventListener("wheel", handleMouseWheel);
    return () => scrollingContainer && scrollingContainer.removeEventListener("wheel", handleMouseWheel);
  }, [handleMouseWheel]);

  useEffect(
    function scrollToSelection() {
      gridRef.current.scrollToRow(nrItems - selectedIndex - 1);
    },
    [selectedIndex, nrItems, enforceSelectionInTableViewportId]
  );
  return (
    <div ref={containerRef} className={classes.tbody}>
      <List
        {...props}
        ref={gridRef}
        className={classes.grid}
        height={height}
        scrollTop={scrollTop}
        overscanRowCount={1}
        noRowsRenderer={noRowsRenderer}
        rowCount={nrItems}
        rowHeight={42}
        width={width}
      />
    </div>
  );
};

export default function DetailsTable({ showFullTable = false }) {
  const { selectedSections, calcSections, deleteProjection, deleteSurvey } = useCrossSectionContainer();
  const updateSegments = useUpdateSegmentsById();
  const { debouncedSave } = useSaveSurveysAndProjections();

  const { changeSelection } = useSelectionActions();

  const selectedIndex = useMemo(() => {
    return calcSections.findIndex(s => selectedSections[s.id]);
  }, [calcSections, selectedSections]);
  const selectedId = useMemo(() => (calcSections[selectedIndex] || {}).id, [calcSections, selectedIndex]);

  const details = useMemo(() => calcSections.slice().reverse(), [calcSections]);

  const rowRenderer = useCallback(
    ({ index, style, key }) => {
      const row = details[index];

      const editable = selectedId === row.id && !showFullTable;
      const rowColor = row.color || "";
      const rowSelectionColor = row.selectedColor || "";
      const update = (field, method) => {
        return value => {
          updateSegments({ [row.id]: { [field]: Number(value), ...(method && { method }) } });
          debouncedSave();
        };
      };

      const deleteDisabled = row.isSurvey && !row.isLastSurvey;
      return (
        <TableRow
          style={style}
          component="div"
          key={key}
          className={classNames(classes.row, {
            [classes.PARow]: row.isProjection,
            [classes.surveyRow]: row.isSurvey,
            [classes.lastSurveyRow]: row.isLastSurvey,
            [classes.bitProjRow]: row.isBitProj,
            [classes.selected]: selectedId === row.id
          })}
        >
          <TableCell
            className={classNames(classes.cell, classes.buttonMode)}
            component="div"
            onClick={() => changeSelection(row.id, true, true)}
          >
            <SurveyIcon row={row} />
            {row.name}
          </TableCell>
          {Cell(row.md, editable || row.isTieIn, update("md", MD_INC_AZ), row.method === MD_INC_AZ)}
          {Cell(row.inc, editable || row.isTieIn, update("inc", MD_INC_AZ), row.method === MD_INC_AZ)}
          {Cell(row.azm, editable || row.isTieIn, v => update("azm", row.method)(limitAzm(v)), row.method === MD_INC_AZ)}
          {Cell(row.tvd, (editable && row.isProjection) || row.isTieIn, update("tvd", TVD_VS), row.method === TVD_VS)}
          {Cell(row.dl, false)}
          {Cell(row.vs, (editable && row.isProjection) || row.isTieIn, update("vs", TVD_VS), row.method === TVD_VS)}
          {Cell(row.ns, row.isTieIn, update("ns"))}
          {Cell(row.ew, row.isTieIn, update("ew"))}
          {Cell(row.fault, editable, update("fault"), false, a =>
            Knob({
              ...a,
              fill: `#${rowColor.toString(16).padStart(6, 0)}`,
              outline: `#${rowSelectionColor.toString(16).padStart(6, 0)}`
            })
          )}
          {Cell(row.dip, editable, update("dip"), false, a =>
            Knob({ ...a, fill: `#${rowColor.toString(16).padStart(6, 0)}`, outline: "#FFF" })
          )}
          {Cell(row.tcl, false)}
          {Cell(row.pos, false)}
          {showFullTable && Cell(row.tot, false)}
          {showFullTable && Cell(row.bot, false)}
          <TableCell className={classNames(classes.cell, classes.actions)} component="div">
            {(row.isProjection || row.isSurvey) && (
              <IconButton
                size="small"
                className={classNames({ [classes.deleteDisabled]: deleteDisabled })}
                disabled={deleteDisabled}
                aria-label="Delete row"
                onClick={() => {
                  row.isProjection ? deleteProjection(row.id) : deleteSurvey(row.id);
                }}
              >
                <img src={trashcanIcon} />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
      );
    },
    [debouncedSave, details, selectedId, showFullTable, deleteProjection, updateSegments, changeSelection, deleteSurvey]
  );

  return (
    <Table className={classNames(classes.table, classes.flexTable, classes.comboTable)}>
      <TableHead>
        <TableRow className={classes.row} component="div">
          <TableCell component="div" className={classes.cell}>
            Survey
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Depth
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Inclination
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Azimuth
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            TVD
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Dog Leg
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            VS
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            NS
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            EW
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Fault
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Dip
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            TCL
          </TableCell>
          <TableCell component="div" className={classes.cell}>
            Pos-TCL
          </TableCell>
          {showFullTable && (
            <TableCell component="div" className={classes.cell}>
              TOT
            </TableCell>
          )}
          {showFullTable && (
            <TableCell component="div" className={classes.cell}>
              BOT
            </TableCell>
          )}
          <div className={classNames(classes.cell, classes.actions)} />
        </TableRow>
      </TableHead>

      <VirtualizedList data={details} rowRenderer={rowRenderer} selectedIndex={selectedIndex} />
    </Table>
  );
}

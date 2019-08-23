import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemText,
  List,
  ListItemIcon,
  Paper
} from "@material-ui/core";
import ArrowForward from "@material-ui/icons/ArrowForward";
import ArrowBack from "@material-ui/icons/ArrowBack";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import _ from "lodash";

import { useAdditionalDataLog, useAdditionalDataLogsList } from "../../../../api";
import { useWellIdContainer } from "../../../App/Containers";
import ColorPicker from "../ColorPicker";
import DataTable from "./DataTable";
import ScalePlotIcon from "../../../../assets/scalePlot.svg";
import TableChartIcon from "../../../../assets/tableChart.svg";

import classes from "./styles.scss";

function SettingsMenu({
  isVisible,
  view,
  setMenu,
  handleRemoveGraph,
  graph,
  data,
  setSelectedGraph,
  selectedGraphs,
  currentGraphs
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDataTableVisible, handleDataTable] = useState(false);
  const { wellId } = useWellIdContainer();
  const { dataBySection = {} } = useAdditionalDataLogsList(wellId);
  const { updateAdditionalLogDetails } = useAdditionalDataLog(wellId);

  const handleSaveColor = hex => {
    const id = dataBySection[view].id;
    const color = hex.substring(1);
    setSelectedGraph({ ...selectedGraphs, [view]: { ...selectedGraphs[view], color } });
    updateAdditionalLogDetails(wellId, { id, color });
    handleClosePicker();
  };

  const handleCloseModal = () => {
    setMenu(d => {
      return { ...d, isSettingsVisible: false };
    });
  };

  const handleArrowClickBack = () =>
    setMenu(d => {
      const currentIndex = currentGraphs.findIndex(graph => graph === d.settingsView);
      if (currentIndex === 0) {
        return { ...d, settingsView: graph };
      } else if (currentIndex < 0) {
        return { ...d, settingsView: currentGraphs[currentGraphs.length - 1] };
      } else {
        return { ...d, settingsView: currentGraphs[currentIndex - 1] };
      }
    });

  const handleArrowClickForward = () =>
    setMenu(d => {
      const currentIndex = currentGraphs.findIndex(graph => graph === d.settingsView);
      if (currentIndex === currentGraphs.length - 1) {
        return { ...d, settingsView: graph };
      } else if (currentIndex < 0) {
        return { ...d, settingsView: currentGraphs[0] };
      } else {
        return { ...d, settingsView: currentGraphs[currentIndex + 1] };
      }
    });

  const handleOpenPicker = event => {
    const open = Boolean(anchorEl);
    setAnchorEl(!open ? event.currentTarget : null);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleRemoveGraph(graph);
  };

  const handleOpenDataTable = () => {
    handleDataTable(true);
  };

  const handleCloseDataTable = () => {
    handleDataTable(false);
  };

  return (
    <Dialog onClose={handleCloseModal} open={isVisible}>
      <DialogTitle className={classes.dialogTitle}>
        <IconButton aria-label="arrow-back" onClick={handleArrowClickBack}>
          <ArrowBack />
        </IconButton>
        <span>{view}</span>
        <IconButton aria-label="arrow-forward" onClick={handleArrowClickForward}>
          <ArrowForward />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <List>
          <ListItem button onClick={handleOpenPicker}>
            <ListItemIcon>
              <Paper>
                <div
                  style={{
                    height: 25,
                    width: 25,
                    backgroundColor: `#${_.get(selectedGraphs, `[${view}].color`)}`
                  }}
                />
              </Paper>
            </ListItemIcon>
            <ListItemText primary="Edit Style" />
          </ListItem>
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <img src={ScalePlotIcon} className={classes.icon} />
            </ListItemIcon>
            <ListItemText primary="Edit Bias and Scale" />
          </ListItem>
          <ListItem button onClick={handleOpenDataTable}>
            <ListItemIcon>
              <img src={TableChartIcon} className={classes.icon} />
            </ListItemIcon>
            <ListItemText primary="DataTable" />
          </ListItem>
          <ListItem button onClick={handleDelete}>
            <ListItemIcon>
              <RemoveCircle />
            </ListItemIcon>
            <ListItemText primary="Remove Chart" />
          </ListItem>
        </List>
      </DialogContent>

      <ColorPicker
        color={_.get(selectedGraphs, `[${view}].color`)}
        handleClose={handleClosePicker}
        handleSave={handleSaveColor}
        anchorEl={anchorEl}
      />
      <DataTable isVisible={isDataTableVisible} handleClose={handleCloseDataTable} data={data} graph={graph} />
    </Dialog>
  );
}

SettingsMenu.propTypes = {
  isVisible: PropTypes.bool,
  graph: PropTypes.string,
  view: PropTypes.string,
  setMenu: PropTypes.func,
  handleRemoveGraph: PropTypes.func,
  data: PropTypes.array,
  setSelectedGraph: PropTypes.func,
  currentGraphs: PropTypes.arrayOf(PropTypes.string),
  selectedGraphs: PropTypes.object
};

export default SettingsMenu;

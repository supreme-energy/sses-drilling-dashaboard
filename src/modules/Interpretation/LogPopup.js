import React from "react";
import ScalePlotIcon from "../../../../assets/scalePlot.svg";
import { List } from "immutable";
import { ListItem, ListItemIcon, ListItemText, Paper } from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";
import _ from "lodash";

export default function LogPopup({ handleOpenPicker, selectedLogs, view, handleEditScale, handleDelete }) {
  return (
    <List>
      <ListItem button onClick={handleOpenPicker}>
        <ListItemIcon>
          <Paper>
            <div
              style={{
                height: 25,
                width: 25,
                backgroundColor: `#${_.get(selectedLogs, `[${view}].color`)}`
              }}
            />
          </Paper>
        </ListItemIcon>
        <ListItemText primary="Edit Style" />
      </ListItem>
      <ListItem button onClick={handleEditScale}>
        <ListItemIcon>
          <img src={ScalePlotIcon} />
        </ListItemIcon>
        <ListItemText primary="Edit Bias and Scale" />
      </ListItem>
      <ListItem button onClick={handleDelete}>
        <ListItemIcon>
          <RemoveCircle />
        </ListItemIcon>
        <ListItemText primary="Remove Chart" />
      </ListItem>
    </List>
  );
}

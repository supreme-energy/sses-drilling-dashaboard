import React from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon } from "@material-ui/core";
import classes from "./WelcomeCard.scss";
import Add from "@material-ui/icons/Add";
import Import from "@material-ui/icons/Input";
import { listIcons } from "../IconsByStatus";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_INFO } from "../../../../api";

function LastEditedWell({ well }) {
  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        Last time you were editing the well
      </Typography>
      <div>{name}</div>
      <Typography variant="body2" gutterBottom>
        {`${well.position[0]}  |  ${well.position[1]}`}
      </Typography>

      <div className={classes.row}>
        <DrillingStatus status={well.status} />
      </div>
    </div>
  );
}

function DrillingStatus({ status }) {
  return (
    <div className={classes.row}>
      <img className={classes.statusIcon} src={listIcons[status]} />
      <span>{status}</span>
    </div>
  );
}

export default function WelcomeCard({ theme, lastEditedWell }) {
  const wellInfo = useFetch(lastEditedWell && { path: GET_WELL_INFO, query: { seldbname: lastEditedWell.id } });
  console.log("wellInfo", wellInfo);
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h4" gutterBottom color="primary">
          Welcome to Subsurface Geological Tracking Analysis
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Select an existing well by searching for a well, selecting from the list on the left, or the map below.
        </Typography>
        <div className={classes.cardContent}>
          <div>
            <List className={classes.list}>
              <ListItem className={classes.listItem} color="primary">
                <ListItemIcon>
                  <div className={classes.iconBg} style={{ background: theme.palette.primary.main }}>
                    <Add color="white" />
                  </div>
                </ListItemIcon>
                <ListItemText>Create a new Well</ListItemText>
              </ListItem>
              <ListItem className={classes.listItem} color="primary">
                <ListItemIcon>
                  <Import color="primary" />
                </ListItemIcon>
                <ListItemText>Import a new Well</ListItemText>
              </ListItem>
            </List>
          </div>
          <span className={classes.hSpacer} />
          {lastEditedWell ? <LastEditedWell well={lastEditedWell} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon, Button } from "@material-ui/core";
import classes from "./WelcomeCard.scss";
import Add from "@material-ui/icons/Add";
import Import from "@material-ui/icons/Input";
import { listIcons } from "../IconsByStatus";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_INFO } from "../../../../api";
import { Link } from "react-router-dom";
import classNames from "classnames";

const LastEditedWell = ({ lastEditedWell, selectedWell }) => {
  const well = selectedWell || lastEditedWell;

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        Last time you were opened the well
      </Typography>
      <div>{well.name}</div>
      <Typography variant="body2" gutterBottom>
        {`${well.position[0]}  |  ${well.position[1]}`}
      </Typography>

      <div className={classes.row}>
        <DrillingStatus status={well.status} className={classes.status} />

        <Link to={`/${well.id}/combo`}>
          <Button variant="contained" color="primary">
            {selectedWell ? "Continue" : "Reopen"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

const DrillingStatus = ({ status, className }) => {
  return (
    <div className={classNames(className, classes.status)}>
      <img className={classes.statusIcon} src={listIcons[status]} />
      <span>{status}</span>
    </div>
  );
};

function WelcomeCard({ theme, lastEditedWell, selectedWell }) {
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
          {lastEditedWell || selectedWell ? (
            <LastEditedWell lastEditedWell={lastEditedWell} selectedWell={selectedWell} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeCard;

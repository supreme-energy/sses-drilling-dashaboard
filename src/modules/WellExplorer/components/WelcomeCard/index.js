import React from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon, Button } from "@material-ui/core";
import classes from "./WelcomeCard.scss";
import Add from "@material-ui/icons/Add";
import Import from "@material-ui/icons/Input";
import { BitDepth, Rop } from "../../../Kpi/KpiItem";
import { Link } from "react-router-dom";
import WellStatus from "../../../Kpi/WellStatus";
import ServerStatus from "../../../Kpi/ServerStatus";
import WellPathStatus from "../../../Kpi/WellPathStatus";
import classNames from "classnames";

const LastEditedWell = ({ lastEditedWell, openedWell }) => {
  const well = openedWell || lastEditedWell;

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        Last time you were opened the well
      </Typography>
      <div>{well.name}</div>
      <Typography variant="body2" gutterBottom>
        {`${well.surfacePosition[0]}  |  ${well.surfacePosition[1]}`}
      </Typography>

      <div className={classes.row}>
        <WellStatus status={well.status} className={classes.status} />
        <span className={classes.hBigSpacer} />
        <WellPathStatus wellId={well.id} />
        <Link to={`/${well.id}/combo`}>
          <Button variant="contained" color="primary">
            {openedWell ? "Continue" : "Reopen"}
          </Button>
        </Link>
      </div>
      <div className={classes.row}>
        <Rop wellId={well.id} />
        <span className={classes.hBigSpacer} />
        <ServerStatus wellId={well.id} />
        <span className={classes.hBigSpacer} />
        <BitDepth wellId={well.id} />
      </div>
    </div>
  );
};

function WelcomeCard({ theme, lastEditedWell, openedWell, className, onFilesToImportChange }) {
  return (
    <Card className={classNames(classes.card, className)}>
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
                    <Add />
                  </div>
                </ListItemIcon>
                <ListItemText>Create a new Well</ListItemText>
              </ListItem>
              <input
                onChange={onFilesToImportChange}
                accept=".csv, .las, .laz"
                id="raised-button-file"
                type="file"
                className={classes.importNewInput}
              />
              <label htmlFor="raised-button-file" className={classes.listItem}>
                <ListItem color="primary">
                  <ListItemIcon>
                    <Import color="primary" />
                  </ListItemIcon>
                  <ListItemText>Import a new Well</ListItemText>
                </ListItem>
              </label>
            </List>
          </div>
          <span className={classes.hSpacer} />
          {lastEditedWell || openedWell ? (
            <LastEditedWell lastEditedWell={lastEditedWell} openedWell={openedWell} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeCard;

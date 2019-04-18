import React from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon } from "@material-ui/core";
import classes from "./WelcomeCard.scss";
import Add from "@material-ui/icons/Add";
import Import from "@material-ui/icons/Input";

export default function WelcomeCard({ theme, lastEditedWell }) {
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
          <div>
            <Typography variant="subtitle1" gutterBottom>
              Last time you were editing the well
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import classes from "./WellList.scss";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Favorite from "@material-ui/icons/Favorite";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import classNames from "classnames";
import { DRILLING, UNKNOWN, TRIPPING } from "../../../../../constants/drillingStatus";

const styles = theme => ({
  [DRILLING]: {
    backgroundColor: theme.drillingStatusColor
  },

  [TRIPPING]: {
    backgroundColor: theme.trippingStatusColor
  }
});

const ArrowWithBackground = ({ children, classes: withStylesClasses, status }) => {
  return <div className={classNames(classes.arrowBg, withStylesClasses[status])}>{children}</div>;
};

const TrippingArrowBg = withStyles(styles)(ArrowWithBackground);
const DrillingArrowBg = withStyles(styles)(ArrowWithBackground);

const iconsByStatus = {
  [DRILLING]: (
    <DrillingArrowBg status={DRILLING}>
      <ArrowDownward className={classes.arrowIcon} />
    </DrillingArrowBg>
  ),
  [UNKNOWN]: null, // to be provided
  [TRIPPING]: (
    <TrippingArrowBg status={TRIPPING}>
      <ArrowUpward className={classes.arrowIcon} />
    </TrippingArrowBg>
  )
};

const WellItem = ({ name, theme, lat, lng, status }) => {
  return (
    <ListItem button className={classes.wellItem}>
      <div className={classes.itemContent}>
        <div>{name}</div>
        <Typography variant="body2" gutterBottom>
          {`${lat}  |  ${lng}`}{" "}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {status.toUpperCase()}
        </Typography>
      </div>
      <div className={classes.buttons}>
        <Favorite className={classes.icon} />
        {iconsByStatus[status]}
      </div>
    </ListItem>
  );
};

function WellList({ items, theme, ...props }) {
  return (
    <List className={classes.list} {...props}>
      {items.map(well => (
        <WellItem key={well.id} name={well.name} lat={33.634269} lng={-97.3711399} status={well.status} />
      ))}
    </List>
  );
}

export default WellList;

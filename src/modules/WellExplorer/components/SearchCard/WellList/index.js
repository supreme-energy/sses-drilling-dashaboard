import React, { useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import classes from "./WellList.scss";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import classNames from "classnames";
import { DRILLING, UNKNOWN, TRIPPING } from "../../../../../constants/drillingStatus";
import { withRouter } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";

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

const WellItem = ({ name, theme, lat, lng, status, id, fav, changeFav, opened, ...props }) => {
  const FavIcon = fav ? Favorite : FavoriteBorder;
  return (
    <ListItem {...props} button disableRipple className={classes.wellItem}>
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
        {props.selected || opened ? (
          <Link to={opened ? `/` : `/${id}/combo`}>
            <Button color="primary" className={classes.button}>
              {opened ? "Close" : "Open"}
            </Button>
          </Link>
        ) : (
          <IconButton
            onClick={e => {
              changeFav(id, !fav);
              e.stopPropagation();
            }}
          >
            <FavIcon className={classes.icon} />
          </IconButton>
        )}

        {iconsByStatus[status]}
      </div>
    </ListItem>
  );
};

function WellList({
  wells,
  theme,
  onFavoriteChanged,
  match: {
    params: { wellId }
  },
  ...props
}) {
  const [selectedItem, updateSelectedItem] = useState(null);

  return (
    <List className={classes.list} {...props}>
      {wells.map(well => {
        const selected = selectedItem === well.id;
        return (
          <WellItem
            key={well.id}
            selected={selected}
            opened={wellId === well.id}
            onClick={() => updateSelectedItem(selected ? null : well.id)}
            id={well.id}
            name={well.name}
            lat={33.634269}
            lng={-97.3711399}
            status={well.status}
            fav={well.fav}
            changeFav={onFavoriteChanged}
          />
        );
      })}
    </List>
  );
}

export default withRouter(WellList);

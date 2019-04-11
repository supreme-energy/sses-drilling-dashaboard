import React, { useCallback, useState } from "react";
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
import useFetch from "react-powertools/data/useFetch";
import { SET_FAV_WELL } from "../../../../../constants/api";
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

const WellItem = ({ name, theme, lat, lng, status, id, fav, changeFav, ...props }) => {
  const FavIcon = fav ? Favorite : FavoriteBorder;
  return (
    <ListItem {...props} button className={classes.wellItem}>
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
        {props.selected ? (
          <Link to={`combo/${id}`}>
            <Button color="primary" className={classes.button}>
              Open
            </Button>
          </Link>
        ) : (
          <IconButton onClick={() => changeFav(id, !fav)}>
            <FavIcon className={classes.icon} />
          </IconButton>
        )}

        {iconsByStatus[status]}
      </div>
    </ListItem>
  );
};

function WellList({ items, theme, refresh, ...props }) {
  const [, , , , , actions] = useFetch(false);
  const [selectedItem, updateSelectedItem] = useState(null);

  const changeFav = useCallback((seldbname, fav) =>
    actions
      .fetch({
        path: SET_FAV_WELL,
        query: {
          seldbname,
          favorite: Number(fav)
        }
      })
      .then(refresh)
  );

  return (
    <List className={classes.list} {...props}>
      {items.map(well => (
        <WellItem
          key={well.id}
          selected={selectedItem === well.id}
          onClick={() => updateSelectedItem(well.id)}
          id={well.id}
          name={well.name}
          lat={33.634269}
          lng={-97.3711399}
          status={well.status}
          fav={well.fav}
          changeFav={changeFav}
        />
      ))}
    </List>
  );
}

export default WellList;

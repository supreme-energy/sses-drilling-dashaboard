import React, { useEffect, useRef } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import classes from "./WellList.scss";
import Typography from "@material-ui/core/Typography";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import { withRouter } from "react-router";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import { listIcons } from "../../IconsByStatus";
import { connect } from "react-redux";
import { actions } from "../../../store";
import flowRight from "lodash/flowRight";

const WellItem = ({ name, theme, lat, lng, status, id, fav, changeFav, opened, selected, onClick }) => {
  const FavIcon = fav ? Favorite : FavoriteBorder;
  const icon = listIcons[status];
  const itemRef = useRef(null);
  useEffect(() => {
    if (selected && itemRef.current) {
      console.log("itemRef", itemRef.current);
      itemRef.current.scrollIntoView();
    }
  }, [selected]);

  return (
    <div ref={itemRef}>
      <ListItem button disableRipple selected={selected} className={classes.wellItem} onClick={onClick}>
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
          {selected || opened ? (
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
          <img src={icon} />
        </div>
      </ListItem>
    </div>
  );
};

function WellList({
  wells,
  theme,
  onFavoriteChanged,
  match: {
    params: { wellId }
  },
  selectedWellId,
  changeSelectedWell,
  ...props
}) {
  return (
    <List className={classes.list}>
      {wells.map(well => {
        const selected = selectedWellId === well.id;
        return (
          <WellItem
            theme={theme}
            key={well.id}
            selected={selected}
            opened={wellId === well.id}
            onClick={() => changeSelectedWell(selected ? null : well.id)}
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

const mapDispatchToPops = {
  changeSelectedWell: actions.changeSelectedWell
};

const mapStateToProps = state => {
  return {
    selectedWellId: state.wellExplorer.selectedWellId
  };
};

const bindData = flowRight([
  connect(
    mapStateToProps,
    mapDispatchToPops
  ),
  withRouter
]);

export default bindData(WellList);

import React, { useState } from "react";
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

const WellItem = ({ name, theme, lat, lng, status, id, fav, changeFav, opened, selected, onClick }) => {
  const FavIcon = fav ? Favorite : FavoriteBorder;
  const icon = listIcons[status];

  return (
    <ListItem button disableRipple className={classes.wellItem} onClick={onClick}>
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
    <List className={classes.list}>
      {wells.map(well => {
        const selected = selectedItem === well.id;
        return (
          <WellItem
            theme={theme}
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

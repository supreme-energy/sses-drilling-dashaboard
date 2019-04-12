import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import classes from "./SearchCard.scss";
import WellList from "./WellList";
import { useWells } from "../../../../api";

const EMPTY_ARRAY = [];
export default function SearchCard(props) {
  const [wells, updateFavorite] = useWells();

  return (
    <Card className={classes.card}>
      <CardContent>
        <WellList wells={wells || EMPTY_ARRAY} theme={props.theme} onFavoriteChanged={updateFavorite} />
      </CardContent>
      <CardActions>Actions</CardActions>
    </Card>
  );
}

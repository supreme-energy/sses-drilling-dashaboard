import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import classes from "./SearchCard.scss";
import useFetch from "react-powertools/data/useFetch";
import { GET_WELL_LIST } from "../../../../constants/api";
import WellList from "./WellList";
import { DRILLING } from "../../../../constants/drillingStatus";

const EMPTY_ARRAY = [];
export default function SearchCard(props) {
  const [wells, , , , , actions] = useFetch(
    {
      path: GET_WELL_LIST
    },
    {
      transform: wells => {
        return wells.map(w => ({
          id: w.jobname,
          name: w.realjobname,
          status: DRILLING,
          fav: Boolean(Number(w.favorite))
        }));
      }
    }
  );

  return (
    <Card className={classes.card}>
      <CardContent>
        <WellList items={wells || EMPTY_ARRAY} theme={props.theme} fetchWellList={actions.fetch} />
      </CardContent>
      <CardActions>Actions</CardActions>
    </Card>
  );
}

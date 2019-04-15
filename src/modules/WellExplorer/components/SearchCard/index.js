import React, { useMemo } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import classes from "./SearchCard.scss";
import WellList from "./WellList";
import { useWells } from "../../../../api";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Favorite from "@material-ui/icons/Favorite";
import Alarm from "@material-ui/icons/Alarm";
import { ALL_WELLS, RECENT_WELLS, FAVORITES, changeActiveTab } from "../../store";
import { connect } from "react-redux";

const EMPTY_ARRAY = [];

function getFilteredWells(activeTab, wells, wellTimestamps) {
  switch (activeTab) {
    case RECENT_WELLS:
      return wells.filter(w => wellTimestamps[w.id]).sort((a, b) => wellTimestamps[b.id] - wellTimestamps[a.id]);
    case FAVORITES:
      return wells.filter(w => w.fav);
    default:
      return wells;
  }
}

function SearchCard({ activeTab, theme, changeActiveTab, wellTimestamps }) {
  const [wells, updateFavorite] = useWells();
  const fileterdWells = useMemo(() => getFilteredWells(activeTab, wells, wellTimestamps), [
    activeTab,
    wells,
    wellTimestamps
  ]);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Tabs value={activeTab} indicatorColor="primary" centered onChange={(_, tab) => changeActiveTab(tab)}>
          <Tab label={ALL_WELLS} value={ALL_WELLS} className={classes.tab} />
          <Tab label={RECENT_WELLS} value={RECENT_WELLS} className={classes.tab} icon={<Alarm />} />
          <Tab label={FAVORITES} value={FAVORITES} className={classes.tab} icon={<Favorite />} />
        </Tabs>
        <WellList wells={fileterdWells || EMPTY_ARRAY} theme={theme} onFavoriteChanged={updateFavorite} />
      </CardContent>
      <CardActions>Actions</CardActions>
    </Card>
  );
}

const mapDispatchToPops = {
  changeActiveTab
};

const mapStateToProps = state => {
  return {
    activeTab: state.wellExplorer.activeTab,
    wellTimestamps: state.wellExplorer.wellTimestamps
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToPops
)(SearchCard);

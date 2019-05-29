import React, { useCallback } from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Search from "../../../../components/Search";
import classes from "./SearchCard.scss";
import WellList from "./WellList";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Favorite from "@material-ui/icons/Favorite";
import Alarm from "@material-ui/icons/Alarm";
import { ALL_WELLS, RECENT_WELLS, FAVORITES, changeActiveTab } from "../../store";
import { connect } from "react-redux";
import classNames from "classnames";

const EMPTY_ARRAY = [];

function SearchCard({
  activeTab,
  theme,
  changeActiveTab,
  updateFavorite,
  wells,
  searchTerm,
  onSearchTermChanged,
  className
}) {
  const onInputChanged = useCallback(e => onSearchTermChanged(e.target.value), [onSearchTermChanged]);
  return (
    <Card className={classNames(classes.card, className)}>
      <Search
        onChange={onInputChanged}
        className={classes.root}
        iconButtonClassName={classes.iconButton}
        inputClassName={classes.input}
      />
      <div className={classes.listContainer}>
        <Tabs value={activeTab} indicatorColor="primary" centered onChange={(_, tab) => changeActiveTab(tab)}>
          <Tab label={ALL_WELLS} value={ALL_WELLS} className={classes.tab} />
          <Tab label={RECENT_WELLS} value={RECENT_WELLS} className={classes.tab} icon={<Alarm />} />
          <Tab label={FAVORITES} value={FAVORITES} className={classes.tab} icon={<Favorite />} />
        </Tabs>
        <WellList wells={wells || EMPTY_ARRAY} theme={theme} onFavoriteChanged={updateFavorite} />
      </div>
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

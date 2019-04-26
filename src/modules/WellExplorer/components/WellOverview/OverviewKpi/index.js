import React from "react";
import Typography from "@material-ui/core/Typography";
import classes from "./styles.scss";
import { IconButton, Button } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { connect } from "react-redux";
import { changeSelectedWell } from "../../../store";
import { Link } from "react-router-dom";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import WellStatus from "../../../../Kpi/WellStatus";
import WellPathStatus from "../../../../Kpi/WellPathStatus";
import { Rop, BitDepth } from "../../../../Kpi/KpiItem";
import ServerStatus from "../../../../Kpi/ServerStatus";

function OverviewKpi({ well, changeSelectedWell, updateFavorite }) {
  const FavIcon = well.fav ? Favorite : FavoriteBorder;

  return (
    <div className={classes.container}>
      <div className={classes.topRow}>
        <Typography variant="h5" color="primary" gutterTop>
          {well.name}
        </Typography>
        <span className={classes.hSpacer} />
        <div className={classes.row}>
          <IconButton onClick={() => updateFavorite(well.id, !well.fav)}>
            <FavIcon color="primary" className={classes.favorite} />
          </IconButton>
          <span className={classes.hSpacer} />
          <Link to={`/${well.id}/combo`}>
            <Button variant="contained" color="primary">
              Open
            </Button>
          </Link>
          <span className={classes.hSpacer} />
          <IconButton onClick={() => changeSelectedWell(null)}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <div className={classes.kpiRow}>
        <WellStatus status={well.status} />
        <span className={classes.hSpacer} />
        <span className={classes.hSpacer} />
        <WellPathStatus wellId={well.id} />
        <span className={classes.hSpacer} />
        <Rop />
        <span className={classes.hSpacer} />
        <ServerStatus wellId={well.id} />
        <span className={classes.hSpacer} />
        <BitDepth />
      </div>
    </div>
  );
}

export default connect(
  null,
  {
    changeSelectedWell
  }
)(OverviewKpi);

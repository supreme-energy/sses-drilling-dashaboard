import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { Button, Card, CardContent, Typography } from "@material-ui/core";

import { useWells } from "../../api";
import { BitDepth, Rop } from "../Kpi/KpiItem";
import WellStatus from "../Kpi/WellStatus";
import ServerStatus from "../Kpi/ServerStatus";
import WellPathStatus from "../Kpi/WellPathStatus";
import TargetAccuracy from "../Kpi/TargetAccuracy";
import { actions } from "../WellExplorer/store";
import classes from "./HeaderToolbar.scss";
import { useWellIdContainer } from "../App/Containers";

export function HeaderToolbar({ changeSelectedWell, history }) {
  const { wellId } = useWellIdContainer();
  // Get currently opened well
  const [, wellsById] = useWells();
  const well = wellsById[wellId] || {};

  const handleWellNameClick = useCallback(() => {
    changeSelectedWell(well.id);
    history.push(`/${well.id}`);
  }, [changeSelectedWell, history, well.id]);
  return (
    <Card className={classes.headerToolbar}>
      <CardContent className={classes.cardContent}>
        <div className={classes.wellNameCol}>
          <Button className={classes.wellNameButton} onClick={handleWellNameClick}>
            <Typography variant="h5" color="primary" className={classes.wellName}>
              {well.name}
            </Typography>
          </Button>
        </div>
        <div className={classes.kpiCol}>
          <WellStatus status={well.status} className={classes.status} />
          <WellPathStatus wellId={well.id} />
          <TargetAccuracy wellId={wellId} />
          <Rop wellId={well.id} />
          <ServerStatus wellId={well.id} />
          <BitDepth wellId={well.id} />
        </div>
      </CardContent>
    </Card>
  );
}

HeaderToolbar.propTypes = {
  changeSelectedWell: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

export function HeaderToolbarWrapper({ children, history, changeSelectedWell }) {
  return (
    <div>
      <Route
        path="/:wellId/:page"
        exact
        render={props => <HeaderToolbar {...props} changeSelectedWell={changeSelectedWell} />}
        history={history}
      />
      <div className={classes.viewport}>{children}</div>
    </div>
  );
}

HeaderToolbarWrapper.propTypes = {
  children: PropTypes.node,
  changeSelectedWell: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func
  })
};

const mapDispatchToPops = {
  changeSelectedWell: actions.changeSelectedWell
};

export default connect(
  null,
  mapDispatchToPops
)(HeaderToolbarWrapper);

import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";

import MoreMenu from "../MoreMenu/index";
import { useWells } from "../../../../api";
import { BitDepth, Rop } from "../../../Kpi/KpiItem";
import WellStatus from "../../../Kpi/WellStatus";
import ServerStatus from "../../../Kpi/ServerStatus";
import WellPathStatus from "../../../Kpi/WellPathStatus";
import TargetAccuracy from "../../../Kpi/TargetAccuracy";
import classes from "./HeaderToolbar.scss";

function HeaderToolbar({ wellId }) {
  // Get currently opened well
  const [, wellsById] = useWells();
  const well = wellsById[wellId] || {};

  return (
    <Card className={classes.headerToolbar}>
      <CardContent className={classes.cardContent}>
        <div className={classes.wellNameCol}>
          <Typography variant="h5" color="primary">
            {well.name}
          </Typography>
        </div>
        <div className={classes.kpiCol}>
          <WellStatus status={well.status} className={classes.status} />
          <WellPathStatus wellId={well.id} />
          <TargetAccuracy wellId={wellId} />
          <Rop wellId={well.id} />
          <ServerStatus wellId={well.id} />
          <BitDepth wellId={well.id} />
          <MoreMenu selectedMenuItems={[]} menuItemEnum={[]} />
        </div>
      </CardContent>
    </Card>
  );
}

HeaderToolbar.propTypes = {
  wellId: PropTypes.string
};

export default HeaderToolbar;

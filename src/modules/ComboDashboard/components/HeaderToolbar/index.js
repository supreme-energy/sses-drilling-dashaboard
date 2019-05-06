import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, IconButton, Typography } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";

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
        <div className={classes.row}>
          <div className={classes.kpiRow}>
            <Typography variant="h5" color="primary">
              {well.name}
            </Typography>
            <span className={classes.hExtraLargeSpacer} />
            <WellStatus status={well.status} className={classes.status} />
            <span className={classes.hBigSpacer} />
            <WellPathStatus wellId={well.id} />
            <span className={classes.hBigSpacer} />
            <TargetAccuracy wellId={wellId} />
            <span className={classes.hBigSpacer} />
            <Rop wellId={well.id} />
            <span className={classes.hBigSpacer} />
            <ServerStatus wellId={well.id} />
            <span className={classes.hBigSpacer} />
            <BitDepth wellId={well.id} />
          </div>
          <IconButton className={classes.optionsButton}>
            <MoreVertIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}

HeaderToolbar.propTypes = {
  wellId: PropTypes.string
};

export default HeaderToolbar;

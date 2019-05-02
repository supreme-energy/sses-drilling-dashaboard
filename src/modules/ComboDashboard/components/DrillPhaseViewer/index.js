import React, { useState } from "react";
import { Card, CardContent, Menu, MenuItem, Button, Typography, ClickAwayListener } from "@material-ui/core";
import { ArrowDropDown, CheckCircle } from "@material-ui/icons";

import { ON_CURVE, ON_LATERAL, ON_DRILLOUT, ON_INTERMEDIATE, ON_SURFACE } from "../../../../constants/wellPathStatus";
import DrillPhaseLateralIcon from "./assets/drill-phase-lateral.svg";
import DrillPhaseCurveIcon from "./assets/drill-phase-curve.svg";
import DrillPhaseVerticalIcon from "./assets/drill-phase-vertical.svg";
import classes from "./DrillPhaseViewer.scss";
import classNames from "classnames";

const gray = "#757575";

const iconForPhaseViewer = {
    [ON_SURFACE]: {
        icon: DrillPhaseVerticalIcon
    },
    [ON_INTERMEDIATE]: {
        icon: DrillPhaseVerticalIcon
    },
    [ON_DRILLOUT]: {
        icon: DrillPhaseVerticalIcon
    },
    [ON_CURVE]: {
        icon: DrillPhaseCurveIcon
    },
    [ON_LATERAL]: {
        icon: DrillPhaseLateralIcon
    }
};

function DrillPhaseViewer({ className }) {
    const [drillPhase, setDrillPhase] = useState(ON_SURFACE);
    const [anchorEl, setAnchorEl] = useState(null);
    const drillPhaseEnum = Object.keys(iconForPhaseViewer);
    const currStatus = drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_SURFACE;
    const drillPhaseCode = currStatus.split(" ")[1];

    return (
      <Card className={classNames(classes.card, className)}>
        <CardContent className={classes.cardContent}>
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Button
              aria-owns={drillPhase ? 'simple-menu' : undefined}
              aria-haspopup="true"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className={classes.drillPhaseButton}
            >
              <Typography className={classes.drillPhaseButtonText} variant="subtitle1" gutterBottom>
                View
              </Typography>
              <img src={iconForPhaseViewer[currStatus].icon} />
              <div>
                <span className={classes.drillPhaseCode}>{drillPhaseCode}</span>
                <ArrowDropDown />
              </div>
            </Button>
            <Menu
              id="drill-phase-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setDrillPhase(currStatus)}
              disableAutoFocusItem
            >
              {drillPhaseEnum.map((phase, index) => {
                if (currStatus === phase) {
                    return (
                      <MenuItem
                        key={index}
                        onClick={() => { setDrillPhase(phase); setAnchorEl(null); }}
                        style={{ minWidth: 185, backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                      >
                        <img src={iconForPhaseViewer[phase].icon} />
                        <div style={{ marginLeft: 10 }}>{phase.split(" ")[1]}</div>
                        <CheckCircle style={{ position: 'absolute', right: 12, color: gray }} />
                      </MenuItem>
                    );
                } else {
                    return (
                      <MenuItem key={index} onClick={() => { setDrillPhase(phase); setAnchorEl(null); }}>
                        <img src={iconForPhaseViewer[phase].icon} />
                        <div style={{ marginLeft: 10 }}>{phase.split(" ")[1]}</div>
                      </MenuItem>
                    );
                }
            })}
            </Menu>
          </ClickAwayListener>
        </CardContent>
      </Card>
    );
}

export default DrillPhaseViewer;

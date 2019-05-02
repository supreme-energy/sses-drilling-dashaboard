import React, { useState } from "react";
import { Card, CardContent, Menu, MenuItem, Button, Typography, ClickAwayListener } from "@material-ui/core";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import CheckCircle from "@material-ui/icons/CheckCircle";

import { ON_CURVE, ON_LATERAL, ON_DRILLOUT, ON_INTERMEDIATE, ON_SURFACE } from "../../../../constants/wellPathStatus";
import DrillPhaseLateralIcon from "./assets/drill-phase-lateral.svg";
import DrillPhaseCurveIcon from "./assets/drill-phase-curve.svg";
import DrillPhaseVerticalIcon from "./assets/drill-phase-vertical.svg";
import classes from "./DrillPhaseViewer.scss";
import classNames from "classnames";

const gold = "#817618";
const gray = "#757575";
const green = "#09C501";

const metaDataForPhaseViewer = {
    [ON_SURFACE]: {
        top: green,
        curve: gray,
        lateral: gray,
        img: DrillPhaseVerticalIcon
    },
    [ON_INTERMEDIATE]: {
        top: green,
        curve: gray,
        lateral: gray,
        img: DrillPhaseVerticalIcon

    },
    [ON_DRILLOUT]: {
        top: green,
        curve: gray,
        lateral: gray,
        img: DrillPhaseVerticalIcon
    },
    [ON_CURVE]: {
        top: gray,
        curve: green,
        lateral: gray,
        img: DrillPhaseCurveIcon
    },
    [ON_LATERAL]: {
        top: gray,
        curve: gray,
        lateral: green,
        img: DrillPhaseLateralIcon

    }
}

function DrillPhaseViewer({ className }) {
    const [drillPhase, setDrillPhase] = useState(ON_SURFACE);
    const [anchorEl, setAnchorEl] = useState(null);
    const drillPhaseEnum = Object.keys(metaDataForPhaseViewer);
    const currStatus = drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_SURFACE;
    const drillPhaseCode =  currStatus.split(" ")[1];

    return (
        <Card className={classNames(classes.card, className)}>
            <CardContent style={{ padding: 0 }}>
                <div className={classes.cardContent}>
                    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                        <Button
                            aria-owns={drillPhase ? 'simple-menu' : undefined}
                            aria-haspopup="true"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            className={classes.drillPhaseButton}
                            style={{ borderRadius: 0, }}
                        >
                            <Typography style={{ color: gold }} variant="subtitle1">
                                View
                            </Typography>
                            <img style={{marginBottom: 15 }} src={metaDataForPhaseViewer[currStatus].img} />
                            <div>
                                <div style={{ display: 'inline', marginLeft: 12 }}>{drillPhaseCode}</div>
                                <ArrowDropDown />
                            </div>
                        </Button>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setDrillPhase(currStatus)}
                            disableAutoFocusItem
                        >
                            {drillPhaseEnum.map((phase, index) => {
                                if (currStatus == phase) {
                                    return (
                                        <MenuItem
                                            key={index}
                                            className={classes.phaseMenuItem}
                                            onClick={() => { setDrillPhase(phase); setAnchorEl(null); }}
                                            style={{ minWidth: 185, backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                                        >
                                            <img src={metaDataForPhaseViewer[phase].img} />
                                            <div style={{ marginLeft: 10 }}>{phase.split(" ")[1]}</div>
                                            <CheckCircle style={{ position: 'absolute', right: 12, color: gray }} />
                                        </MenuItem>
                                    )
                                } else {
                                    return (
                                        <MenuItem key={index} onClick={() => { setDrillPhase(phase); setAnchorEl(null); }}>
                                            <img src={metaDataForPhaseViewer[phase].img} />
                                            <div style={{ marginLeft: 10 }}>{phase.split(" ")[1]}</div>
                                        </MenuItem>
                                    )
                                }
                            })}
                        </Menu>
                    </ClickAwayListener>
                </div>
            </CardContent>
        </Card>
    );
}

export default DrillPhaseViewer;

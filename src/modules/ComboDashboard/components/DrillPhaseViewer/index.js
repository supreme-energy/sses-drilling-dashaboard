import React, { useState } from "react";
import { Card, CardContent, Menu, MenuItem, Button } from "@material-ui/core";

import { WellPathStatus } from "../../../Kpi/WellPathStatus";
import { ON_VERTICAL, ON_CURVE, ON_LATERAL } from "../../../../constants/wellPathStatus";

import classes from "./DrillPhaseViewer.scss";
import classNames from "classnames";

function DrillPhaseViewer({ className }) {
    const [drillPhase, setDrillPhase] = useState(ON_VERTICAL)
    const drillPhaseEnum = [ON_VERTICAL, ON_CURVE, ON_LATERAL]
    console.log(drillPhase, drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_VERTICAL)
    return (
        <Card className={classNames(classes.card, className)}>
            <CardContent>
                <div className={classes.cardContent}>
                    <Button
                        aria-owns={drillPhase ? 'simple-menu' : undefined}
                        aria-haspopup="true"
                        onClick={(e) => setDrillPhase(e.currentTarget)}
                    >
                        <WellPathStatus status={drillPhaseEnum.includes(drillPhase) ? drillPhase : ON_VERTICAL} />
                    </Button>
                    <Menu
                        id="simple-menu"
                        anchorEl={drillPhaseEnum.includes(drillPhase) ? null : drillPhase}
                        open={!drillPhaseEnum.includes(drillPhase)}
                        onClose={() => setDrillPhase(ON_VERTICAL)}
                    >
                        {drillPhaseEnum.map((index, phase) => (
                            <MenuItem key={index} onClick={() => setDrillPhase(phase)}>
                                <WellPathStatus status={phase} />
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            </CardContent>
        </Card>
    );
}

export default DrillPhaseViewer;

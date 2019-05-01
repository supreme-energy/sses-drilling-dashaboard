import React from "react";
import { Card, CardContent, Typography, ListItem, List, ListItemText, ListItemIcon, Button } from "@material-ui/core";
import classes from "./HeaderToolbar.scss";
import { BitDepth, Rop } from "../../../Kpi/KpiItem";
import WellStatus from "../../../Kpi/WellStatus";
import ServerStatus from "../../../Kpi/ServerStatus";
import WellPathStatus from "../../../Kpi/WellPathStatus";
import classNames from "classnames";

function HeaderToolbar({ theme, well, className }) {
    console.log(well)
    return (
        <Card className={classNames(classes.card, className)}>
            <CardContent>
                <div className={classes.cardContent}>
                    <div>{well.name}</div>
                    <span className={classes.hSpacer} />
                    <div className={classes.row}>
                        <WellStatus status={well.status} className={classes.status} />
                        <span className={classes.hBigSpacer} />
                        <WellPathStatus wellId={well.id} />
                        <span className={classes.hBigSpacer} />
                        <Rop wellId={well.id} />
                        <span className={classes.hBigSpacer} />
                        <ServerStatus wellId={well.id} />
                        <span className={classes.hBigSpacer} />
                        <BitDepth wellId={well.id} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default HeaderToolbar;

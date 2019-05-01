import React, { useState } from "react";
import { Card, CardContent, CardHeader, IconButton, Icon, Collapse, Typography, ListItem, List, ListItemText, ListItemIcon, Button } from "@material-ui/core";
import classes from "./HeaderToolbar.scss";
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { BitDepth, Rop } from "../../../Kpi/KpiItem";
import WellStatus from "../../../Kpi/WellStatus";
import ServerStatus from "../../../Kpi/ServerStatus";
import WellPathStatus from "../../../Kpi/WellPathStatus";
import classNames from "classnames";

function HeaderToolbar({ theme, well, className }) {
    const [expanded, setExpanded] = useState(true);
    return (
        <Card className={classes.card}>
            <CardContent style={{ padding: 7, width: '100%' }}>
                <div className={classes.cardContent}>
                    <div className={classes.row}>
                        <Collapse in={expanded} unmountOnExit className={classes.collapseContainer} style={{ width: '100%' }}>
                            <div className={classes.row}>
                                <Typography variant="h5" color="primary">{well.name}</Typography>
                                <span className={classes.hExtraLargeSpacer} />
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
                        </Collapse>
                        <IconButton className={classes.expandButton} onClick={() => setExpanded(!expanded)}>
                            <MoreVertIcon />
                        </IconButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default HeaderToolbar;

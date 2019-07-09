import { Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import React, { useState } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";

import WidgetCard from "../../WidgetCard";
import classes from "./ComboDashboard.scss";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";
import CrossSection from "./CrossSection/index";

export const CrossSectionDashboard = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <WidgetCard className={classes.crossSectionDash} hideMenu>
      <div className={classNames(classes.responsiveWrapper, classes.column)}>
        <Typography variant="subtitle1">Cross Section</Typography>
        <div className={classNames(classes.column, classes.grow)}>
          <ParentSize debounceTime={100} className={classes.responsiveWrapper}>
            {({ width, height }) => <CrossSection width={width} height={height} />}
          </ParentSize>
        </div>
        <div className={classes.cardLine} />
        <div className={classNames(classes.column, classes.shrink)}>
          <div className={classes.row}>
            <IconButton
              size="small"
              className={classNames(classes.expand, {
                [classes.expandOpen]: expanded
              })}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="Show more"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography variant="subtitle1">Details</Typography>
          </div>
          <Collapse in={expanded} unmountOnExit>
            <DetailsTable />
          </Collapse>
        </div>
      </div>
    </WidgetCard>
  );
};

export default CrossSectionDashboard;

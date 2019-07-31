import { Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import React, { useReducer } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TableChartIcon from "../../../assets/tableChart.svg";
import IconButton from "@material-ui/core/IconButton";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./ComboDashboard.scss";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";
import DetailsFullModal from "./Details/DetailsFullModal";
import CrossSection from "./CrossSection/index";

export const CrossSectionDashboard = ({ className }) => {
  const [expanded, toggleExpanded] = useReducer(e => !e, false);
  const [showModal, toggleModal] = useReducer(m => !m, false);

  return (
    <WidgetCard className={classNames(classes.crossSectionDash, className)} title="Cross Section" hideMenu>
      <div className={classNames(classes.responsiveWrapper, classes.column)}>
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
              onClick={toggleExpanded}
              aria-expanded={expanded}
              aria-label="Show more"
            >
              <ExpandMoreIcon />
            </IconButton>
            <Typography variant="subtitle1">Details</Typography>
            <IconButton
              size="small"
              className={classNames(classes.expand, classes.tableButton)}
              onClick={toggleModal}
              aria-label="Show more"
            >
              <img src={TableChartIcon} className={classes.icon} />
            </IconButton>
          </div>
          <Collapse in={expanded} unmountOnExit>
            <DetailsTable />
          </Collapse>
          <DetailsFullModal handleClose={toggleModal} isVisible={showModal} />
        </div>
      </div>
    </WidgetCard>
  );
};

export default CrossSectionDashboard;

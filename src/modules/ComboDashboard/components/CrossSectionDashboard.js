import { CircularProgress, Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import PropTypes from "prop-types";
import React, { lazy, Suspense, useCallback, useReducer, useState } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import { useComboData } from "../../App/Containers";

import WidgetCard from "../../WidgetCard";
import classes from "./ComboDashboard.scss";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";

const CrossSection = lazy(() => import(/* webpackChunkName: 'CrossSection' */ "./CrossSection/index"));

export const CrossSectionDashboard = ({ wellId }) => {
  const {
    surveys,
    wellPlan,
    formations,
    projections,
    firstProjectionIdx,
    selectedSections,
    setSelectedSections,
    ghostDiff,
    ghostDiffDispatch,
    calcSections,
    calculatedFormations
  } = useComboData(wellId);

  // TODO: calculate these based on some 'default zoom' estimate from data (will need width/height)
  const [view, setView] = useReducer(
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    {
      x: -844,
      y: -16700,
      xScale: 2.14,
      yScale: 2.14
    }
  );
  const scale = useCallback((xVal, yVal) => [xVal * view.xScale + view.x, yVal * view.yScale + view.y], [view]);

  const [expanded, setExpanded] = useState(false);
  return (
    <WidgetCard className={classes.crossSectionDash} hideMenu>
      <div className={classNames(classes.responsiveWrapper, classes.column)}>
        <Typography variant="subtitle1">Cross Section</Typography>
        <div className={classNames(classes.column, classes.grow)}>
          <Suspense fallback={<CircularProgress />}>
            <ParentSize debounceTime={100}>
              {({ width, height }) => (
                <CrossSection
                  width={width}
                  height={height}
                  view={view}
                  updateView={setView}
                  scale={scale}
                  wellPlan={wellPlan}
                  surveys={surveys}
                  formations={formations}
                  calculatedFormations={calculatedFormations}
                  projections={projections}
                  calcSections={calcSections}
                  selectedSections={selectedSections}
                  setSelectedSections={setSelectedSections}
                  firstProjectionIdx={firstProjectionIdx}
                  ghostDiffDispatch={ghostDiffDispatch}
                />
              )}
            </ParentSize>
          </Suspense>
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
            <DetailsTable ghostDiff={ghostDiff} />
          </Collapse>
        </div>
      </div>
    </WidgetCard>
  );
};
CrossSectionDashboard.propTypes = {
  wellId: PropTypes.string.isRequired
};

export default CrossSectionDashboard;

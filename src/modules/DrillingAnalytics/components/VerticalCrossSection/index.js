import React, { useReducer } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import classNames from "classnames";

import { useComputedFilteredWellData } from "../../../App/Containers";
import { crossSectionMenuReducer } from "../reducer";
import WidgetCard from "../../../../components/WidgetCard";
import CrossSectionGraph from "./CrossSectionGraph";
import AerialGraph from "./AerialGraph";
import { LATERAL, DRILLOUT } from "../../../../constants/wellSections";
import { ACTUAL, PLAN, TARGET_BOUNDARY, EST_BOTTOM_TGT, SLIDES } from "../../../../constants/drillingAnalytics";
import KpiItem from "../../../Kpi/KpiItem";
import classes from "../DrillingAnalytics.scss";

export function VerticalCrossSection({ className, wellId, drillPhase, inView }) {
  const isDrillout = drillPhase === DRILLOUT && inView;
  const isLateral = drillPhase === LATERAL && inView;
  const title = isLateral ? " / Top Cross-sections" : "Cross-section";
  const lateralMenuItems = [TARGET_BOUNDARY, EST_BOTTOM_TGT, SLIDES];
  const phaseMenuItems = [ACTUAL, PLAN];
  const menuItems = isLateral ? [...phaseMenuItems, ...lateralMenuItems] : phaseMenuItems;

  const { surveys, wellPlanFiltered, formations } = useComputedFilteredWellData(wellId);

  const [selectedMenuItems, setSelectedMenuItem] = useReducer(crossSectionMenuReducer, menuItems);

  return (
    <WidgetCard
      className={classNames(className, classes.verticalCrossSectionCard)}
      title={`Vertical ${title}`}
      selectedMenuItems={selectedMenuItems}
      setSelectedMenuItem={setSelectedMenuItem}
      menuItemEnum={menuItems}
      multiSelect
    >
      {isDrillout && (
        <div className={classes.drilloutKpis}>
          <KpiItem className={classes.kpi} label="Current Formation" value="Upson" format={value => value} />
          <KpiItem
            className={classes.kpi}
            label="Next Formation In"
            value="Upson"
            format={value => value}
            measureUnit="ft"
          />
        </div>
      )}
      <Typography variant="caption">Actual v. Plan TVD</Typography>
      <CrossSectionGraph
        selectedMenuItems={selectedMenuItems}
        keys={menuItems}
        surveys={surveys}
        wellPlanFiltered={wellPlanFiltered}
        formations={formations}
      />
      {isLateral && (
        <AerialGraph
          selectedMenuItems={selectedMenuItems}
          keys={menuItems}
          surveys={surveys}
          wellPlanFiltered={wellPlanFiltered}
          formations={formations}
        />
      )}
    </WidgetCard>
  );
}

VerticalCrossSection.propTypes = {
  className: PropTypes.string,
  wellId: PropTypes.string,
  drillPhase: PropTypes.string,
  inView: PropTypes.bool
};

export default VerticalCrossSection;

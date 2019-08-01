import React, { useReducer, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import classNames from "classnames";

import { useFilteredWellData } from "../../../App/Containers";
import { crossSectionMenuReducer } from "../reducer";
import WidgetCard from "../../../../components/WidgetCard";
import CrossSectionGraph from "./CrossSectionGraph";
import AerialGraph from "./AerialGraph";
import { LATERAL, DRILLOUT } from "../../../../constants/wellSections";
import { ACTUAL, PLAN, TARGET_BOUNDARY, EST_BOTTOM_TGT, SLIDES } from "../../../../constants/drillingAnalytics";
import KpiItem from "../../../Kpi/KpiItem";
import classes from "../DrillingAnalytics.scss";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function VerticalCrossSection({ className, wellId, drillPhase, inView }) {
  const isDrillout = drillPhase === DRILLOUT && inView;
  const isLateral = drillPhase === LATERAL && inView;
  const title = isLateral ? " / Top Cross-sections" : "Cross-section";
  const lateralMenuItems = [TARGET_BOUNDARY, EST_BOTTOM_TGT, SLIDES];
  const phaseMenuItems = [ACTUAL, PLAN];
  const menuItems = isLateral ? [...phaseMenuItems, ...lateralMenuItems] : phaseMenuItems;

  const { surveys, wellPlanFiltered, formations } = useFilteredWellData(wellId);

  const [selectedMenuItems, setSelectedMenuItem] = useReducer(crossSectionMenuReducer, menuItems);

  const prevPhase = usePrevious(drillPhase);
  const prevViewState = usePrevious(inView);
  const hasPhaseChanged = prevPhase !== drillPhase || prevViewState !== inView;

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
        isLateral={isLateral}
        hasPhaseChanged={hasPhaseChanged}
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

import React, { useCallback, useMemo, useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiLabel from "../../../components/PixiLabel";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { COLOR_BY_PHASE_VIEWER } from "../../../constants/timeSlider";

const HEIGHT = 6;
const QuickFilter = React.memo(({ container, data, phaseObj, setDrillPhase, view, refresh }) => {
  // Create state for component
  const [isTooltipVisible, setVisible] = useReducer(a => !a, false);
  const [labelDimensions, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });

  // Define constants
  const { phaseStart, phaseEnd, phase } = phaseObj;
  const firstIndex = useMemo(() => data.map(e => e.Hole_Depth).indexOf(phaseStart), [data, phaseStart]);
  const lastIndex = useMemo(() => data.map(e => e.Hole_Depth).lastIndexOf(phaseEnd), [data, phaseEnd]);
  const filterWidth = (lastIndex - firstIndex) * view.xScale;
  const startingX = firstIndex * view.xScale;

  // Create callbacks
  const onClickPhaseSegment = useCallback(
    () => setDrillPhase({ type: "SET", payload: { ...phaseObj, set: true, inView: true } }),
    [phaseObj, setDrillPhase]
  );
  const onMouseOver = useCallback(() => setVisible(), []);
  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => updateLabelDimensions({ labelWidth, labelHeight }),
    []
  );

  // Side effect refreshes view on hover and on tooltip dimension change
  useEffect(() => refresh(), [isTooltipVisible, refresh, labelDimensions]);

  return (
    <React.Fragment>
      <PixiRectangle
        container={container}
        width={filterWidth}
        height={HEIGHT}
        x={startingX}
        y={-50}
        radius={3}
        zIndex={100}
        backgroundColor={COLOR_BY_PHASE_VIEWER[phase].quickFilter}
        onClick={onClickPhaseSegment}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOver}
      />
      {isTooltipVisible && (
        <PixiLabel
          sizeChanged={onSizeChanged}
          container={container}
          text={phase}
          x={startingX + filterWidth / 2 - 20}
          y={-40}
          updateTransform={frozenScaleTransform}
          zIndex={100}
          textProps={{ fontSize: 20, color: 0xffffff }}
          backgroundProps={{ backgroundColor: 0x757575, radius: 5 }}
        />
      )}
    </React.Fragment>
  );
});

QuickFilter.propTypes = {
  container: PropTypes.object,
  phaseObj: PropTypes.object,
  setDrillPhase: PropTypes.func,
  view: PropTypes.object,
  refresh: PropTypes.func
};

export default QuickFilter;

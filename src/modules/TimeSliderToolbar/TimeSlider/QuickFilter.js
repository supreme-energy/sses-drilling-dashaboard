import React, { useCallback, useMemo, useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import PixiRectangle from "../../../components/PixiRectangle";
import PixiLabel from "../../../components/PixiLabel";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { COLOR_BY_PHASE_VIEWER } from "../../../constants/timeSlider";
import { stateReducer } from "./reducers";

const HEIGHT = 6;
const QuickFilter = React.memo(({ container, data, phaseObj, setDrillPhase, view, refresh }) => {
  // Create state for component
  const [{ isTooltipVisible, xPos }, setVisible] = useReducer(stateReducer, { isTooltipVisible: false, xPos: 0 });
  const [labelDimensions, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });

  // Define constants
  const { phaseStart, phaseEnd, phase } = phaseObj;
  const firstIndex = useMemo(() => {
    const index = data.findIndex(d => d.hole_depth >= phaseStart);
    return index > 0 ? index : 0;
  }, [data, phaseStart]);
  const lastIndex = useMemo(() => {
    const index = data.findIndex(d => d.hole_depth >= phaseEnd);
    return index > 0 ? index : data.length - 1;
  }, [data, phaseEnd]);
  const filterWidth = (lastIndex - firstIndex) * view.xScale;
  const startingX = firstIndex * view.xScale;

  // Create callbacks
  const onClickPhaseSegment = useCallback(
    () => setDrillPhase({ type: "SET", payload: { ...phaseObj, set: true, inView: true } }),
    [phaseObj, setDrillPhase]
  );
  const onMouseOver = useCallback(e => {
    setVisible({ isTooltipVisible: true, xPos: e.data.originalEvent.clientX });
  }, []);

  const onMouseOut = useCallback(e => setVisible({ isTooltipVisible: false }), []);

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
        onMouseOut={onMouseOut}
      />
      {isTooltipVisible && (
        <PixiLabel
          sizeChanged={onSizeChanged}
          container={container}
          text={phase}
          x={xPos - view.x - 270}
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

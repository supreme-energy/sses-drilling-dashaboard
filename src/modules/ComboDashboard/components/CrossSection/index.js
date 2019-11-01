import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixiCrossSection from "./PixiCrossSection";
import classes from "./CrossSection.scss";
import { useCrossSectionContainer } from "../../../App/Containers";
import { HORIZONTAL, VERTICAL } from "../../../../constants/crossSectionViewDirection";

import { useUpdateSegmentsById } from "../../../Interpretation/actions";
import { useSaveSurveysAndProjections } from "../../../App/actions";
import TCLLine from "./TCLLine";
import { useViewportView } from "../../hooks";
import { useComboContainer } from "../../containers/store";

const pixiApp = new PixiCrossSection();

const CrossSection = React.memo(props => {
  const {
    width,
    height,
    viewDirection,
    view: verticalView,
    updateView: updateVerticalView,
    isReadOnly,
    viewName,
    wellId,
    mode,
    setMode
  } = props;
  const canvas = useRef(null);

  const dataObj = useCrossSectionContainer();
  const updateSegments = useUpdateSegmentsById();
  const { debouncedSave } = useSaveSurveysAndProjections();
  const [{ centerSelectionInCSId, centerWellPlanId }] = useComboContainer();

  const {
    wellPlan,
    selectedSections,
    changeSelection,
    calcSections,
    calculatedFormations,
    addProjection,
    deleteProjection
  } = dataObj;

  const [horizontalView, updateHorizontalView] = useViewportView({ key: `${viewName}-horizontal`, wellId });

  const view = viewDirection === VERTICAL ? verticalView : horizontalView;

  const internalState = useRef({
    viewDirection: viewDirection,
    prevCenterSelectionId: null,
    prevCenterWellPlanId: null
  });

  // store viewDirection into ref because it looks like udpateView changes are not propagated
  // to children so we can't bind properties into updateView callback
  internalState.current.viewDirection = viewDirection;

  const updateView = useCallback(
    (...args) => {
      internalState.current.viewDirection === VERTICAL ? updateVerticalView(...args) : updateHorizontalView(...args);
    },
    [updateVerticalView, updateHorizontalView]
  );

  const [xField, yField] = useMemo(() => {
    if (viewDirection === HORIZONTAL) {
      return ["ew", "ns"];
    } else {
      return ["vs", "tvd"];
    }
  }, [viewDirection]);

  const yAxisDirection = useMemo(() => {
    return viewDirection ? -1 : 1;
  }, [viewDirection]);

  const centerPoint = useCallback(
    ({ x, y }) => {
      const { xScale, yScale } = verticalView;

      const computedX = (-x + (width / 2 - pixiApp.gridGutterLeft / 2) / xScale) * xScale;
      const computedY = (-y + (height / 2 - pixiApp.gridGutter / 2) / yScale) * yScale;

      updateVerticalView(view => ({ ...view, x: computedX, y: computedY }));
    },
    [height, width, updateVerticalView, verticalView]
  );

  useEffect(() => {
    // TODO: Calculate the zoom to fit the new data view
    // Currently initialized the graph at the first Well plan data point

    if (internalState.current.prevCenterWellPlanId !== centerWellPlanId) {
      const minX = Math.min(...wellPlan.map(d => d[xField]));
      const minY = Math.min(...wellPlan.map(d => d[yField]));
      internalState.current.prevCenterWellPlanId = centerWellPlanId;

      centerPoint({
        x: minX,
        y: minY
      });
    }
  }, [xField, yField, wellPlan, centerWellPlanId, centerPoint, width, height, verticalView]);

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0
  });

  const scale = useCallback((xVal, yVal) => [xVal * view.xScale + view.x, yVal * view.yScale + view.y], [view]);

  useEffect(
    function centerSelection() {
      if (internalState.current.prevCenterSelectionId !== centerSelectionInCSId) {
        internalState.current.prevCenterSelectionId = centerSelectionInCSId;

        const selection = calcSections.find(s => selectedSections[s.id]);
        if (selection) {
          centerPoint({ x: selection.vs, y: selection.tvd });
        }
      }
    },
    [
      centerSelectionInCSId,
      selectedSections,
      calcSections,
      height,
      width,
      verticalView,
      updateVerticalView,
      centerPoint
    ]
  );

  useEffect(() => {
    const currentCanvas = canvas.current;

    pixiApp.init(
      {
        ...dataObj,
        ...props,
        view,
        updateView,
        scale,
        mode,
        setMode,
        mouse,
        setMouse,
        xField,
        yField,
        yAxisDirection,
        updateSegments,
        debouncedSave,
        isReadOnly
      },
      view,
      updateView
    );
    currentCanvas.appendChild(pixiApp.renderer.view);
    return () => {
      pixiApp.cleanUp();
      currentCanvas.removeChild(pixiApp.renderer.view);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pixiApp.resize(width, height);
  }, [width, height]);

  useEffect(() => {
    pixiApp.update({
      width,
      height,
      wellPlan,
      selectedSections,
      changeSelection,
      calcSections,
      calculatedFormations,
      scale,
      view,
      updateView,
      mode,
      setMode,
      mouse,
      setMouse,
      xField,
      yField,
      viewDirection,
      yAxisDirection,
      addProjection,
      deleteProjection,
      updateSegments,
      debouncedSave,
      isReadOnly
    });
  }, [
    view.x,
    view.y,
    view.xScale,
    view.yScale,
    view,
    width,
    height,
    wellPlan,
    selectedSections,
    changeSelection,
    calcSections,
    calculatedFormations,
    scale,
    mode,
    setMode,
    mouse,
    setMouse,
    xField,
    yField,
    viewDirection,
    yAxisDirection,
    addProjection,
    updateView,
    deleteProjection,
    updateSegments,
    debouncedSave,
    isReadOnly
  ]);

  return (
    <React.Fragment>
      <div className={classes.crossSection} ref={canvas} />
      {viewDirection === VERTICAL && <TCLLine container={pixiApp.tclLineLayer} view={view} />}
    </React.Fragment>
  );
});

CrossSection.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  viewDirection: PropTypes.number,
  isReadOnly: PropTypes.bool,
  view: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  }),
  updateView: PropTypes.func
};

export default CrossSection;

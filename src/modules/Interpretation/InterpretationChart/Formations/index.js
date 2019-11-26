import React, { useMemo, useCallback, useEffect, useRef } from "react";
import PixiRectangle from "../../../../components/PixiRectangle";
import { useFormationsDataContainer, useWellIdContainer, useSelectedWellInfoContainer } from "../../../App/Containers";
import PixiText from "../../../../components/PixiText";
import { useFormationsStore } from "./store";
import PixiLine from "../../../../components/PixiLine";
import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiContainer from "../../../../components/PixiContainer";
import FormationSegments from "./FormationSegments";
import { useInterpretationRenderer, gridGutter } from "..";
import AddTop from "./AddTop";
import get from "lodash/get";
import useDraggable from "../../../../hooks/useDraggable";
import memoizeOne from "memoize-one";
import { EMPTY_ARRAY } from "../../../../api";
import { max } from "d3-array";
import TCLLine from "../TCLLine";
import YAxis from "../../../../components/YAxis";
import { scaleLinear } from "d3-scale";

const marginRight = 55;

const FormationDrag = ({ y, container, width, thickness }) => {
  const topLineRef = useRef(null);
  const getTopLine = useCallback(() => topLineRef.current && topLineRef.current.container, []);
  const { updateTop } = useFormationsDataContainer();
  const { canvasRef, view } = useInterpretationRenderer();
  const [{ selectedFormation }] = useFormationsStore();

  const onDrag = useCallback(
    (event, prevPosition) => {
      const newThickness =
        thickness + event.data.getLocalPosition(container).y - (prevPosition.y - view.y) / view.yScale;
      updateTop({ id: selectedFormation, thickness: newThickness }, false);
    },
    [container, view, thickness, selectedFormation, updateTop]
  );

  const onDragEnd = useCallback(() => {
    updateTop({ id: selectedFormation, thickness });
  }, [thickness, updateTop, selectedFormation]);

  useDraggable({
    getContainer: getTopLine,
    root: container,
    onDrag,
    onDragEnd,
    canvas: canvasRef.current,
    cursor: "row-resize",
    x: 0,
    y: -3 / view.yScale,
    width,
    height: 6 / view.yScale
  });
  return <PixiContainer ref={topLineRef} y={y} container={container} />;
};

const Formation = ({
  y,
  height,
  label,
  width,
  container,
  backgroundAlpha,
  backgroundColor,
  color,
  interpretationLine,
  interpretationFill,
  thickness,
  selected,
  view
}) => {
  const lineData = useMemo(() => [[0, 0], [width, 0]], [width]);

  return (
    <React.Fragment>
      <PixiContainer
        y={y}
        container={container}
        child={container => (
          <PixiRectangle
            backgroundColor={backgroundColor}
            backgroundAlpha={interpretationFill ? backgroundAlpha : 0}
            width={width / view.xScale}
            height={height - 3 / view.yScale}
            container={container}
          />
        )}
      />

      {interpretationLine && (
        <PixiContainer
          updateTransform={frozenScaleTransform}
          y={y}
          container={container}
          child={container => (
            <PixiLine container={container} data={lineData} color={color} lineWidth={3} nativeLines={false} />
          )}
        />
      )}

      {selected && <FormationDrag width={width} container={container} y={y} thickness={thickness} />}

      <PixiContainer
        y={y}
        x={(gridGutter + 10) / view.xScale}
        container={container}
        child={container => <PixiText container={container} text={label} color={color} fontSize={11} />}
      />
    </React.Fragment>
  );
};

const computeFormationsData = memoizeOne((rawFormationsData, tcl) => {
  if (!rawFormationsData || !rawFormationsData.length) {
    return EMPTY_ARRAY;
  }

  return rawFormationsData.reduce((acc, item, index) => {
    if (item.data && item.data.length) {
      const nextFormation = rawFormationsData[index + 1];
      const nextFormationData = nextFormation && nextFormation.data[0];
      const thickness = get(item, "data[0].thickness");
      const y = tcl + thickness;

      const height = nextFormationData ? nextFormationData.thickness + tcl - y : 20;
      acc.push({
        y,
        height,
        label: item.label,
        thickness: get(item, "data[0].thickness"),
        interpretationLine: item.interp_line_show,
        interpretationFill: item.interp_fill_show,
        id: item.id,
        showLine: Boolean(item.show_line),
        backgroundColor: Number(`0x${item.bg_color}`),
        backgroundAlpha: Number(item.bg_percent),
        color: Number(`0x${item.color}`)
      });
    }

    return acc;
  }, []);
});

const FormationAxis = ({ view, formationsData, height, container, tcl, width }) => {
  const yMin = Math.floor((-1 * view.y) / view.yScale);
  const yMax = yMin + Math.floor(height / view.yScale);

  const maxThickness = useMemo(() => max(formationsData, f => get(f, `data[0].thickness`)), [formationsData]);

  const scale = useMemo(
    () =>
      scaleLinear()
        .domain([0, maxThickness])
        .range([tcl, tcl + maxThickness]),
    [maxThickness, tcl]
  );

  return (
    <YAxis
      container={container}
      numberOfTicks={6}
      yMin={yMin - 3}
      yMax={yMax + 3}
      scale={scale}
      width={50 / view.xScale}
      x={(width - view.x - marginRight) / view.xScale}
      y={0}
    />
  );
};

export default React.memo(({ width, ...props }) => {
  const [{ selectedFormation, editMode, pendingAddTop }, dispatch] = useFormationsStore();
  const {
    refresh,
    view,
    size: { height }
  } = useInterpretationRenderer();
  const { wellId } = useWellIdContainer();

  const { formationsData, addTop, serverFormations } = useFormationsDataContainer();

  const [data] = useSelectedWellInfoContainer();
  const tcl = Number(get(data, "wellInfo.tot"));
  const formationDataForSelectedSurvey = computeFormationsData(formationsData, tcl);

  const changeSegmentSelection = useCallback(id => dispatch({ type: "CHANGE_SELECTION", formationId: id }), [dispatch]);
  useEffect(
    function ensureFormationSelected() {
      if (editMode && !selectedFormation) {
        changeSegmentSelection(get(serverFormations, "[0].id"));
      }
    },
    [selectedFormation, serverFormations, changeSegmentSelection, editMode]
  );

  useEffect(refresh, [refresh, selectedFormation, pendingAddTop, formationsData]);

  const computedWidth = width;
  const formationAxisProps = { view, formationsData, height, container: props.container, tcl, width: computedWidth };

  return (
    <PixiContainer
      {...props}
      child={container => (
        <React.Fragment>
          {formationDataForSelectedSurvey.map((f, index) => (
            <Formation
              container={container}
              width={computedWidth}
              view={view}
              {...f}
              key={f.id}
              selected={f.id === selectedFormation}
            />
          ))}
          {editMode && (
            <FormationSegments
              refresh={refresh}
              gridGutter={gridGutter}
              selectedFormation={selectedFormation}
              container={container}
              formationData={formationDataForSelectedSurvey}
              view={view}
              onSegmentClick={changeSegmentSelection}
            />
          )}
          {pendingAddTop && (
            <AddTop
              addTop={addTop}
              wellId={wellId}
              tcl={tcl}
              container={container}
              formationData={formationDataForSelectedSurvey}
            />
          )}
          <TCLLine container={container} width={computedWidth} tcl={tcl} x={12} />
          <FormationAxis {...formationAxisProps} />
        </React.Fragment>
      )}
    />
  );
});

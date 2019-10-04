import React, { useMemo, useCallback, useEffect, useRef } from "react";
import PixiRectangle from "../../../../components/PixiRectangle";
import { useFormationsDataContainer, useWellIdContainer } from "../../../App/Containers";
import PixiText from "../../../../components/PixiText";
import { useFormationsStore } from "./store";
import { useSelectedSurvey, useComputedSurveysAndProjections } from "../../selectors";
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
import { minIndex, maxIndex } from "d3-array";
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

const Formation = React.memo(
  ({
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
    selected
  }) => {
    const lineData = useMemo(() => [[0, 0], [width, 0]], [width]);

    return (
      <React.Fragment>
        <PixiContainer
          x={12}
          y={y}
          container={container}
          child={container => (
            <PixiRectangle
              backgroundColor={backgroundColor}
              backgroundAlpha={interpretationFill ? backgroundAlpha : 0}
              width={width}
              height={height}
              container={container}
            />
          )}
        />

        {interpretationLine && (
          <PixiContainer
            updateTransform={frozenScaleTransform}
            x={12}
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
          x={20}
          container={container}
          child={container => <PixiText container={container} text={label} color={color} fontSize={11} />}
        />
      </React.Fragment>
    );
  }
);

const computeFormationsData = memoizeOne((rawFormationsData, selectedSurveyIndex) => {
  if (!rawFormationsData || !rawFormationsData.length) {
    return EMPTY_ARRAY;
  }

  const items = rawFormationsData.reduce((acc, item, index) => {
    if (item.data && item.data.length) {
      const formationData = item.data[selectedSurveyIndex];

      if (!formationData) {
        return acc;
      }

      const nextFormation = rawFormationsData[index + 1];
      const nextFormationData = nextFormation && nextFormation.data[selectedSurveyIndex];
      const y = formationData.tot;

      const height = nextFormationData ? nextFormationData.tot - y : 20;
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
  return items;
});

const computeViewportCenterClosestFormationDataIndex = memoizeOne((view, formationsData, height, nrSurveys) => {
  if (!formationsData || !formationsData.length) {
    return 0;
  }
  const center = (-view.y + height / 2) / view.yScale;

  // just picking first formation that have data
  const firstFormationData = formationsData.find(f => f.data && f.data.length);
  const lastFormationData = [...formationsData].reverse().find(f => f.data && f.data.length);

  if (!firstFormationData || !lastFormationData) {
    return 0;
  }

  return minIndex(firstFormationData.data.slice(0, nrSurveys), (d1, index) => {
    const d2 = lastFormationData.data[index];
    const top = d1.tot;
    const bottom = d2.tot;
    const formationItemCenter = top + (bottom - top) / 2;
    return Math.abs(formationItemCenter - center);
  });
});

const FormationAxis = ({ view, formationsData, formationDataIndex, height, container, tcl, width }) => {
  const yMin = Math.floor((-1 * view.y) / view.yScale);
  const yMax = yMin + Math.floor(height / view.yScale);

  const maxThicknessFormationIndex = useMemo(
    () => maxIndex(formationsData, f => get(f, `data[${formationDataIndex}].thickness`)),
    [formationsData, formationDataIndex]
  );

  const maxFormation = get(formationsData, `[${maxThicknessFormationIndex}].data[${formationDataIndex}]`) || {
    thickness: 0,
    tot: 0
  };

  const scale = useMemo(
    () =>
      scaleLinear()
        .domain([0, maxFormation.thickness])
        .range([tcl, maxFormation.tot]),
    [maxFormation, tcl]
  );

  return (
    <YAxis
      container={container}
      numberOfTicks={6}
      yMin={yMin - 3}
      yMax={yMax + 3}
      scale={scale}
      width={50}
      x={width}
      y={0}
    />
  );
};

export default React.memo(({ container, width }) => {
  const [{ selectedFormation, editMode, pendingAddTop }, dispatch] = useFormationsStore();
  const {
    refresh,
    view,
    size: { height }
  } = useInterpretationRenderer();
  const { wellId } = useWellIdContainer();

  const selectedSurvey = useSelectedSurvey();

  const [surveysAndProjections, surveys] = useComputedSurveysAndProjections();
  const nrSurveys = surveys.length;
  const selectedSurveyIndex = useMemo(
    () => (selectedSurvey ? surveysAndProjections.findIndex(s => s.id === selectedSurvey.id) : -1),
    [selectedSurvey, surveysAndProjections]
  );

  const { formationsData, addTop, serverFormations } = useFormationsDataContainer();

  const formationDataIndex =
    selectedSurveyIndex >= 0
      ? selectedSurveyIndex
      : computeViewportCenterClosestFormationDataIndex(view, formationsData, height, nrSurveys);
  const formationDataForSelectedSurvey = computeFormationsData(formationsData, formationDataIndex);

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

  const tcl = get(surveys, `[${formationDataIndex}].tcl`);

  const computedWidth = width - marginRight - gridGutter;
  const formationAxisProps = { view, formationsData, formationDataIndex, height, container, tcl, width: computedWidth };

  return (
    <PixiContainer
      container={container}
      child={container => (
        <React.Fragment>
          {formationDataForSelectedSurvey.map((f, index) => (
            <Formation
              container={container}
              width={computedWidth}
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
              topIndex={formationDataIndex}
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

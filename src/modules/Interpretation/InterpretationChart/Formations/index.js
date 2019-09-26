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
import { useInterpretationRenderer } from "..";
import AddTop from "./AddTop";
import get from "lodash/get";
import useDraggable from "../../../../hooks/useDraggable";
import memoizeOne from "memoize-one";
import { EMPTY_ARRAY } from "../../../../api";
import { minIndex } from "d3-array";

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
  return (
    <PixiContainer
      ref={topLineRef}
      y={y}
      container={container}
      chils={container => <PixiRectangle container={container} backgroundColor={0xff0000} width={width} height={5} />}
    />
  );
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
    const lineData = useMemo(() => [[10, 0], [width - 10, 0]], [width]);

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
  const center = (-view.y + height / 2) / view.yScale;

  return minIndex(formationsData[0].data.slice(0, nrSurveys), (d1, index) => {
    const d2 = formationsData[formationsData.length - 1].data[index];
    const top = d1.tot;
    const bottom = d2.tot;
    const formationItemCenter = top + (bottom - top) / 2;
    return Math.abs(formationItemCenter - center);
  });
});

export default React.memo(({ container, width, gridGutter }) => {
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

  return (
    <PixiContainer
      container={container}
      child={container => (
        <React.Fragment>
          {formationDataForSelectedSurvey.map((f, index) => (
            <Formation container={container} width={width} {...f} key={f.id} selected={f.id === selectedFormation} />
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
        </React.Fragment>
      )}
    />
  );
});

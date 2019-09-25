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

function computeFormationsData(rawFormationsData, selectedSurveyIndex) {
  const items = rawFormationsData.reduce((acc, item, index) => {
    if (item.data && item.data.length && index <= rawFormationsData.length - 2) {
      const formationData = item.data[selectedSurveyIndex];
      const nextFormation = rawFormationsData[index + 1];
      const nextFormationData = nextFormation.data[selectedSurveyIndex];
      const y = formationData.tot;
      const height = nextFormationData.tot - y;
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
  const lastAddedItem = items[items.length - 1];
  const lastFormationItem = rawFormationsData[rawFormationsData.length - 1];

  items.push({
    y: lastAddedItem.y + lastAddedItem.height,
    height: 20,
    label: lastFormationItem.label,
    id: lastFormationItem.id,
    thickness: get(lastFormationItem, "data[0].thickness"),
    interpretationLine: lastFormationItem.interp_line_show,
    interpretationFill: lastFormationItem.interp_fill_show,
    showLine: Boolean(lastFormationItem.show_line),
    backgroundColor: Number(`0x${lastFormationItem.bg_color}`),
    backgroundAlpha: Number(lastFormationItem.bg_percent),
    color: Number(`0x${lastFormationItem.color}`)
  });

  return items;
}

export default React.memo(({ container, width, view, gridGutter }) => {
  const [{ selectedFormation, editMode, pendingAddTop }, dispatch] = useFormationsStore();
  const { refresh, canvasRef } = useInterpretationRenderer();
  const { wellId } = useWellIdContainer();

  const selectedSurvey = useSelectedSurvey();
  const [surveysAndProjections] = useComputedSurveysAndProjections();
  const selectedSurveyIndex = useMemo(
    () => (selectedSurvey ? surveysAndProjections.findIndex(s => s.id === selectedSurvey.id) : -1),
    [selectedSurvey, surveysAndProjections]
  );

  const { formationsData, addTop, serverFormations } = useFormationsDataContainer();
  const formationDataForSelectedSurvey = useMemo(
    () => (selectedSurveyIndex > -1 ? computeFormationsData(formationsData, selectedSurveyIndex) : []),
    [selectedSurveyIndex, formationsData]
  );

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
          {selectedSurvey &&
            formationDataForSelectedSurvey.map((f, index) => (
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
              selectedSurveyIndex={selectedSurveyIndex}
              container={container}
              formationData={formationDataForSelectedSurvey}
            />
          )}
        </React.Fragment>
      )}
    />
  );
});

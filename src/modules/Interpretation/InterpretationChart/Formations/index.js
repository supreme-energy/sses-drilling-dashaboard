import React, { useMemo, useCallback, useEffect } from "react";
import PixiRectangle from "../../../../components/PixiRectangle";
import { useFormationsDataContainer } from "../../../App/Containers";
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

function Formation({ y, height, label, width, container, backgroundAlpha, backgroundColor, color, showLine }) {
  const lineData = useMemo(() => [[10, 0], [width - 10, 0]], [width]);
  return (
    <React.Fragment>
      <PixiRectangle
        backgroundColor={backgroundColor}
        backgroundAlpha={backgroundAlpha}
        x={12}
        y={y}
        width={width}
        height={height}
        container={container}
      />

      {showLine && (
        <PixiContainer
          updateTransform={frozenScaleTransform}
          y={y}
          container={container}
          child={container => (
            <PixiLine container={container} data={lineData} color={color} lineWidth={3} nativeLines={false} />
          )}
        />
      )}
      <PixiText container={container} text={label} y={y} x={20} color={color} fontSize={11} />
    </React.Fragment>
  );
}

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
    showLine: Boolean(lastFormationItem.show_line),
    backgroundColor: Number(`0x${lastFormationItem.bg_color}`),
    backgroundAlpha: Number(lastFormationItem.bg_percent),
    color: Number(`0x${lastFormationItem.color}`)
  });

  return items;
}

export default React.memo(({ container, width, view, gridGutter }) => {
  const [{ selectedFormation, editMode, pendingAddTop }, dispatch] = useFormationsStore();
  const { refresh } = useInterpretationRenderer();

  useEffect(refresh, [refresh, selectedFormation, pendingAddTop]);

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
  return (
    <React.Fragment>
      {selectedSurvey &&
        formationDataForSelectedSurvey.map(f => <Formation container={container} width={width} {...f} key={f.id} />)}
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
          selectedSurveyIndex={selectedSurveyIndex}
          container={container}
          formationData={formationDataForSelectedSurvey}
        />
      )}
    </React.Fragment>
  );
});

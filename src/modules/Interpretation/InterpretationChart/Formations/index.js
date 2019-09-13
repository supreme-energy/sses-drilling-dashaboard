import React, { useMemo, useCallback, useEffect } from "react";
import PixiRectangle from "../../../../components/PixiRectangle";
import { useFormationsDataContainer, useFilteredFormations } from "../../../App/Containers";
import PixiText from "../../../../components/PixiText";
import { useFormationsStore } from "./store";
import FormationsTops from "./FormationsTops";
import { useSelectedSurvey, useComputedSurveysAndProjections } from "../../selectors";
import PixiLine from "../../../../components/PixiLine";
import { frozenScaleTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiContainer from "../../../../components/PixiContainer";
import FormationSegments from "./FormationSegments";
import { useInterpretationRenderer } from "..";

function Formation({ y, height, label, width, container, backgroundAlpha, backgroundColor, color, showLine }) {
  console.log("formation", label, y);
  const lineData = useMemo(() => [[10, 0], [width - 10, 0]], [width, 0]);
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
  return rawFormationsData.reduce((acc, item, index) => {
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
}

export default React.memo(({ container, width, view, gridGutter }) => {
  const [{ selectedFormation }, dispatch] = useFormationsStore();
  const { refresh } = useInterpretationRenderer();

  useEffect(refresh, [refresh, selectedFormation]);

  const selectedSurvey = useSelectedSurvey();
  const [surveysAndProjections] = useComputedSurveysAndProjections();
  const selectedSurveyIndex = useMemo(
    () => (selectedSurvey ? surveysAndProjections.findIndex(s => s.id === selectedSurvey.id) : -1),
    [selectedSurvey, surveysAndProjections]
  );

  const { formationsData } = useFormationsDataContainer();
  const formationDataForSelectedSurvey = useMemo(
    () => (selectedSurveyIndex > -1 ? computeFormationsData(formationsData, selectedSurveyIndex) : []),
    [selectedSurveyIndex, formationsData]
  );

  const toggleSegmentSelection = useCallback(id => dispatch({ type: "TOGGLE_SELECTION", formationId: id }), [dispatch]);

  return (
    <React.Fragment>
      {selectedSurvey &&
        formationDataForSelectedSurvey.map(f => <Formation container={container} width={width} {...f} key={f.id} />)}
      <FormationSegments
        refresh={refresh}
        gridGutter={gridGutter}
        selectedFormation={selectedFormation}
        container={container}
        formationData={formationDataForSelectedSurvey}
        view={view}
        onSegmentClick={toggleSegmentSelection}
      />
    </React.Fragment>
  );
});

import React, { useRef, useCallback, useMemo } from "react";
import PixiText from "../../../../../components/PixiText";
import PixiContainer from "../../../../../components/PixiContainer";
import { colorBySection } from "../../../../../constants/pixiColors";
import { getHoursDif } from "../../../utils/time";
import PixiLine from "../../../../../components/PixiLine";
import PixiCircle from "../../../../../components/PixiCircle";
import { getScaledValue } from "../../../utils/scale";
import { frozenScaleTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";

function Label({ x, y, text, container, view, viewWidth, color }) {
  const textRef = useRef(null);

  const textWidth = (textRef.current && textRef.current.pixiText.width) || 0;
  const padding = 5;
  const getScaledPosition = useCallback(
    (x, y) => ({ y: getScaledValue(view.yScale, y), x: getScaledValue(view.xScale, x) }),
    [view]
  );

  return (
    <PixiContainer
      container={container}
      x={getScaledValue(view.xScale, viewWidth - textWidth - 20)}
      y={y}
      child={container => (
        <PixiText
          {...getScaledPosition(padding, padding)}
          ref={textRef}
          container={container}
          text={text}
          fontSize={12}
          color={color}
        />
      )}
    />
  );
}

export function SectionsGraph({ container, view, dataBySection, mapData, data, hoursScale, sectionsData, width }) {
  const lineData = useMemo(
    () =>
      sectionsData.length ? sectionsData.map(s => s[0]).concat(sectionsData[sectionsData.length - 1][1]) : sectionsData,
    [sectionsData]
  );

  return (
    <React.Fragment>
      {/* frozenScaleTransform will not scale */}
      <PixiContainer
        container={container}
        updateTransform={frozenScaleTransform}
        child={container => (
          <PixiLine
            view={view}
            nativeLines={false}
            lineWidth={3}
            container={container}
            data={lineData}
            mapData={d => [d.position[0], d.position[1]]}
            color={0x9d9d9d}
          />
        )}
      />

      {sectionsData.map(d => (
        <PixiCircle
          key={d[0].key}
          container={container}
          x={d[0].position[0]}
          y={d[0].position[1]}
          backgroundColor={d[0].color}
        />
      ))}
      {[...dataBySection].map(([key, value]) => {
        const position = mapData(value[0]);
        return (
          <Label
            container={container}
            key={key}
            text={key}
            viewWidth={width}
            x={hoursScale(getHoursDif(data[0].Date_Time, value[0].Date_Time)) + 10}
            y={position[1]}
            view={view}
            color={colorBySection[key]}
          />
        );
      })}
    </React.Fragment>
  );
}

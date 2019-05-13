import React, { useRef, useCallback, useMemo } from "react";
import PixiText from "./PixiText";
import PixiRectangle from "./PixiRectangle";
import PixiContainer from "./PixiContainer";
import { colorBySection } from "../../../../../constants/colors";
import { getHoursDif } from "../../../utils/time";
import PixiLine from "./PixiLine";
import PixiPoint from "./PixiPoint";

const getScaledValue = (scaleFactor, value) => (1 / scaleFactor) * value;

function Label({ x, y, text, container, view, bgColor }) {
  const textRef = useRef(null);

  const textWidth = (textRef.current && textRef.current.pixiText.width) || 0;
  const textHeight = (textRef.current && textRef.current.pixiText.height) || 0;
  const padding = 5;

  const getScaledPosition = useCallback(
    (x, y) => ({ y: getScaledValue(view.yScale, y), x: getScaledValue(view.xScale, x) }),
    [view]
  );

  return (
    <PixiContainer container={container} x={x} y={y}>
      {container => (
        <React.Fragment>
          <PixiRectangle
            container={container}
            width={textWidth + 2 * padding}
            height={textHeight + 2 * padding}
            backgroundColor={bgColor}
          />
          <PixiText
            {...getScaledPosition(padding, padding)}
            ref={textRef}
            container={container}
            text={text}
            fontSize={12}
            color={0xffffff}
          />
        </React.Fragment>
      )}
    </PixiContainer>
  );
}

export function SectionsGraph({ container, view, dataBySection, mapData, data, hoursScale, sectionsData }) {
  return (
    <React.Fragment>
      {sectionsData.map(d => (
        <React.Fragment key={d.key}>
          <PixiLine
            container={container}
            data={d}
            mapData={d => [getScaledValue(view.xScale, d.position[0]), d.position[1]]}
            color={d[0].color}
          />
          <PixiPoint
            container={container}
            x={getScaledValue(view.xScale, d[0].position[0])}
            y={d[0].position[1]}
            backgroundColor={d[0].color}
          />
        </React.Fragment>
      ))}
      {[...dataBySection].map(([key, value]) => {
        const position = mapData(value[0]);
        return (
          <Label
            container={container}
            key={key}
            text={key}
            x={getScaledValue(view.xScale, hoursScale(getHoursDif(data[0].Date_Time, value[0].Date_Time)) + 10)}
            y={position[1] - getScaledValue(view.yScale, 12)}
            view={view}
            bgColor={colorBySection[key]}
          />
        );
      })}
    </React.Fragment>
  );
}

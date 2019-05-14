import React, { useMemo } from "react";
import { range, tickStep } from "d3-array";
import PixiText from "./PixiText";
import PixiContainer from "./PixiContainer";
import PixiRectangle from "./PixiRectangle";

import { frozenXTransform } from "../../../../ComboDashboard/components/CrossSection/customPixiTransforms";

const textAnchor = [0.5, 0.5];

export default function XAxis({ minH, maxH, container, scale, view, width, ...props }) {
  // find nice rounded values for interval
  let xTicks = range(minH, maxH, tickStep(minH, maxH, 5));

  return (
    <PixiContainer updateTransform={frozenXTransform} container={container} {...props}>
      {container => (
        <React.Fragment>
          <PixiRectangle container={container} width={width} height={20} backgroundColor={0xffffff} />
          {xTicks.map((t, index) => (
            <PixiText
              key={t}
              anchor={textAnchor}
              y={10}
              x={scale(t)}
              container={container}
              text={t}
              fontSize={15}
              color={0x999999}
            />
          ))}
        </React.Fragment>
      )}
    </PixiContainer>
  );
}

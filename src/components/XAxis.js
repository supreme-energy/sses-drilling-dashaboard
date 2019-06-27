import React from "react";
import { range, tickStep } from "d3-array";
import PixiText from "./PixiText";
import PixiRectangle from "./PixiRectangle";
import PropTypes from "prop-types";
import PixiContainer from "./PixiContainer";
const textAnchor = [0.5, 0.5];

export default function XAxis({ container, scale, numberOfTicks, height, ...props }) {
  const [minValue, maxValue] = scale.domain();
  // find nice rounded values for interval
  let xTicks = range(minValue, maxValue, tickStep(minValue, maxValue, numberOfTicks));

  const [minX, maxX] = scale.range();
  const width = maxX - minX;
  return (
    <PixiContainer
      container={container}
      {...props}
      child={container => (
        <React.Fragment>
          <PixiRectangle container={container} width={width} height={height} backgroundColor={0xffffff} />
          {xTicks.map((t, index) => (
            <PixiText
              key={t}
              anchor={textAnchor}
              y={height / 2 + 2}
              x={scale(t)}
              container={container}
              text={t}
              fontSize={15}
              color={0x999999}
            />
          ))}
        </React.Fragment>
      )}
    />
  );
}

XAxis.defaultProps = {
  numberOfTicks: 5
};

XAxis.propTypes = {
  numberOfTicks: PropTypes.number,
  container: PropTypes.object.isRequired,
  scale: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired
};

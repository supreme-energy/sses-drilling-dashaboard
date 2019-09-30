import React from "react";
import { ticks } from "d3-array";
import PixiText from "./PixiText";

import PropTypes from "prop-types";
import PixiContainer from "./PixiContainer";
import { noDecimals } from "../constants/format";
const textAnchor = [0.5, 0.5];

export default function YAxis({ container, scale, numberOfTicks, width, yMin, yMax, ...props }) {
  const min = scale.invert(yMin);
  const max = scale.invert(yMax);

  // find nice rounded values for interval
  const yTicks = ticks(Math.floor(min), Math.floor(max), numberOfTicks);

  return (
    <PixiContainer
      container={container}
      {...props}
      child={container =>
        yTicks.map((t, index) => (
          <PixiText
            key={index}
            anchor={textAnchor}
            x={width / 2}
            y={scale(t)}
            container={container}
            text={noDecimals(t)}
            fontSize={13}
            color={0x999999}
          />
        ))
      }
    />
  );
}

YAxis.defaultProps = {
  numberOfTicks: 5
};

YAxis.propTypes = {
  numberOfTicks: PropTypes.number,
  container: PropTypes.object.isRequired,
  scale: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  yMax: PropTypes.number.isRequired,
  yMin: PropTypes.number.isRequired
};

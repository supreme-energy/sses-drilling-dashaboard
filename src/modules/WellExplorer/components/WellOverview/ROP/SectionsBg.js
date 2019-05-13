import React, { useMemo } from "react";
import { getHoursDif } from "../../../utils/time";
import { colorBySection } from "../../../../../constants/colors";
import { pairs } from "d3-array";
import PixiRectangle from "./PixiRectangle";

export default function SectionsBg({ container, view, width, hoursScale, sectionsData }) {
  console.log("sections bg", sectionsData);
  return (
    <React.Fragment>
      {sectionsData.map(s => {
        console.log("height", s[1].position[1] - s[0].position[1]);
        console.log("color", s[0].color);
        console.log("wwidth", width);
        return (
          <PixiRectangle
            key={s[0].key}
            container={container}
            with={width}
            x={200}
            height={s[1].position[1] - s[0].position[1]}
            y={s[0].position[1]}
            backgroundColor={s[0].color}
          />
        );
      })}
    </React.Fragment>
  );
}

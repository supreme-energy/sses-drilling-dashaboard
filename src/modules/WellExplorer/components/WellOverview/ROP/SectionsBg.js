import React from "react";
import PixiRectangle from "./PixiRectangle";
import * as wellSections from "../../../../../constants/wellSections";

const colorBySection = {
  [wellSections.SURFACE]: 0xc2cfe9,
  [wellSections.INTERMEDIATE]: 0xc7d5bd,
  [wellSections.CURVE]: 0xd4d4d4,
  [wellSections.LATERAL]: 0xe7dab0
};

export default function SectionsBg({ container, width, hoursScale, sectionsData }) {
  return sectionsData.map(s => {
    return (
      <PixiRectangle
        updateTransform={null}
        key={s[0].key}
        container={container}
        width={width}
        x={0}
        height={s[1].position[1] - s[0].position[1]}
        y={s[0].position[1]}
        backgroundColor={colorBySection[s[0].key]}
      />
    );
  });
}

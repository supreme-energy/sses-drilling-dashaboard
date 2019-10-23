import React from "react";

import { useComputedFilteredWellData } from "../../../App/Containers";
import { useSelectedWellInfoColors } from "../../../Interpretation/selectors";
import { hexColor } from "../../../../constants/pixiColors";
import PixiContainer from "../../../../components/PixiContainer";
import { frozenScaleTransform } from "./customPixiTransforms";
import PixiLine from "../../../../components/PixiLine";

export default function TCLLine({ container, width, view, ...props }) {
  const colors = useSelectedWellInfoColors();
  const color = hexColor(colors.colortot);
  const { surveys, projections } = useComputedFilteredWellData();

  const items = surveys.concat(projections);

  return (
    <PixiContainer
      updateTransform={frozenScaleTransform}
      container={container}
      child={container =>
        items.map((s, index) => {
          const nextS = items[index + 1];
          if (!nextS) {
            return null;
          }
          return (
            <PixiLine
              key={s.id}
              container={container}
              data={[
                [s.vs * view.xScale, (s.tcl + nextS.fault) * view.yScale],
                [nextS.vs * view.xScale, nextS.tcl * view.yScale]
              ]}
              color={color}
              lineWidth={2}
              nativeLines={false}
            />
          );
        })
      }
      {...props}
    />
  );
}

import React, { useEffect } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData } from "../selectors";
import { useInterpretationRenderer } from ".";
import PixiContainer from "../../../components/PixiContainer";
import { draftColor, selectionColor, logColor } from "../pixiColors";

const mapWellLog = d => [d.value, d.depth];
export default function LogDataLine({ wellId, log, prevLog, container, bias, draft, selected, ...props }) {
  const logData = useGetComputedLogData(wellId, log, draft);
  const { refresh } = useInterpretationRenderer();

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, logData]
  );

  return (
    <PixiContainer
      x={bias}
      y={0}
      container={container}
      child={container =>
        logData ? (
          <PixiLine
            {...props}
            key={log.id}
            container={container}
            data={logData.data}
            mapData={mapWellLog}
            color={draft ? draftColor : selected ? selectionColor : logColor}
          />
        ) : null
      }
    />
  );
}

LogDataLine.defaultProps = {
  bias: 0
};

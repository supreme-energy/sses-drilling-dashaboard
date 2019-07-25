import React, { useEffect, useMemo, useRef } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData, useSelectedLogExtent, useSelectedSegmentState } from "../selectors";
import { draftColor, selectionColor, logColor } from "../pixiColors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { useBiasAndScaleActions } from "../actions";

const mapWellLog = d => [d.value, d.depth];

function SelectedLogData(props) {
  const [, dispatch] = useComboContainer();

  const segmentData = useSelectedSegmentState();
  // if we are in draft mode, we will have some draftData defined
  const { scalebias: bias, scalefactor: scale } = segmentData.draftData || segmentData;

  const [xMin, xMax] = useSelectedLogExtent();
  const { changeSelectedSegmentBias } = useBiasAndScaleActions(dispatch);
  const width = xMax - xMin;

  const internalState = useRef({ prevLogData: null });

  useEffect(
    function setInitialBias() {
      const prevLogData = internalState.current.prevLogData;
      if (
        props.logData &&
        (!prevLogData || props.logData.tablename !== prevLogData.tablename) &&
        props.draft &&
        width
      ) {
        changeSelectedSegmentBias(width + 10);

        internalState.current.prevLogData = props.logData;
      }
    },
    [props.logData, props.draft, changeSelectedSegmentBias, xMin, width]
  );

  const computedWidth = width * scale;
  const x = bias + xMin - (computedWidth - width) / 2 - xMin * scale;
  const pixiScale = useMemo(() => ({ y: 1, x: scale || 1 }), [scale]);

  return <LogData {...props} x={x} scale={pixiScale} />;
}

function LogData({ container, logData, width, pivot, selected, draft, ...props }) {
  return logData ? <PixiLine {...props} container={container} data={logData.data} mapData={mapWellLog} /> : null;
}

export default function LogDataLine({ wellId, log, prevLog, container, draft, selected, refresh, ...props }) {
  const logData = useGetComputedLogData(wellId, log, draft);
  const logDataNonDraft = useGetComputedLogData(wellId, log, false);

  // we need to call refresh after log data is loaded to redraw
  useEffect(() => {
    refresh();
  }, [logData, refresh]);

  return (
    <React.Fragment>
      {(draft || !selected) && (
        <LogData
          color={draft ? selectionColor : logColor}
          logData={logDataNonDraft}
          container={container}
          selected={selected}
        />
      )}

      {(draft || selected) && (
        <SelectedLogData
          selected={selected}
          color={!draft && selected ? selectionColor : draftColor}
          draft={draft}
          logData={logData}
          container={container}
        />
      )}
    </React.Fragment>
  );
}

LogDataLine.defaultProps = {
  bias: 0
};

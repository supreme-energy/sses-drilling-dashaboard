import React, { useEffect, useMemo, useRef } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData, getExtent } from "../selectors";
import { draftColor, selectionColor, logColor } from "../pixiColors";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { useBiasAndScaleActions } from "../actions";

const mapWellLog = d => [d.value, d.depth];

// this is a component to work around conditinal hooks limitation, it will be renderer only for draft and
// will init draft position to not overlap with normal line
function DraftLineInit({ logData, width, xMin, bias }) {
  const [, dispatch] = useComboContainer();

  const { changeSelectedSegmentBias } = useBiasAndScaleActions(dispatch);
  const internalState = useRef({ prevLogData: null });

  useEffect(
    function setInitialBias() {
      const prevLogData = internalState.current.prevLogData;
      if (logData && (!prevLogData || logData.tablename !== prevLogData.tablename) && width) {
        changeSelectedSegmentBias(bias + width + 10);

        internalState.current.prevLogData = logData;
      }
    },
    [logData, changeSelectedSegmentBias, xMin, width, bias]
  );
  return null;
}

function LogData({ logData, draft, ...props }) {
  const { scalebias: bias, scalefactor: scale } = logData.draftData || logData;

  const [xMin, xMax] = useMemo(() => getExtent(logData), [logData]);

  const width = xMax - xMin;

  const computedWidth = width * scale;
  const x = bias + xMin - (computedWidth - width) / 2 - xMin * scale;
  const pixiScale = useMemo(() => ({ y: 1, x: scale || 1 }), [scale]);

  return (
    <React.Fragment>
      <PixiLine {...props} x={x} scale={pixiScale} mapData={mapWellLog} data={logData.data} />
      {draft && <DraftLineInit logData={logData} width={width} xMin={xMin} bias={bias} />}
    </React.Fragment>
  );
}

function LogDataLine({ wellId, log, prevLog, container, draft, selected, refresh, ...props }) {
  const logData = useGetComputedLogData(wellId, log, draft);

  // we need to call refresh after log data is loaded to redraw
  useEffect(() => {
    refresh();
  }, [logData, refresh]);

  return logData ? (
    <LogData
      color={draft ? draftColor : selected ? selectionColor : logColor}
      draft={draft}
      logData={logData}
      container={container}
      selected={selected}
    />
  ) : null;
}

export default props => {
  const { draft } = props;

  return (
    <React.Fragment>
      <LogDataLine {...props} draft={false} key={"line"} />
      {draft && <LogDataLine {...props} draft key={"draftLine"} />}
    </React.Fragment>
  );
};

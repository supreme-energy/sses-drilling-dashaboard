import React, { useEffect, useMemo, useRef } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData, getExtent, useSelectedWellInfoColors } from "../selectors";

import { hexColor } from "../../../constants/pixiColors";
import { useWellLogData, EMPTY_ARRAY } from "../../../api";
import { useWellIdContainer } from "../../App/Containers";
import { computeLineBiasAndScale } from "../../../utils/lineBiasAndScale";

import PixiContainer from "../../../components/PixiContainer";

const mapWellLog = d => [d.value, d.depth];

const LogData = React.memo(({ logData, range, extent, draft, container, parentScale, ...props }) => {
  const { scalebias: bias, scalefactor: scale } = logData;
  const [x, pixiScale] = useMemo(() => computeLineBiasAndScale(bias, scale, extent), [bias, scale, extent]);

  const filteredLogData = useMemo(() => {
    if (!range) {
      return logData.data;
    }
    const [startMd, endMd] = range;
    // some logs start after or before our range so we don't include them and not filter either
    const shouldBeIncluded = logData.endmd >= startMd && logData.startmd <= endMd;
    return range
      ? shouldBeIncluded
        ? logData.data.filter(d => d.md >= range[0] && d.md <= range[1])
        : []
      : logData.data;
  }, [logData, range]);

  return (
    <PixiContainer
      container={container}
      child={container => (
        <PixiLine
          x={x / parentScale}
          scale={pixiScale}
          {...props}
          mapData={mapWellLog}
          data={filteredLogData}
          container={container}
        />
      )}
    />
  );
});

function LogDataLine({
  log,
  prevLog,
  container,
  draft,
  selected,
  refresh,
  range,
  colors,
  extent,
  logLineData,
  logColor,
  logData,
  parentScale
}) {
  const computedLogData = useGetComputedLogData(log && log.id, draft);
  const internalState = useRef({ dataLoaded: false });

  useEffect(() => {
    // refresh when we have computedLogData
    if (!internalState.current.dataLoaded && computedLogData) {
      refresh();
      internalState.current.dataLoaded = true;
    }
  }, [refresh, computedLogData]);

  return computedLogData ? (
    <LogData
      range={range}
      color={draft ? hexColor(colors.draftcolor) : selected ? hexColor(colors.selectedsurveycolor) : logColor}
      draft={draft}
      extent={extent}
      logData={computedLogData}
      container={container}
      selected={selected}
      parentScale={parentScale}
    />
  ) : null;
}

export default props => {
  const { draft, refresh } = props;
  const { wellId } = useWellIdContainer();
  const [logData] = useWellLogData(wellId, props.log && props.log.tablename);
  const colors = useSelectedWellInfoColors();
  const extent = useMemo(() => {
    return logData ? getExtent(logData) : EMPTY_ARRAY;
  }, [logData]);

  const internalState = useRef({ prevData: null });
  useEffect(() => {
    if (logData && internalState.current.prevData !== logData.data) {
      refresh();

      internalState.current.prevData = logData.data;
    }
  }, [logData, refresh]);

  const lineProps = { extent, colors, logData };
  return (
    <React.Fragment>
      <LogDataLine {...props} draft={false} {...lineProps} />
      {draft && <LogDataLine {...props} draft {...lineProps} />}
    </React.Fragment>
  );
};

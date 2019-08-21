import React, { useEffect, useMemo } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData, getExtent } from "../selectors";
import { draftColor, selectionColor, logColor } from "../pixiColors";

const mapWellLog = d => [d.value, d.depth];

const LogData = React.memo(({ logData, draft, range, ...props }) => {
  const { scalebias: bias, scalefactor: scale } = logData;

  const [xMin, xMax] = useMemo(() => getExtent(logData), [logData]);

  const width = xMax - xMin;

  const computedWidth = width * scale;
  const x = bias + xMin - (computedWidth - width) / 2 - xMin * scale;
  const pixiScale = useMemo(() => ({ y: 1, x: scale || 1 }), [scale]);

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
    <React.Fragment>
      <PixiLine {...props} x={x} scale={pixiScale} mapData={mapWellLog} data={filteredLogData} />
    </React.Fragment>
  );
});

function LogDataLine({ wellId, log, prevLog, container, draft, selected, refresh, range }) {
  const logData = useGetComputedLogData(wellId, log, draft);

  // we need to call refresh after log data is loaded to redraw
  useEffect(() => {
    refresh();
  }, [logData, refresh]);

  return logData ? (
    <LogData
      range={range}
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

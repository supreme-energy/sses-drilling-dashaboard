import React, { useEffect, useMemo } from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData, getExtent, useSelectedWellInfoColors } from "../selectors";

import { hexColor } from "../../../constants/pixiColors";
import { useWellLogData, EMPTY_ARRAY } from "../../../api";
import { useWellIdContainer } from "../../App/Containers";
import { computeLineBiasAndScale } from "../../../utils/lineBiasAndScale";

const mapWellLog = d => [d.value, d.depth];

const LogData = ({ logData, range, extent, draft, container, ...props }) => {
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
    <PixiLine {...props} x={x} scale={pixiScale} mapData={mapWellLog} data={filteredLogData} container={container} />
  );
};

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
  logColor
}) {
  const computedLogData = useGetComputedLogData(log && log.id, draft);

  return computedLogData ? (
    <LogData
      range={range}
      color={draft ? hexColor(colors.draftcolor) : selected ? hexColor(colors.selectedsurveycolor) : logColor}
      draft={draft}
      extent={extent}
      logData={computedLogData}
      container={container}
      selected={selected}
    />
  ) : null;
}

export default ({ refresh, ...props }) => {
  const { draft } = props;
  const { wellId } = useWellIdContainer();
  const [logData] = useWellLogData(wellId, props.log && props.log.tablename);
  const colors = useSelectedWellInfoColors();
  const extent = useMemo(() => {
    return logData ? getExtent(logData) : EMPTY_ARRAY;
  }, [logData]);

  // we need to call refresh after log data is loaded to redraw
  useEffect(refresh, [logData, refresh]);

  return (
    <React.Fragment>
      <LogDataLine {...props} draft={false} key={"line"} colors={colors} extent={extent} />
      {draft && <LogDataLine {...props} draft key={"draftLine"} colors={colors} extent={extent} />}
    </React.Fragment>
  );
};

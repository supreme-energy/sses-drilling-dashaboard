import React from "react";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData } from "../selectors";

const mapWellLog = d => [d.value, d.depth];
export default function LogDataLine({ wellId, log, prevLog, container, selected }) {
  const logData = useGetComputedLogData(wellId, log);

  return logData ? (
    <PixiLine
      key={log.id}
      container={container}
      data={logData.data}
      mapData={mapWellLog}
      color={selected ? 0xee2211 : 0x0d0079}
    />
  ) : null;
}

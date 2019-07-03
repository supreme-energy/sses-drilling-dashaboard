import React from "react";
import { useWellLogData } from "../../../api";
import PixiLine from "../../../components/PixiLine";

const mapWellLog = d => [d.value, d.depth];
export default function LogDataLine({ wellId, log, container, selected }) {
  const [logData] = useWellLogData(wellId, log && log.tablename);
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

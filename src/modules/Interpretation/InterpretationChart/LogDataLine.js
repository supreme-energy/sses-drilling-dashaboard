import React, { useMemo } from "react";
import { useWellLogData } from "../../../api";
import PixiLine from "../../../components/PixiLine";
import { useGetComputedLogData } from "../selectors";

function calcDepth(tvd, dip, vs, lastvs, fault, lasttvd, lastdepth) {
  //console.log("calc depth", tvd, dip, vs, lastvs, fault, lasttvd, lastdepth);
  return tvd - -Math.tan(dip / 57.29578) * Math.abs(vs - lastvs) - fault - (lasttvd - lastdepth);
}

function calcDIP(tvd, depth, vs, lastvs, fault, lasttvd, lastdepth) {
  return -Math.atan((tvd - fault - (lasttvd - lastdepth) - depth) / Math.abs(vs - lastvs)) * 57.29578;
}

function getLogData(logData, prevLog, prevLogData, dip = 0) {
  if (!logData) {
    return logData;
  }

  let { startvs: lastVS, starttvd: lastTVD, startmd: lastMD, startdepth: lastDepth } = logData;
  //console.log("prevLog", prevLog, prevLogData, logData);
  if (prevLog) {
    lastVS = prevLog.endvs;
    lastTVD = prevLog.endtvd;
    lastMD = prevLog.endmd;
    lastDepth = prevLog.enddepth;
  }

  return (
    logData &&
    logData.data.map(d => {
      const { vs, tvd, md } = d;

      const depth = calcDepth(tvd, 50, vs, lastVS, logData.fault, lastTVD, lastDepth);
      // console.log("compare", d.depth, depth);
      // console.log(
      //   "compare dip",
      //   tvd,
      //   depth,
      //   vs,
      //   lastVS,
      //   logData.fault,
      //   lastTVD,
      //   lastDepth,
      //   calcDIP(tvd, depth, vs, lastVS, logData.fault, lastTVD, lastDepth)
      // );
      return {
        ...d,
        depth
      };
    })
  );
}

const mapWellLog = d => [d.value, d.depth];
export default function LogDataLine({ wellId, log, prevLog, container, selected }) {
  const logData = useGetComputedLogData(wellId, log, prevLog);

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

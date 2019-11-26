import React, { useMemo } from "react";
import PixiLine from "../../../components/PixiLine";
import { useComboContainer } from "../../ComboDashboard/containers/store";
import { logDataExtent, getColorForWellLog } from "../selectors";
import { computeLineBiasAndScale } from "../../../utils/lineBiasAndScale";
import PixiContainer from "../../../components/PixiContainer";

const mapControlLog = d => [d.value, d.md];
export default function ControlLogLine({ log, ...props }) {
  const [{ logsBiasAndScale, colorsByWellLog }] = useComboContainer();
  const { bias, scale } = logsBiasAndScale[log.id] || { bias: 1, scale: 1 };
  const extent = logDataExtent(log.data);
  const [x, pixiScale] = useMemo(() => computeLineBiasAndScale(bias, scale, extent), [bias, scale, extent]);
  const color = Number(`0x${getColorForWellLog(colorsByWellLog, log.id)}`);
  return (
    <PixiContainer
      scale={pixiScale}
      zIndex={1}
      x={x}
      {...props}
      child={container => <PixiLine container={container} data={log.data} mapData={mapControlLog} color={color} />}
    />
  );
}

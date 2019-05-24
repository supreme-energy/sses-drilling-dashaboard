import React from "react";
import { useWellOverviewKPI } from "../../../api";
import Kpi from "./Kpi";

export default function DrillPhaseKPI() {
  const { data } = useWellOverviewKPI();
  const drillingPhase = data.find(d => !d.casingSize);

  return <Kpi data={drillingPhase} />;
}

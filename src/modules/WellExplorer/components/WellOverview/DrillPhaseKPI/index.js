import React from "react";
import { useWellOverviewKPI } from "../../../../../api";
import Kpi from "./Kpi";

export default function DrillPhaseKPI() {
  const { data } = useWellOverviewKPI();
  const drillingPhase = data.find(d => !d.casingSize);
  console.log("data", drillingPhase);
  return <Kpi data={data} />;
}

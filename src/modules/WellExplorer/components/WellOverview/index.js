import React from "react";
import { Card } from "@material-ui/core";
import OverivewKpi from "./OverviewKpi";

export default function WellOverivew({ className, well }) {
  return <Card className={className}>{well && <OverivewKpi well={well} />}</Card>;
}

import React from "react";
import { Card } from "@material-ui/core";
import OverivewKpi from "./OverviewKpi";

export default function WellOverivew({ className, well, updateFavorite }) {
  return <Card className={className}>{well && <OverivewKpi well={well} updateFavorite={updateFavorite} />}</Card>;
}

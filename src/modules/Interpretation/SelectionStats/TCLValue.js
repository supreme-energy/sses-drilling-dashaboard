import React from "react";
import css from "./styles.scss";
import CondensedText from "../../../components/ContensedText.js";
import { Box } from "@material-ui/core";
import { useSelectedSurvey } from "../selectors";
import { formatValue } from "../../../constants/format";
import useRef from "react-powertools/hooks/useRef";
import WellColorPicker from "./WellColorPicker";

export default function TCLValue() {
  const selectedSurvey = useSelectedSurvey();
  const pickerContainerRef = useRef(null);

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <CondensedText className={css.label}>TCL</CondensedText>
      <div ref={pickerContainerRef} />
      <WellColorPicker field={"colortot"} />
      <CondensedText className={css.value}>{formatValue(selectedSurvey, "tcl")}</CondensedText>
    </Box>
  );
}

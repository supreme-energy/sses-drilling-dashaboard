import React from "react";
import css from "./styles.scss";
import CondensedText from "../../../components/ContensedText.js";
import { Box } from "@material-ui/core";
import { useSelectedSurvey } from "../selectors";
import { formatValue } from "../../../constants/format";
import useRef from "react-powertools/hooks/useRef";
import ColorPickerBox from "../../../components/ColorPickerBox";
import { useWellIdContainer, selectedWellInfoContainer } from "../../App/Containers";

export default function TCLValue() {
  const selectedSurvey = useSelectedSurvey();
  const pickerContainerRef = useRef(null);

  const { wellId } = useWellIdContainer();
  const [{ wellInfo }, , updateWell] = selectedWellInfoContainer();

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <CondensedText className={css.label}>TCL</CondensedText>
      <div ref={pickerContainerRef} />
      {wellInfo && (
        <ColorPickerBox
          hex={`#${wellInfo.colortot}`}
          color={`#${wellInfo.colortot}`}
          boxProps={{ className: css.colorBox }}
          handleSave={value => {
            console.log("handle save", value);
            updateWell({ wellId, field: "colortot", value: value.replace("#", "") });
          }}
        />
      )}
      <CondensedText className={css.value}>{formatValue(selectedSurvey, "tcl")}</CondensedText>
    </Box>
  );
}

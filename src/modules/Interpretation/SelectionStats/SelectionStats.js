import React, { useMemo } from "react";
import { Box } from "@material-ui/core";
import CondensedText from "../../../components/ContensedText.js";
import css from "./styles.scss";
import { twoDecimals, EMPTY_FIELD, formatValue } from "../../../constants/format.js";
import { useGetComputedLogData } from "../selectors.js";

const lastValue = array => array[array.length - 1];

export default function SelectionStats({ draft, selection, selectedWellLog, gammaRange, ...boxProps }) {
  const [startWellLog] = selection;
  const endWellLog = lastValue(selection);
  const startLogData = useGetComputedLogData(startWellLog, draft);
  const [xMin, xMax] = gammaRange;

  // hide dip value if segment selection have different dip values
  const hideDipValue = useMemo(
    () => selection && selection.length > 1 && selection.some(s => s.sectdip !== selection[0].sectdip),
    [selection]
  );

  return (
    <Box display="flex" flexDirection="column" {...boxProps}>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>MD</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "startmd")}</CondensedText>
        <CondensedText className={css.label}>to</CondensedText>
        <CondensedText className={css.value}>{formatValue(endWellLog, "endmd")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>TVD</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "starttvd")}</CondensedText>
        <CondensedText className={css.label}>to</CondensedText>
        <CondensedText className={css.value}>{formatValue(endWellLog, "endtvd")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>VS</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "startvs")}</CondensedText>
        <CondensedText className={css.label}>to</CondensedText>
        <CondensedText className={css.value}>{formatValue(endWellLog, "endvs")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Gamma</CondensedText>
        <CondensedText className={css.value}>{startLogData ? twoDecimals(xMin) : EMPTY_FIELD}</CondensedText>
        <CondensedText className={css.label}>to</CondensedText>
        <CondensedText className={css.value}>{startLogData ? twoDecimals(xMax) : EMPTY_FIELD}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Scale</CondensedText>
        <CondensedText className={css.value}>{formatValue(selectedWellLog, "scalefactor")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Bias</CondensedText>
        <CondensedText className={css.value}>{formatValue(selectedWellLog, "scalebias")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Dip</CondensedText>
        <CondensedText className={css.value}>
          {hideDipValue ? EMPTY_FIELD : formatValue(selectedWellLog, "sectdip")}
        </CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Fault</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "fault")}</CondensedText>
      </Box>
    </Box>
  );
}

SelectionStats.defaultProps = {
  gammaRange: []
};

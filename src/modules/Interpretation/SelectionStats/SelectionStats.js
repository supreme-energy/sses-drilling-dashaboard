import React from "react";
import { Box } from "@material-ui/core";
import CondensedText from "../../../components/ContensedText.js";
import css from "./styles.scss";
import { twoDecimals, EMPTY_FIELD } from "../../../constants/format.js";
import { useGetComputedLogData } from "../selectors.js";

const lastValue = array => array[array.length - 1];
const formatValue = (item, prop) => (item ? twoDecimals(item[prop]) : EMPTY_FIELD);

function useGetGameExtent(selection) {}

export default function SelectionStats({ draft, selection, ...boxProps }) {
  const [startWellLog] = selection;
  const endWellLog = lastValue(selection);
  const startLogData = useGetComputedLogData(startWellLog, draft);
  const endLogData = useGetComputedLogData(endWellLog, draft);

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
        <CondensedText className={css.value}>
          {startLogData ? twoDecimals(startLogData.data[0].value) : EMPTY_FIELD}
        </CondensedText>
        <CondensedText className={css.label}>to</CondensedText>
        <CondensedText className={css.value}>
          {startLogData ? twoDecimals(lastValue(startLogData.data).value) : EMPTY_FIELD}
        </CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Scale</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "scalefactor")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Bias</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "scalebias")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Dip</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "sectdip")}</CondensedText>
      </Box>
      <Box display="flex" flexDirection="row">
        <CondensedText className={css.label}>Fault</CondensedText>
        <CondensedText className={css.value}>{formatValue(startWellLog, "fault")}</CondensedText>
      </Box>
    </Box>
  );
}

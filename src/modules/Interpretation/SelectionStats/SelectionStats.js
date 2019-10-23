import React, { useMemo } from "react";
import { Box } from "@material-ui/core";
import CondensedText from "../../../components/CondensedText";
import css from "./styles.scss";
import { twoDecimals, EMPTY_FIELD, formatValue } from "../../../constants/format.js";
import { useGetComputedLogData } from "../selectors.js";
import classNames from "classnames";

const lastValue = array => array[array.length - 1];

export const RowItem = React.memo(({ startValue, endValue, label, labelClass }) => (
  <Box display="flex" flexDirection="row">
    <CondensedText className={classNames(css.label, css.labelColumn, labelClass)}>{label}</CondensedText>
    <CondensedText className={css.value}>{startValue}</CondensedText>
    {endValue !== undefined && (
      <React.Fragment>
        <CondensedText className={classNames(css.label, css.labelColumn)}>to</CondensedText>
        <CondensedText className={css.value}>{endValue}</CondensedText>
      </React.Fragment>
    )}
  </Box>
));

export default function SelectionStats({ draft, selection, selectedWellLog, gammaRange, ...boxProps }) {
  const [startWellLog] = selection;
  const endWellLog = lastValue(selection);
  const startLogData = useGetComputedLogData(startWellLog && startWellLog.id, draft);
  const [xMin, xMax] = gammaRange;

  // hide dip value if segment selection have different dip values
  const hideDipValue = useMemo(
    () => selection && selection.length > 1 && selection.some(s => s.sectdip !== selection[0].sectdip),
    [selection]
  );

  return (
    <Box display="flex" flexDirection="column" {...boxProps}>
      <RowItem
        startValue={formatValue(startWellLog, "startmd")}
        endValue={formatValue(endWellLog, "endmd")}
        label={"MD"}
      />
      <RowItem
        startValue={formatValue(startWellLog, "starttvd")}
        endValue={formatValue(endWellLog, "endtvd")}
        label={"TVD"}
      />

      <RowItem
        startValue={formatValue(startWellLog, "startvs")}
        endValue={formatValue(endWellLog, "endvs")}
        label={"VS"}
      />

      <RowItem
        startValue={startLogData ? twoDecimals(xMin) : EMPTY_FIELD}
        endValue={startLogData ? twoDecimals(xMax) : EMPTY_FIELD}
        label={"Gamma"}
      />

      <RowItem startValue={formatValue(selectedWellLog, "scalefactor")} label={"Scale"} />
      <RowItem startValue={formatValue(selectedWellLog, "scalebias")} label={"Bias"} />
      <RowItem startValue={hideDipValue ? EMPTY_FIELD : formatValue(selectedWellLog, "sectdip")} label={"Dip"} />
      <RowItem startValue={formatValue(startWellLog, "fault")} label={"Fault"} />
    </Box>
  );
}

SelectionStats.defaultProps = {
  gammaRange: []
};

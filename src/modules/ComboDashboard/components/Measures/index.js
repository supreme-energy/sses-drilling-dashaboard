import React, { useMemo, useRef } from "react";
import { Typography } from "@material-ui/core";
import classNames from "classnames";
import _ from "lodash";
import { useSize } from "react-hook-size";
import { scaleLinear } from "d3-scale";

import { useFilteredAdditionalDataLogs } from "../../../App/Containers";
import { useAdditionalDataLogsList } from "../../../../api";
import KpiItem from "../../../Kpi/KpiItem";
import WidgetCard from "../../../WidgetCard";
import classes from "./Measures.scss";

function PercentageBarKpi({ className, value, scaleLow, scaleHigh, unit, label, ...props }) {
  const containerRef = useRef(null);
  const { width } = useSize(containerRef);

  const scale = useMemo(
    () =>
      scaleLinear()
        .domain([scaleLow, scaleHigh])
        .range([0, width]),
    [width, scaleLow, scaleHigh]
  );

  return (
    <div className={className} ref={containerRef}>
      <KpiItem value={value} measureUnit={unit} label={label} {...props} />
      <div className={classNames("layout horizontal flex", classes.bars)}>
        {value && (
          <div
            style={{ width: `${scale(value)}px`, height: 2, backgroundColor: "#66655A", top: 2, position: "relative" }}
          />
        )}
      </div>
    </div>
  );
}

function Measures({ wellId }) {
  const additionalDataLogKeys = useAdditionalDataLogsList(wellId);
  const getFieldId = field => _.get(additionalDataLogKeys, `${field}.id`);
  const useFADL = field => useFilteredAdditionalDataLogs(wellId, getFieldId(field));

  const rop = useFADL("ROP");
  const bitDepth = useFADL("BITDEPTH");
  const mDepth = useFADL("Mdepth");
  const weightOfBit = useFADL("WOB");
  const torque = useFADL("TRQ");
  const rpm = useFADL("RPM");
  const gamma = useFADL("GAMA");
  const gas = useFADL("GAS");
  const temperature = useFADL("TEMPERATURE");
  const flowIn = useFADL("FLOWIN");
  const flowOut = useFADL("FLOWOUT");
  const tvd = useFADL("TVD");
  const azm = useFADL("AZM");
  const inc = useFADL("INC");
  const mtf = useFADL("MTF");
  const gtf = useFADL("GTF");

  return (
    <WidgetCard className={classes.measures} hideMenu>
      <Typography variant="subtitle1">Measures</Typography>
      <KpiItem className={classes.kpi} value={mDepth.value} measureUnit={"in"} label={"Hole Depth"} small />
      <KpiItem className={classes.kpi} value={bitDepth.value} measureUnit={"in"} label={"Bit Depth"} small />
      <PercentageBarKpi
        className={classes.kpi}
        value={weightOfBit.value}
        scaleLow={weightOfBit.scalelo}
        scaleHigh={weightOfBit.scalehi}
        unit={"klbs"}
        label={"Weight On Bit"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={torque.value}
        scaleLow={torque.scalelo}
        scaleHigh={torque.scalehi}
        unit={"klbf-ft"}
        label={"Rotary Torque"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={rpm.value}
        scaleLow={rpm.scalelo}
        scaleHigh={rpm.scalehi}
        unit={"rpm"}
        label={"Rotary Speed"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={rop.value}
        scaleLow={rop.scalelo}
        scaleHigh={rop.scalehi}
        unit={"ft/hr"}
        label={"Rate of Penetration"}
        small
      />
      <KpiItem className={classes.kpi} value={gamma.value} label={"Gamma"} small />
      <PercentageBarKpi
        className={classes.kpi}
        value={gas.value}
        scaleLow={gas.scalelo}
        scaleHigh={gas.scalehi}
        unit={"Units"}
        label={"Gas"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={temperature.value}
        scaleLow={temperature.scalelo}
        scaleHigh={temperature.scalehi}
        unit={"\u00b0F"}
        label={"Temperature"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={flowIn.value}
        scaleLow={flowIn.scalelo}
        scaleHigh={flowIn.scalehi}
        unit={"gal/min"}
        label={"Flow In"}
        small
      />
      <PercentageBarKpi
        className={classes.kpi}
        value={flowOut.value}
        scaleLow={flowOut.scalelo}
        scaleHigh={flowOut.scalehi}
        unit={"gal/min"}
        label={"Flow Out"}
        small
      />
      <KpiItem className={classes.kpi} value={tvd.value} measureUnit={"ft"} label={"Survey TVD"} small />
      <KpiItem className={classes.kpi} value={azm.value} measureUnit={"\u00b0"} label={"Survey Azimuth"} small />
      <KpiItem className={classes.kpi} value={inc.value} measureUnit={"\u00b0"} label={"Survey Inclination"} small />
      <KpiItem className={classes.kpi} value={mtf.value} measureUnit={"Units"} label={"Survey MTF"} small />
      <KpiItem className={classes.kpi} value={gtf.value} measureUnit={"Units"} label={"Survey GTF"} small />
    </WidgetCard>
  );
}

export default Measures;

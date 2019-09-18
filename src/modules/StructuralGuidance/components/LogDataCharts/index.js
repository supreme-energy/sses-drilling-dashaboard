import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import AddCircle from "@material-ui/icons/AddCircle";
import _ from "lodash";
import classNames from "classnames";

import SegmentPlot from "./SegmentPlot";
import { VS, INITIAL_SCALE_BIAS } from "../../../../constants/structuralGuidance";
import LogMenu from "./LogMenu";
import { useAdditionalDataLogsList } from "../../../../api";
import WidgetCard from "../../../../components/WidgetCard";
import ChartContainer from "./ChartContainer";
import classes from "./styles.scss";
import CloudServerModal from "../../../Interpretation/components/CloudServerModal";
import { useSetupWizardData } from "../../../Interpretation/selectors";

const LogDataCharts = React.memo(({ wellId, view }) => {
  const { data = [], dataBySection = {} } = useAdditionalDataLogsList(wellId);
  const [selectedLogs, setSelectedLog] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const logInitialized = useRef(false);
  const { surveyDataIsImported } = useSetupWizardData();

  const currentLogs = useMemo(() => _.keys(_.pickBy(selectedLogs, "checked")), [selectedLogs]);
  const availableLogs = useMemo(() => {
    return data
      .filter(l => l.data_count > 0)
      .map(({ label, color, scalelo, scalehi }) => {
        return { label, color, scalelo, scalehi, ...INITIAL_SCALE_BIAS };
      });
  }, [data]);
  const menuItems = useMemo(() => availableLogs.map(({ label }) => label), [availableLogs]);
  const areLogsSelected = useMemo(() => _.some(selectedLogs, "checked"), [selectedLogs]);

  const handleAddChart = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleRemoveChart = useCallback(
    log => {
      setSelectedLog({ ...selectedLogs, [log]: false });
    },
    [selectedLogs]
  );

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  useEffect(() => {
    if (!logInitialized.current && menuItems.length) {
      const log = menuItems.includes("GR") ? "GR" : menuItems[0];
      setSelectedLog({ [log]: { checked: true } });
      logInitialized.current = true;
    }
  }, [menuItems]);

  if (!surveyDataIsImported && !availableLogs.length) {
    return (
      <WidgetCard className={classes.dataChartsContainer} title="Log Data" hideMenu>
        <CloudServerModal
          wellId={wellId}
          importText="Import Survey Data"
          className={classNames(classes.addChartButton, classes.absoluteCenter)}
        />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard className={classes.dataChartsContainer} title="Log Data" hideMenu>
      <SegmentPlot newView={view} xAxis={VS} />
      {currentLogs.map(log => {
        if (!_.isEmpty(dataBySection)) {
          const logId = dataBySection[log].id;
          return (
            <ChartContainer
              key={logId}
              wellId={wellId}
              logId={logId}
              availableLogs={availableLogs}
              dataBySection={dataBySection}
              handleRemoveChart={handleRemoveChart}
              xAxis={VS}
              view={view}
            />
          );
        }
      })}
      <Button
        className={classNames(classes.addChartButton, {
          [classes.addChartButtonInitial]: !areLogsSelected
        })}
        color="secondary"
        onClick={handleAddChart}
      >
        <AddCircle />
        Add Chart
      </Button>
      <LogMenu
        menuItems={menuItems}
        selectedLogs={selectedLogs}
        setSelectedLog={setSelectedLog}
        handleClose={handleCloseMenu}
        anchorEl={anchorEl}
        availableLogs={availableLogs}
      />
    </WidgetCard>
  );
});

LogDataCharts.propTypes = {
  wellId: PropTypes.string
};

export default LogDataCharts;

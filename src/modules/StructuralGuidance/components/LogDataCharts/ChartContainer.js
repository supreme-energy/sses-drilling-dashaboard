import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import _ from "lodash";

import { useSelectedLogDataScaleContainer } from "../../../App/Containers";
import { INITIAL_SCALE_BIAS } from "../../../../constants/structuralGuidance";
import { useAdditionalDataLog } from "../../../../api";
import ChartControls, { BiasControls } from "./ChartControls";
import Chart from "./Chart";
import LogMenu from "./LogMenu";
import SettingsMenu from "./SettingsMenu";
import classes from "./styles.scss";

const ChartContainer = React.memo(({ wellId, logId, xAxis, availableLogs, dataBySection, handleRemoveChart, view }) => {
  const {
    data: { color, data = [], label: initialLogName }
  } = useAdditionalDataLog(wellId, logId);
  const { selectedLogs, setSelectedLog } = useSelectedLogDataScaleContainer();
  const [isEditingScale, setEditingScale] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [{ isSettingsVisible, settingsView }, setSettingsMenu] = useState({
    isSettingsVisible: false,
    settingsView: ""
  });

  const currentLogs = useMemo(() => _.keys(_.pickBy(selectedLogs[logId], "checked")), [selectedLogs, logId]);

  const handleOpenLogMenu = useCallback(event => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsMenu(d => {
      return { ...d, isSettingsVisible: true };
    });
  }, []);

  const handleCloseLogMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleResetScale = useCallback(() => {
    setSelectedLog({ type: "RESET_SCALE", payload: { logId, settingsView } });
  }, [settingsView, setSelectedLog, logId]);

  const handleCloseScale = useCallback(() => {
    handleResetScale();
    setEditingScale(false);
  }, [handleResetScale]);

  const handleSaveScale = useCallback(() => {
    setSelectedLog({ type: "SAVE_SCALE", payload: { logId, settingsView } });
    setEditingScale(false);
  }, [settingsView, setSelectedLog, logId]);

  const handleUpdateScale = useCallback(
    (scale, bias) => {
      setSelectedLog({ type: "UPDATE_SCALE", payload: { logId, settingsView, scale, bias } });
    },
    [settingsView, setSelectedLog, logId]
  );

  const handleArrowBack = useCallback(
    () =>
      setSettingsMenu(d => {
        const currentIndex = currentLogs.findIndex(log => log === d.settingsView);
        if (currentIndex === 0) {
          return { ...d, settingsView: currentLogs[currentLogs.length - 1] };
        } else {
          return { ...d, settingsView: currentLogs[currentIndex - 1] };
        }
      }),
    [currentLogs]
  );

  const handleArrowForward = useCallback(
    () =>
      setSettingsMenu(d => {
        const currentIndex = currentLogs.findIndex(log => log === d.settingsView);
        if (currentIndex === currentLogs.length - 1) {
          return { ...d, settingsView: currentLogs[0] };
        } else {
          return { ...d, settingsView: currentLogs[currentIndex + 1] };
        }
      }),
    [currentLogs]
  );

  const menuItems = useMemo(() => availableLogs.map(({ label }) => label), [availableLogs]);

  useEffect(() => {
    if (initialLogName) setSettingsMenu(d => ({ ...d, settingsView: initialLogName }));
  }, [initialLogName]);

  useEffect(() => {
    if (color) {
      setSelectedLog({
        type: "ADD_LOG",
        payload: {
          logId,
          name: initialLogName,
          [initialLogName]: {
            color,
            checked: true,
            currScale: { ...INITIAL_SCALE_BIAS },
            prevScale: { ...INITIAL_SCALE_BIAS }
          }
        }
      });
    }
  }, [color, initialLogName, setSelectedLog, logId]);

  useEffect(() => {
    if (!currentLogs.includes(settingsView)) {
      setSettingsMenu(d => ({ ...d, settingsView: currentLogs[0] }));
    }
  }, [currentLogs, settingsView]);

  return (
    <div className={classes.logContainer}>
      <Box display="flex">
        <ChartControls
          isEditingScale={isEditingScale}
          currentLogs={currentLogs}
          handleOpenMenu={handleOpenLogMenu}
          handleOpenSettings={handleOpenSettings}
          handleArrowForward={handleArrowForward}
          handleArrowBack={handleArrowBack}
        />
        <Chart
          wellId={wellId}
          data={data}
          logId={logId}
          xAxis={xAxis}
          isEditing={isEditingScale}
          selectedLogs={selectedLogs[logId]}
          currentLogs={currentLogs}
          dataBySection={dataBySection}
          currentLog={settingsView}
          setScale={handleUpdateScale}
          newView={view}
        />
        <BiasControls
          isEditingScale={isEditingScale}
          logInfo={_.get(selectedLogs, `[${logId}][${settingsView}]`)}
          setScale={handleUpdateScale}
          handleReset={handleResetScale}
          handleClose={handleCloseScale}
          handleSave={handleSaveScale}
        />
      </Box>

      <LogMenu
        logId={logId}
        menuItems={menuItems}
        selectedLogs={selectedLogs}
        setSelectedLog={setSelectedLog}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        handleClose={handleCloseLogMenu}
        availableLogs={availableLogs}
      />
      <SettingsMenu
        log={initialLogName}
        isVisible={isSettingsVisible}
        setMenu={setSettingsMenu}
        view={settingsView}
        handleRemoveChart={handleRemoveChart}
        setEditingScale={setEditingScale}
        setSelectedLog={setSelectedLog}
        selectedLogs={selectedLogs}
        currentLogs={currentLogs}
        handleArrowBack={handleArrowBack}
        handleArrowForward={handleArrowForward}
        logId={logId}
      />
    </div>
  );
});

ChartContainer.propTypes = {
  wellId: PropTypes.string,
  logId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  availableLogs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      color: PropTypes.color
    })
  ),
  dataBySection: PropTypes.object,
  handleRemoveChart: PropTypes.func,
  xAxis: PropTypes.string,
  view: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    xScale: PropTypes.number,
    yScale: PropTypes.number
  })
};

export default ChartContainer;

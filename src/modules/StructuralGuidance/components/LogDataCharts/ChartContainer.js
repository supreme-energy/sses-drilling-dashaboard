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
    data: { color, data = [], label: initialLogName, scalelo, scalehi }
  } = useAdditionalDataLog(wellId, logId);
  const { selectedLogs, setSelectedLog } = useSelectedLogDataScaleContainer();
  const [isEditingScale, setEditingScale] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [{ isSettingsVisible, settingsView }, setSettingsMenu] = useState({
    isSettingsVisible: false,
    settingsView: ""
  });

  const currentLogs = useMemo(() => _.keys(_.pickBy(selectedLogs, "checked")), [selectedLogs]);

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
    setSelectedLog(state => {
      return { ...state, [settingsView]: { ...state[settingsView], currScale: state[settingsView].prevScale } };
    });
  }, [settingsView, setSelectedLog]);

  const handleCloseScale = useCallback(() => {
    handleResetScale();
    setEditingScale(false);
  }, [handleResetScale]);

  const handleSaveScale = useCallback(() => {
    setSelectedLog(state => {
      return { ...state, [settingsView]: { ...state[settingsView], prevScale: state[settingsView].currScale } };
    });
    setEditingScale(false);
  }, [settingsView, setSelectedLog]);

  const handleUpdateScale = useCallback(
    (scale, bias, scaleLow, scaleHigh) => {
      setSelectedLog(state => {
        const scalelo = scaleLow !== undefined ? scaleLow : state[settingsView].scalelo;
        const scalehi = scaleHigh || state[settingsView].scalehi;
        return {
          ...state,
          [settingsView]: {
            ...state[settingsView],
            currScale: { scale, bias, scalelo, scalehi }
          }
        };
      });
    },
    [settingsView, setSelectedLog]
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
      setSelectedLog(selectedLogs => {
        return {
          ...selectedLogs,
          [initialLogName]: {
            color,
            checked: true,
            scalelo,
            scalehi,
            currScale: { ...INITIAL_SCALE_BIAS, scalelo, scalehi },
            prevScale: { ...INITIAL_SCALE_BIAS, scalelo, scalehi }
          }
        };
      });
    }
  }, [color, initialLogName, scalelo, scalehi, setSelectedLog]);

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
          xAxis={xAxis}
          isEditing={isEditingScale}
          selectedLogs={selectedLogs}
          currentLogs={currentLogs}
          dataBySection={dataBySection}
          currentLog={settingsView}
          setScale={handleUpdateScale}
          newView={view}
        />
        <BiasControls
          isEditingScale={isEditingScale}
          logInfo={selectedLogs[settingsView]}
          setScale={handleUpdateScale}
          handleReset={handleResetScale}
          handleClose={handleCloseScale}
          handleSave={handleSaveScale}
        />
      </Box>

      <LogMenu
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
      />
    </div>
  );
});

ChartContainer.propTypes = {
  wellId: PropTypes.string,
  logId: PropTypes.number,
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

import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import _ from "lodash";

import { INITIAL_SCALE_BIAS } from "../../../../constants/structuralGuidance";
import { useAdditionalDataLog } from "../../../../api";
import ChartControls from "./ChartControls";
import Chart from "./Chart";
import LogMenu from "./LogMenu";
import SettingsMenu from "./SettingsMenu";
import classes from "./styles.scss";

function ChartContainer({ wellId, logId, xAxis, availableLogs, dataBySection, handleRemoveChart }) {
  const {
    data: { color, data = [], label: initialLogName, scalelo, scalehi }
  } = useAdditionalDataLog(wellId, logId);
  const [selectedLogs, setSelectedLog] = useState({});
  const [isEditingScale, setEditingScale] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [{ isSettingsVisible, settingsView }, setSettingsMenu] = useState({
    isSettingsVisible: false,
    settingsView: ""
  });

  const currentLogs = useMemo(() => _.keys(_.pickBy(selectedLogs, "checked")), [selectedLogs]);

  const handleOpenLogMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenSettings = () => {
    setSettingsMenu(d => {
      return { ...d, isSettingsVisible: true };
    });
  };

  const handleCloseLogMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseScale = () => {
    handleResetScale();
    setEditingScale(false);
  };

  const handleSaveScale = () => {
    setSelectedLog(state => {
      return { ...state, [settingsView]: { ...state[settingsView], prevScale: state[settingsView].currScale } };
    });
    setEditingScale(false);
  };

  const handleResetScale = () => {
    setSelectedLog(state => {
      return { ...state, [settingsView]: { ...state[settingsView], currScale: state[settingsView].prevScale } };
    });
  };
  const handleUpdateScale = (scale, bias) => {
    setSelectedLog(state => {
      return {
        ...state,
        [settingsView]: { ...state[settingsView], currScale: { scale, bias } }
      };
    });
  };

  const handleArrowBack = () =>
    setSettingsMenu(d => {
      const currentIndex = currentLogs.findIndex(log => log === d.settingsView);
      if (currentIndex === 0) {
        return { ...d, settingsView: currentLogs[currentLogs.length - 1] };
      } else {
        return { ...d, settingsView: currentLogs[currentIndex - 1] };
      }
    });

  const handleArrowForward = () =>
    setSettingsMenu(d => {
      const currentIndex = currentLogs.findIndex(log => log === d.settingsView);
      if (currentIndex === currentLogs.length - 1) {
        return { ...d, settingsView: initialLogName };
      } else {
        return { ...d, settingsView: currentLogs[currentIndex + 1] };
      }
    });

  const menuItems = useMemo(() => availableLogs.map(({ label }) => label), [availableLogs]);

  useEffect(() => {
    if (initialLogName) setSettingsMenu(d => ({ ...d, settingsView: initialLogName }));
  }, [initialLogName, isSettingsVisible]);

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
            currScale: { ...INITIAL_SCALE_BIAS },
            prevScale: { ...INITIAL_SCALE_BIAS }
          }
        };
      });
    }
  }, [color, initialLogName, scalelo, scalehi]);

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
          view={settingsView}
          selectedLogs={selectedLogs}
          handleOpenMenu={handleOpenLogMenu}
          handleOpenSettings={handleOpenSettings}
          handleArrowForward={handleArrowForward}
          handleArrowBack={handleArrowBack}
          handleReset={handleResetScale}
          handleClose={handleCloseScale}
          handleSave={handleSaveScale}
        >
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
          />
        </ChartControls>
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
}

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
  xAxis: PropTypes.string
};

export default ChartContainer;

import React, { useCallback, useReducer, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Box,
  FormControl
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import PlayArrow from "@material-ui/icons/PlayArrow";
import PauseCircle from "@material-ui/icons/PauseCircleFilled";
import Cloud from "@material-ui/icons/CloudOutlined";
import CloudOff from "@material-ui/icons/CloudOff";

import { audioReducer } from "./reducers";
import useAudio from "../../../../hooks/useAudio";
import {
  MEDIA_URL,
  ALARM,
  ALARM_ENABLED,
  PULL,
  PULL_INTERVAL,
  INITIAL_AUDIO_STATE
} from "../../../../constants/interpretation";

import classes from "./styles.scss";
import LastSurveyStats from "../LastSurveyStats";

function NotificationSettings({
  wellId,
  appInfo,
  wellInfo,
  updateAlarm,
  updateAutoImport,
  handleClose,
  countdown,
  setAutoImport,
  isAutoImportEnabled,
  handleRefreshCheck,
  setAutoCheckInterval,
  interval,
  refresh,
  hasNewSurvey
}) {
  const [audio, setAudio] = useReducer(audioReducer, INITIAL_AUDIO_STATE);
  const { import_alarm: alarm, import_alarm_enabled: alarmEnabled } = audio;
  const [playing, handleAlarmOn, handleAlarmOff] = useAudio(MEDIA_URL(alarm));

  const onClose = () => {
    handleAlarmOff();
    handleClose();
  };
  const handleIntervalSelect = e => setAutoCheckInterval(e.target.value);
  const handleAlarmToggle = () => {
    return setAudio({ type: "TOGGLE_IMPORT_ALARM" });
  };
  const handleAlarmSelect = e => {
    handleAlarmOff();
    setAudio({ type: "UPDATE", payload: { [ALARM]: e.target.value } });
  };

  const alarmKeys = useMemo(() => Object.keys(audio).filter(key => appInfo[key] !== audio[key]), [appInfo, audio]);

  const onAlarmFieldChange = useCallback((field, value) => updateAlarm({ wellId, field, value }), [
    updateAlarm,
    wellId
  ]);

  const onAutoImportFieldChange = useCallback(
    async (field, value) => {
      await updateAutoImport({ wellId, field, value });
      refresh();
    },
    [updateAutoImport, wellId, refresh]
  );

  const onBlurAlarm = useCallback(
    e => {
      if (alarmKeys.length) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          const key = alarmKeys[0];
          onAlarmFieldChange(key, audio[key]);
        }
      }
    },
    [onAlarmFieldChange, audio, alarmKeys]
  );

  const onBlurAutoImportSwitch = useCallback(
    e => {
      if (wellInfo[PULL] !== e.target.checked && e.target.checked !== null) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onAutoImportFieldChange(PULL, +e.target.checked);
        }
      }
    },
    [wellInfo, onAutoImportFieldChange]
  );

  const onBlurAutoImportInterval = useCallback(
    e => {
      if (wellInfo[PULL_INTERVAL] !== e.target.value) {
        e.returnValue = "Changes you made may not be saved.";
        if (!document.activeElement.id) {
          onAutoImportFieldChange(PULL_INTERVAL, e.target.value);
        }
      }
    },
    [wellInfo, onAutoImportFieldChange]
  );

  const handleToggleAutoImport = () => setAutoImport(!isAutoImportEnabled);

  useEffect(() => {
    if (appInfo) {
      setAudio({
        type: "UPDATE",
        payload: { [ALARM]: appInfo[ALARM], [ALARM_ENABLED]: appInfo[ALARM_ENABLED] }
      });
    }
  }, [appInfo]);

  useEffect(() => {
    window.addEventListener("beforeunload", onBlurAlarm);
    window.addEventListener("beforeunload", onBlurAutoImportSwitch);
    window.addEventListener("beforeunload", onBlurAutoImportInterval);
    return () => {
      window.removeEventListener("beforeunload", onBlurAlarm);
      window.removeEventListener("beforeunload", onBlurAutoImportSwitch);
      window.removeEventListener("beforeunload", onBlurAutoImportInterval);
    };
  });

  return (
    <React.Fragment>
      <DialogTitle className={classes.notificationDialogTitle}>
        <span>Cloud Server Pull/Notification Settings</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.notificationContent}>
        <LastSurveyStats mb={3} />
        <Box display="flex" flexDirection="row">
          <div className={classes.switch}>
            <span className={classes.switchBuffer}>Auto-check for new data</span>
            <Switch
              color="primary"
              checked={!!isAutoImportEnabled}
              onChange={handleToggleAutoImport}
              onBlur={onBlurAutoImportSwitch}
            />
          </div>
          <FormControl>
            <InputLabel htmlFor="interval-select">Check for new data every</InputLabel>
            <Select
              className={classes.intervalDropdown}
              value={interval || ""}
              onChange={handleIntervalSelect}
              inputProps={{
                name: "interval",
                id: "interval-select"
              }}
              onBlur={onBlurAutoImportInterval}
            >
              <MenuItem value={10}>10 Seconds</MenuItem>
              <MenuItem value={30}>30 Seconds</MenuItem>
              <MenuItem value={45}>45 Seconds</MenuItem>
              <MenuItem value={60}>60 Seconds</MenuItem>
              <MenuItem value={120}>2 Minutes</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" flexDirection="row">
          <div className={classes.switch}>
            <span>Play a sound for new data</span>
            <Switch color="primary" checked={!!alarmEnabled} onChange={handleAlarmToggle} onBlur={onBlurAlarm} />
          </div>
          <FormControl>
            <InputLabel htmlFor="alarm-select">Sound To Play</InputLabel>
            <Select
              className={classes.alarmDropdown}
              value={alarm}
              onChange={handleAlarmSelect}
              inputProps={{
                name: "alarm",
                id: "alarm-select"
              }}
              onBlur={onBlurAlarm}
            >
              <MenuItem value={"BOMB_SIREN-BOMB_SIREN.mp3"}>Bomb Siren</MenuItem>
              <MenuItem value={"School_Fire_Alarm.mp3"}>Fire Alarm</MenuItem>
              <MenuItem value={"Loud_Alarm_Clock_Buzzer.mp3"}>Loud Alarm Buzzer</MenuItem>
              <MenuItem value={"Massive_War_With_Alarm.mp3"}>Massive War</MenuItem>
              <MenuItem value={"Plectron_tones.mp3"}>Plectron Tones</MenuItem>
              <MenuItem value={"railroad_crossing_bell.mp3"}>Railroad Crossing</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={playing ? handleAlarmOff : handleAlarmOn}>
            {playing ? <PauseCircle /> : <PlayArrow />}
            Play Sound
          </Button>
        </Box>
      </DialogContent>
      <Box display="flex" justifyContent="space-between">
        <div className={classes.notificationFlag}>
          {isAutoImportEnabled ? <Cloud /> : <CloudOff />}
          <span>
            {isAutoImportEnabled
              ? `Checking for next survey data in ${countdown} seconds`
              : "Automatic checking for new data is off"}
          </span>
        </div>
        <DialogActions className={classes.refreshDataButton}>
          <Button onClick={handleRefreshCheck} color="primary">
            {hasNewSurvey ? "A New Survey is Available" : "Check for New Data Now"}
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
}

NotificationSettings.propTypes = {
  wellId: PropTypes.string,
  setAutoImport: PropTypes.func,
  appInfo: PropTypes.object,
  updateAlarm: PropTypes.func,
  handleClose: PropTypes.func,
  handleRefreshCheck: PropTypes.func,
  updateAutoImport: PropTypes.func,
  countdown: PropTypes.number,
  isAutoImportEnabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  wellInfo: PropTypes.object,
  setAutoCheckInterval: PropTypes.func,
  interval: PropTypes.number,
  refresh: PropTypes.func,
  hasNewSurvey: PropTypes.bool
};

export default NotificationSettings;

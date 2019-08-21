import React, { useCallback, useReducer, useEffect } from "react";
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
import { MEDIA_URL, IMPORT, ALARM, ALARM_ENABLED, INITIAL_AUDIO_STATE } from "../../../../constants/interpretation";

import classes from "./styles.scss";

function NotificationSettings({
  wellId,
  data,
  refresh,
  updateAlarm,
  handleClose,
  hasUpdate,
  setView,
  countdown,
  isServerEnabled,
  setServerState,
  interval,
  setInterval
}) {
  const [audio, setAudio] = useReducer(audioReducer, INITIAL_AUDIO_STATE);
  const { import_alarm: alarm, import_alarm_enabled: alarmEnabled } = audio;
  const [playing, handleAlarmOn, handleAlarmOff] = useAudio(MEDIA_URL(audio.import_alarm));

  const handleIntervalSelect = e => setInterval(e.target.value);
  const handleSetServer = () => setServerState();
  const handleAlarmToggle = () => {
    return setAudio({ type: "TOGGLE_IMPORT_ALARM" });
  };
  const handleAlarmSelect = e => {
    setAudio({ type: "UPDATE", payload: { [ALARM]: e.target.value } });
  };
  const handleSave = useCallback(() => {
    const body = {};

    Object.entries(audio).map(([key, value]) => {
      if (data[key] !== value) {
        body[key] = value;
      }
    });

    updateAlarm({ wellId, body });
    refresh();

    if (hasUpdate) {
      setView(IMPORT);
    } else {
      handleClose();
    }
  }, [handleClose, hasUpdate, setView, audio, data, updateAlarm, refresh, wellId]);

  useEffect(() => {
    if (data) {
      setAudio({
        type: "UPDATE",
        payload: { [ALARM]: data[ALARM], [ALARM_ENABLED]: data[ALARM_ENABLED] }
      });
    }
  }, [data]);

  return (
    <React.Fragment>
      <DialogTitle className={classes.notificationDialogTitle}>
        <span>Cloud Server Pull/Notification Settings</span>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.notificationContent}>
        <Box display="flex" flexDirection="row">
          <div>
            <span>Auto-check for new data</span>
            <Switch color="primary" checked={!!isServerEnabled} onChange={handleSetServer} />
          </div>
          <FormControl>
            <InputLabel htmlFor="interval-select">Check for new data every</InputLabel>
            <Select
              className={classes.intervalDropdown}
              value={interval}
              onChange={handleIntervalSelect}
              inputProps={{
                name: "interval",
                id: "interval-select"
              }}
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
          <div>
            <span>Play a sound for new data</span>
            <Switch color="primary" checked={!!alarmEnabled} onChange={handleAlarmToggle} />
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
          {isServerEnabled ? <Cloud /> : <CloudOff />}
          <span>
            {isServerEnabled
              ? `Checking for next survey data in ${countdown} seconds`
              : "Automatic checking for new data is off"}
          </span>
        </div>
        <DialogActions className={classes.cloudServerDialogActions}>
          <Button onClick={handleSave} color="primary">
            Check for New Data Now
          </Button>
        </DialogActions>
      </Box>
    </React.Fragment>
  );
}

NotificationSettings.propTypes = {
  wellId: PropTypes.string,
  isServerEnabled: PropTypes.bool,
  setServerState: PropTypes.func,
  data: PropTypes.object,
  refresh: PropTypes.func,
  updateAlarm: PropTypes.func,
  handleClose: PropTypes.func,
  hasUpdate: PropTypes.bool,
  setView: PropTypes.func,
  countdown: PropTypes.number,
  interval: PropTypes.number,
  setInterval: PropTypes.func
};

export default NotificationSettings;

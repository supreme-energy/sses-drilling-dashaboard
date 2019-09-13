import React, { useMemo, useEffect, useReducer, useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import PlayArrow from "@material-ui/icons/PlayArrow";
import PauseCircle from "@material-ui/icons/PauseCircleFilled";

import { audioReducer } from "./reducers";
import useAudio from "../../../../../hooks/useAudio";
import { MEDIA_URL, ALARM, ALARM_ENABLED, INITIAL_AUDIO_STATE } from "../../../../../constants/interpretation";

import { useSelectedWellInfoContainer } from "../../../../App/Containers";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";

function Notifications({ wellId }) {
  const [{ appInfo }, , , refreshFetchStore, , updateAppInfo] = useSelectedWellInfoContainer(wellId);

  const [audio, setAudio] = useReducer(audioReducer, INITIAL_AUDIO_STATE);
  const { import_alarm: alarm, import_alarm_enabled: alarmEnabled } = audio;
  const [playing, handleAlarmOn, handleAlarmOff] = useAudio(MEDIA_URL(alarm));

  const handleAlarmToggle = () => {
    return setAudio({ type: "TOGGLE_IMPORT_ALARM" });
  };
  const handleAlarmSelect = e => {
    handleAlarmOff();
    setAudio({ type: "UPDATE", payload: { [ALARM]: e.target.value } });
  };

  const alarmKeys = useMemo(() => Object.keys(audio).filter(key => appInfo[key] !== audio[key]), [appInfo, audio]);

  const onAlarmFieldChange = useCallback(
    async (field, value) => {
      await updateAppInfo({ wellId, field, value });
      refreshFetchStore();
    },
    [updateAppInfo, wellId, refreshFetchStore]
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
    return () => {
      window.removeEventListener("beforeunload", onBlurAlarm);
    };
  }, [onBlurAlarm]);

  return (
    <div className={classes.notificationsContainer}>
      <Title>Notifications</Title>
      <form>
        <div className={classes.formContainer}>
          <div className={classes.switch}>
            <span>Play a sound for new data</span>
            <Switch color="primary" checked={!!alarmEnabled} onChange={handleAlarmToggle} onBlur={onBlurAlarm} />
          </div>
          <Box display="flex" flexDirection="row" marginTop={1}>
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
        </div>
      </form>
    </div>
  );
}

Notifications.propTypes = {
  wellId: PropTypes.string
};

export default Notifications;

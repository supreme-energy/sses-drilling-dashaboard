import React, { useCallback, useReducer, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Cloud from "@material-ui/icons/CloudOutlined";
import CloudOff from "@material-ui/icons/CloudOff";
import usePrevious from "react-use/lib/usePrevious";
// import Import from "@material-ui/icons/OpenInBrowser";

import useInterval from "../../../../hooks/useInterval";
import { useWellInfo, useSurveyCheck } from "../../../../api";
import NotificationSettings from "./NotificationSettings";
import { ManualImportModal, AutoImportModal } from "./ImportModals";

import classes from "./styles.scss";

export const IMPORT = "import";
export const SETTINGS = "settings";
export const REVIEW = "review";

function useCloudServerModal() {
  const [view, setView] = useState(SETTINGS);
  const [isVisible, setVisibility] = useReducer(a => !a, false);
  const [isServerEnabled, setServerState] = useReducer(a => !a, false);
  const [interval, setServerInterval] = useState(10);
  const [countdown, setCountdown] = useState(0);
  const prevInterval = usePrevious(interval);
  const handleOpen = useCallback(() => setVisibility(), []);
  const handleClose = useCallback(() => setVisibility(), []);

  useEffect(() => {
    if (interval !== prevInterval) {
      setCountdown(interval);
    }

    if (!countdown) {
      setCountdown(interval);
    }
  }, [interval, setCountdown, prevInterval, countdown]);

  return {
    view,
    setView,
    isVisible,
    isServerEnabled,
    setServerState,
    handleOpen,
    handleClose,
    interval,
    setServerInterval,
    countdown,
    setCountdown
  };
}

function CloudServerModal({ wellId }) {
  const { cleanup_occured: hasConflict, next_survey: newSurvey, md, azm, inc } = useSurveyCheck(wellId);
  const [{ appInfo = {} }, , , refreshFetchStore, , updateNotificationAlarm] = useWellInfo(wellId);

  const {
    view,
    setView,
    isVisible,
    handleOpen,
    handleClose,
    isServerEnabled,
    setServerState,
    interval,
    setServerInterval,
    countdown,
    setCountdown
  } = useCloudServerModal();
  const viewInitialized = useRef(false);
  const hasUpdate = hasConflict || newSurvey;
  const isManualImport = newSurvey === undefined;

  useEffect(() => {
    if ((hasUpdate || isManualImport) && !isVisible && !viewInitialized.current && isServerEnabled) {
      setView(IMPORT);
      viewInitialized.current = true;
    }
  }, [hasUpdate, isVisible, setView, isManualImport, isServerEnabled]);

  useInterval(() => setCountdown(count => count - 1), countdown ? 1000 : null);

  return (
    <React.Fragment>
      <div className={classes.cloudServerButton}>
        <Button onClick={handleOpen}>
          {isServerEnabled && countdown}
          {!isServerEnabled ? (
            <CloudOff />
          ) : hasUpdate ? (
            <Badge
              className={hasConflict ? classes.badgeRed : classes.badgeGreen}
              variant="dot"
              invisible={!hasUpdate}
              color="secondary"
            >
              <Cloud />
            </Badge>
          ) : (
            <Cloud />
          )}
        </Button>
      </div>

      <Dialog onClose={handleClose} maxWidth="md" open={isVisible} fullWidth>
        {view === IMPORT && !isManualImport && (
          <AutoImportModal
            setView={setView}
            hasConflict={hasConflict}
            handleClose={handleClose}
            md={md}
            inc={inc}
            azm={azm}
          />
        )}
        {view === IMPORT && isManualImport && (
          <ManualImportModal setView={setView} hasConflict={hasConflict} handleClose={handleClose} />
        )}
        {view === SETTINGS && (
          <NotificationSettings
            wellId={wellId}
            data={appInfo}
            refresh={refreshFetchStore}
            updateAlarm={updateNotificationAlarm}
            setView={setView}
            handleClose={handleClose}
            hasUpdate={hasUpdate}
            isServerEnabled={isServerEnabled}
            setServerState={setServerState}
            countdown={countdown}
            interval={interval}
            setInterval={setServerInterval}
          />
        )}
      </Dialog>
    </React.Fragment>
  );
}

CloudServerModal.propTypes = {
  wellId: PropTypes.string
};

export default CloudServerModal;

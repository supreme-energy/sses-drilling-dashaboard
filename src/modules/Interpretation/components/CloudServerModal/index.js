import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Cloud from "@material-ui/icons/CloudOutlined";
import CloudOff from "@material-ui/icons/CloudOff";
import Import from "@material-ui/icons/OpenInBrowser";
import usePrevious from "react-use/lib/usePrevious";

import useCloudServerModal from "./useCloudServerModal";
import useInterval from "../../../../hooks/useInterval";
import { useWellInfo, useCloudServer } from "../../../../api";
import ReviewCleanData from "./ReviewCleanData";
import ReviewManualImport from "./ReviewManualImport";
import NotificationSettings from "./NotificationSettings";
import { ManualImportModal, AutoImportModal } from "./ImportModals";
import {
  IMPORT,
  SETTINGS,
  PULL,
  PULL_INTERVAL,
  REVIEW_CLEAN_DATA,
  REVIEW_MANUAL_IMPORT
} from "../../../../constants/interpretation";

import classes from "./styles.scss";

function CloudServerModal({ wellId }) {
  const {
    data: { next_survey: newSurvey, cmes, md, azm, inc },
    refresh
  } = useCloudServer(wellId);
  const [{ appInfo, wellInfo, online }, , , , , updateAlarm, updateAutoImport] = useWellInfo(wellId);
  const {
    view,
    setView,
    isVisible,
    isAutoImportEnabled,
    autoImportSettings,
    setAutoImport,
    interval,
    countdown,
    setCountdown,
    handleOpen,
    handleClose
  } = useCloudServerModal();

  const [file, setFile] = useState({});
  const [errors, setErrors] = useState([]);
  const hasConflict = !!cmes;
  const hasUpdate = hasConflict || newSurvey;
  const isOnline = !!online;
  const prevInterval = usePrevious(interval);
  const previouslyEnabled = usePrevious(isAutoImportEnabled);

  const handleRefreshCheck = async () => {
    await refresh();
    const hasUpdate = cmes || newSurvey;
    if (hasUpdate) {
      setView(IMPORT);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      if ((hasUpdate && isOnline) || !isOnline) {
        setView(IMPORT);
      } else if (isOnline) {
        setView(SETTINGS);
      }
    }
  }, [hasUpdate, isVisible, setView, isOnline, isAutoImportEnabled]);

  useEffect(() => {
    if (wellInfo && wellInfo[PULL_INTERVAL]) {
      setAutoImport({ type: "UPDATE", payload: { [PULL_INTERVAL]: wellInfo[PULL_INTERVAL] } });
    }
  }, [wellInfo, setAutoImport, isAutoImportEnabled]);

  useEffect(() => {
    if (wellInfo && wellInfo[PULL]) {
      setAutoImport({
        type: "UPDATE",
        payload: {
          [PULL]: wellInfo[PULL]
        }
      });
    }
  }, [wellInfo, setAutoImport, interval]);

  useEffect(() => {
    const importReenabled = isAutoImportEnabled && !previouslyEnabled;
    const intervalChanged = interval !== prevInterval;
    if (intervalChanged || importReenabled || !countdown) {
      setCountdown(interval);
    }

    if (!countdown && interval) {
      refresh();
    }
  }, [interval, prevInterval, countdown, setCountdown, previouslyEnabled, isAutoImportEnabled, refresh]);

  useInterval(() => setCountdown(count => count - 1), countdown && isAutoImportEnabled && isOnline ? 1000 : null);

  return (
    <React.Fragment>
      <div className={classes.cloudServerButton}>
        <Button onClick={handleOpen}>
          {isAutoImportEnabled && <span>{countdown}</span>}
          {isAutoImportEnabled ? (
            <Badge
              className={hasConflict ? classes.badgeRed : classes.badgeGreen}
              variant="dot"
              invisible={!hasUpdate}
              color="secondary"
            >
              <Cloud />
            </Badge>
          ) : isOnline ? (
            <CloudOff />
          ) : (
            <Import />
          )}
        </Button>
      </div>

      <Dialog onClose={handleClose} maxWidth="md" open={isVisible} fullWidth>
        {view === IMPORT && isOnline && (
          <AutoImportModal
            wellId={wellId}
            setView={setView}
            hasConflict={hasConflict}
            handleClose={handleClose}
            md={md}
            inc={inc}
            azm={azm}
            newSurvey={newSurvey}
          />
        )}
        {view === IMPORT && !isOnline && (
          <ManualImportModal
            wellId={wellId}
            file={file}
            setFile={setFile}
            setView={setView}
            hasConflict={hasConflict}
            handleClose={handleClose}
            setErrors={setErrors}
          />
        )}
        {view === SETTINGS && (
          <NotificationSettings
            wellId={wellId}
            appInfo={appInfo}
            wellInfo={wellInfo}
            updateAlarm={updateAlarm}
            updateAutoImport={updateAutoImport}
            handleClose={handleClose}
            setAutoImport={setAutoImport}
            countdown={countdown}
            autoImportSettings={autoImportSettings}
            handleRefreshCheck={handleRefreshCheck}
          />
        )}
        {view === REVIEW_CLEAN_DATA && <ReviewCleanData wellId={wellId} setView={setView} handleClose={handleClose} />}
        {view === REVIEW_MANUAL_IMPORT && (
          <ReviewManualImport
            wellId={wellId}
            fileName={file.name}
            setFile={setFile}
            setView={setView}
            setErrors={setErrors}
            handleClose={handleClose}
            errors={errors}
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

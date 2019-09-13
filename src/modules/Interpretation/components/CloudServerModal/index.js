import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Cloud from "@material-ui/icons/CloudOutlined";
import CloudOff from "@material-ui/icons/CloudOff";
import Import from "@material-ui/icons/OpenInBrowser";

import { useCloudServerCountdownContainer, useSelectedWellInfoContainer } from "../../../App/Containers";
import useCloudServerModal from "./useCloudServerModal";
import { useCloudServer } from "../../../../api";
import ReviewCleanData from "./ReviewCleanData";
import ReviewManualImport from "./ReviewManualImport";
import NotificationSettings from "./NotificationSettings";
import { ManualImportModal, AutoImportModal } from "./ImportModals";
import { IMPORT, SETTINGS, PULL, REVIEW_CLEAN_DATA, REVIEW_MANUAL_IMPORT } from "../../../../constants/interpretation";
import classes from "./styles.scss";

function CloudServerModal({ wellId }) {
  const {
    data: { next_survey: newSurvey, cmes, md, azm, inc },
    refresh
  } = useCloudServer(wellId);
  const [
    { appInfo, wellInfo, online },
    ,
    ,
    refreshFetchStore,
    ,
    updateAlarm,
    updateAutoImport
  ] = useSelectedWellInfoContainer(wellId);
  const {
    view,
    setView,
    isVisible,
    isAutoImportEnabled,
    setAutoImport,
    handleOpen,
    handleClose
  } = useCloudServerModal();

  const { countdown, interval, setAutoCheckInterval } = useCloudServerCountdownContainer();

  const [file, setFile] = useState({});
  const [errors, setErrors] = useState([]);
  const hasConflict = !!cmes;
  const isOnline = !!online;

  const handleRefreshCheck = async () => {
    const { next_survey: newSurvey } = await refresh();

    if (newSurvey) {
      setView(IMPORT);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      if ((newSurvey && isOnline) || !isOnline) {
        setView(IMPORT);
      } else if (isOnline) {
        setView(SETTINGS);
      }
    }
  }, [newSurvey, isVisible, setView, isOnline, isAutoImportEnabled]);

  useEffect(() => {
    if (wellInfo && wellInfo[PULL]) {
      setAutoImport(wellInfo[PULL]);
    }
  }, [wellInfo, setAutoImport]);

  return (
    <React.Fragment>
      <div className={classes.cloudServerButton}>
        <Button onClick={handleOpen}>
          {isAutoImportEnabled && !newSurvey && <span>{countdown}</span>}
          {isAutoImportEnabled ? (
            <Badge
              className={hasConflict ? classes.badgeRed : classes.badgeGreen}
              variant="dot"
              invisible={!newSurvey || !isOnline}
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
            refresh={refresh}
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
            isAutoImportEnabled={isAutoImportEnabled}
            setAutoCheckInterval={setAutoCheckInterval}
            handleRefreshCheck={handleRefreshCheck}
            interval={interval}
            refresh={refreshFetchStore}
            hasNewSurvey={newSurvey}
          />
        )}
        {view === REVIEW_CLEAN_DATA && <ReviewCleanData wellId={wellId} setView={setView} newSurvey={newSurvey} />}
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

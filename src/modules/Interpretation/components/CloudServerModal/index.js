import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Cloud from "@material-ui/icons/CloudOutlined";
import CloudOff from "@material-ui/icons/CloudOff";
import Import from "@material-ui/icons/OpenInBrowser";
import classNames from "classnames";

import { useCloudServerCountdownContainer, useSelectedWellInfoContainer } from "../../../App/Containers";
import useCloudServerModal from "./useCloudServerModal";
import { useCloudServer } from "../../../../api";
import ReviewCleanData from "./ReviewCleanData";
import ReviewManualImport from "./ReviewManualImport";
import NotificationSettings from "./NotificationSettings";
import { ManualImportModal, AutoImportModal } from "./ImportModals";
import { AUTO, IMPORT, INITIALIZE, SETTINGS, REVIEW, PULL } from "../../../../constants/interpretation";
import classes from "./styles.scss";

function CloudServerModal({ wellId, className, importText = "", importIcon = false, isInterpretation = false }) {
  const {
    data: { next_survey: newSurvey, cmes, md, azm, inc },
    refresh
  } = useCloudServer(wellId);
  const [
    { appInfo, wellInfo, isCloudServerEnabled },
    ,
    ,
    refreshFetchStore,
    ,
    updateAppInfo,
    updateAutoImport
  ] = useSelectedWellInfoContainer(wellId);
  const {
    setView,
    view,
    isAutoImportVisible,
    isManualImportVisible,
    isAutoImportEnabled,
    setAutoImport,
    handleOpenAutoImport,
    handleOpenManualImport,
    handleCloseManualImport,
    handleCloseAutoImport
  } = useCloudServerModal();

  const { countdown, interval, setAutoCheckInterval } = useCloudServerCountdownContainer();

  const [file, setFile] = useState({});
  const [errors, setErrors] = useState([]);
  const hasConflict = !!cmes;

  const handleRefreshCheck = async () => {
    const { next_survey: newSurvey } = await refresh();
    setView({ type: INITIALIZE, payload: { type: AUTO, newSurvey } });
  };

  useEffect(() => {
    if (!isAutoImportVisible && isCloudServerEnabled) {
      setView({ type: INITIALIZE, payload: { type: AUTO, newSurvey } });
    }
  }, [newSurvey, isAutoImportVisible, setView, isCloudServerEnabled]);

  useEffect(() => {
    if (wellInfo && wellInfo[PULL]) {
      setAutoImport(wellInfo[PULL]);
    }
  }, [wellInfo, setAutoImport]);

  return (
    <React.Fragment>
      <div className={classNames(classes.cloudServerButton, className)}>
        {isCloudServerEnabled && isInterpretation && (
          <Button onClick={handleOpenAutoImport}>
            {isAutoImportEnabled && !newSurvey && <span>{countdown}</span>}
            {isAutoImportEnabled ? (
              <Badge
                className={hasConflict ? classes.badgeRed : classes.badgeGreen}
                variant="dot"
                invisible={!newSurvey || !isCloudServerEnabled}
                color="secondary"
              >
                <Cloud />
              </Badge>
            ) : (
              <CloudOff />
            )}
          </Button>
        )}
        <Button onClick={handleOpenManualImport}>
          {importIcon || <Import />}
          {importText}
        </Button>
      </div>

      <Dialog onClose={handleCloseAutoImport} maxWidth="md" open={isAutoImportVisible} fullWidth>
        {view.auto === IMPORT && isCloudServerEnabled && (
          <AutoImportModal
            wellId={wellId}
            setView={setView}
            hasConflict={hasConflict}
            handleClose={handleCloseAutoImport}
            refreshCloudServer={refresh}
            md={md}
            inc={inc}
            azm={azm}
            newSurvey={newSurvey}
          />
        )}
        {view.auto === SETTINGS && (
          <NotificationSettings
            wellId={wellId}
            appInfo={appInfo}
            wellInfo={wellInfo}
            updateAlarm={updateAppInfo}
            updateAutoImport={updateAutoImport}
            handleClose={handleCloseAutoImport}
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
        {view.auto === REVIEW && <ReviewCleanData wellId={wellId} setView={setView} newSurvey={newSurvey} />}
      </Dialog>

      <Dialog onClose={handleCloseManualImport} maxWidth="md" open={isManualImportVisible} fullWidth>
        {view.manual === IMPORT && (
          <ManualImportModal
            wellId={wellId}
            file={file}
            setFile={setFile}
            setView={setView}
            hasConflict={hasConflict}
            handleClose={handleCloseManualImport}
            setErrors={setErrors}
          />
        )}
        {view.manual === REVIEW && (
          <ReviewManualImport
            wellId={wellId}
            fileName={file.name}
            setFile={setFile}
            setView={setView}
            setErrors={setErrors}
            handleClose={handleCloseManualImport}
            errors={errors}
          />
        )}
      </Dialog>
    </React.Fragment>
  );
}

CloudServerModal.propTypes = {
  wellId: PropTypes.string,
  className: PropTypes.string,
  importText: PropTypes.string,
  importIcon: PropTypes.oneOf([PropTypes.elementType, PropTypes.bool]),
  isInterpretation: PropTypes.bool
};

export default CloudServerModal;

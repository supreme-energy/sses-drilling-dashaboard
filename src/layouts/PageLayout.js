import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { MuiThemeProvider } from "@material-ui/core";
import { theme } from "../styles/theme";
import classes from "./PageLayout.scss";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useSize } from "react-hook-size";
import {
  WellIdProvider,
  useWellIdContainer,
  ProjectionsProvider,
  FormationsProvider,
  SurveysProvider,
  SelectedWellInfoProvider
} from "../modules/App/Containers";
import useAudio from "../hooks/useAudio";
import { useWellInfo, useCloudServer } from "../api";
import { PULL } from "../constants/interpretation";

import { WellLogsProvider } from "../modules/ComboDashboard/containers/wellLogs";
import { ComboContainerProvider } from "../modules/ComboDashboard/containers/store";

const PageTabs = ({
  match: {
    params: { wellId, page }
  },
  history
}) => {
  const { setWellId } = useWellIdContainer();
  setWellId(wellId);
  const actualPage = page || "explorer";
  const wellIdPath = wellId || "";
  const onTabChange = (e, value) => {
    const actualValue = value === "explorer" ? "" : value;
    history.push(`/${wellIdPath}/${actualValue}`);
  };
  const tabsRef = useRef(null);
  // trigger re-render when size changed
  useSize(tabsRef);

  const {
    data: { next_survey: newSurvey, cmes }
  } = useCloudServer(wellId);
  const [{ appInfo = {}, wellInfo = {}, online }] = useWellInfo(wellId);
  const isOnline = !!online;
  const [playing, handleAlarmOn, handleAlarmOff] = useAudio(`/${appInfo.import_alarm}`);
  const { import_alarm: alarm, import_alarm_enabled: alarmEnabled } = appInfo;
  const hasConflict = !!cmes;
  const hasUpdate = hasConflict || newSurvey;
  const isAutoImportEnabled = wellInfo[PULL];
  const hasPlayed = useRef(false);

  useEffect(() => {
    let stopped;
    function turnOff() {
      if (!stopped) {
        stopped = true;
        handleAlarmOff();
      }
    }

    if (alarm && alarmEnabled && hasUpdate && !hasPlayed.current && isAutoImportEnabled && isOnline) {
      handleAlarmOn();
      hasPlayed.current = true;
      setTimeout(turnOff, 5000);
      return turnOff;
    }
  }, [handleAlarmOn, handleAlarmOff, playing, alarm, alarmEnabled, hasUpdate, isAutoImportEnabled, isOnline]);

  return (
    <div ref={tabsRef}>
      <iframe src="/silence.mp3" allow="autoplay" id="audio" className={classes.alarmNotification} />

      <Tabs value={actualPage} indicatorColor="primary" className={classes.tabs} onChange={onTabChange}>
        <Tab value="explorer" label="Well Explorer" />
        {wellId ? <Tab value={"combo"} label="Combo Dashboard" onChange={onTabChange} /> : null}
        {wellId ? <Tab value={"drilling"} label="Drilling Analytics" onChange={onTabChange} /> : null}
        {wellId ? <Tab value={"structural"} label="Structural Guidance" onChange={onTabChange} /> : null}
        {wellId ? <Tab value={"directional"} label="Directional Guidance" onChange={onTabChange} /> : null}
      </Tabs>
    </div>
  );
};

export const PageLayout = ({ children, history }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <WellIdProvider initialState={""}>
        <WellLogsProvider>
          <SelectedWellInfoProvider>
            <ComboContainerProvider>
              <SurveysProvider>
                <ProjectionsProvider>
                  <FormationsProvider>
                    <div className={classes.container}>
                      <AppBar className={classes.appBar} color="inherit">
                        <div className={classes.header}>
                          <div className={classes.logo}>
                            <img src="/sses-logo.svg" />
                          </div>
                          <Route path="/:wellId?/:page?" component={PageTabs} history={history} />
                          <span />
                        </div>
                      </AppBar>

                      <div className={classes.viewport}>{children}</div>
                    </div>
                  </FormationsProvider>
                </ProjectionsProvider>
              </SurveysProvider>
            </ComboContainerProvider>
          </SelectedWellInfoProvider>
        </WellLogsProvider>
      </WellIdProvider>
    </MuiThemeProvider>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node,
  history: PropTypes.object
};

export default PageLayout;

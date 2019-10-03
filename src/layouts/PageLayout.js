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
  CloudServerCountdownProvider,
  useCloudServerCountdownContainer,
  SelectedWellInfoProvider,
  WellPlanProvider,
  ControlLogProvider
} from "../modules/App/Containers";
import useAudio from "../hooks/useAudio";
import useInterval from "../hooks/useInterval";
import { useWellInfo, useCloudServer } from "../api";
import { PULL, PULL_INTERVAL, ALARM, ALARM_ENABLED, MEDIA_URL } from "../constants/interpretation";
import usePrevious from "react-use/lib/usePrevious";
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
    data: { next_survey: newSurvey }
  } = useCloudServer(wellId);
  const { countdown, setAutoCheckInterval, handleCountdown, resetCountdown } = useCloudServerCountdownContainer();
  const [{ appInfo = {}, wellInfo = {}, isCloudServerEnabled }] = useWellInfo(wellId);
  const [, handleAlarmOn, handleAlarmOff, setAudio] = useAudio("");
  const { [ALARM]: alarm, [ALARM_ENABLED]: alarmEnabled } = appInfo;
  const isAutoImportEnabled = !!wellInfo[PULL];
  const previouslyEnabled = usePrevious(isAutoImportEnabled);
  const hadNewSurvey = usePrevious(newSurvey);
  const importReenabled = isAutoImportEnabled && !previouslyEnabled;

  useEffect(() => {
    if (alarm) {
      setAudio(new Audio(MEDIA_URL(alarm)));
    }
  }, [setAudio, alarm]);

  useEffect(() => {
    if (wellInfo && wellInfo[PULL_INTERVAL]) {
      setAutoCheckInterval(wellInfo[PULL_INTERVAL]);
    }
  }, [wellInfo, setAutoCheckInterval]);

  useEffect(() => {
    let stopped;
    function turnOff() {
      if (!stopped) {
        stopped = true;
        handleAlarmOff();
      }
    }

    if (alarm && alarmEnabled && newSurvey && isAutoImportEnabled && isCloudServerEnabled) {
      handleAlarmOn();
      setTimeout(turnOff, 5000);
    }
  }, [handleAlarmOn, handleAlarmOff, alarm, alarmEnabled, newSurvey, isAutoImportEnabled, isCloudServerEnabled]);

  useEffect(() => {
    if ((hadNewSurvey && !newSurvey) || importReenabled) {
      resetCountdown();
    }
  }, [hadNewSurvey, newSurvey, resetCountdown, importReenabled, wellInfo]);

  useInterval(() => handleCountdown(), countdown && isAutoImportEnabled && isCloudServerEnabled ? 1000 : null);

  return (
    <div ref={tabsRef}>
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
              <ControlLogProvider>
                <WellPlanProvider>
                  <SurveysProvider>
                    <ProjectionsProvider>
                      <FormationsProvider>
                        <CloudServerCountdownProvider initialState={60}>
                          <div className={classes.container}>
                            <AppBar className={classes.appBar} color="inherit">
                              <div className={classes.header}>
                                <div className={classes.logo}>
                                  <img src="/sses-logo.svg" />
                                </div>
                                <Route path="/:wellId?/:page?/:subpage?" component={PageTabs} history={history} />
                                <span />
                              </div>
                            </AppBar>

                            <div className={classes.viewport}>{children}</div>
                          </div>
                        </CloudServerCountdownProvider>
                      </FormationsProvider>
                    </ProjectionsProvider>
                  </SurveysProvider>
                </WellPlanProvider>
              </ControlLogProvider>
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

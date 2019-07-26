import React, { useRef } from "react";
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
  useTimeSliderContainer
} from "../modules/App/Containers";
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

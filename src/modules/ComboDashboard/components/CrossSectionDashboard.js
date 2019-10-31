import { Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import React, { useMemo, useReducer, useState } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Import from "@material-ui/icons/OpenInBrowser";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./ComboDashboard.scss";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";
import DetailsFullModal, { WELL_PLAN } from "./Details/DetailsFullModal";
import CrossSection from "./CrossSection";
import { HORIZONTAL, VERTICAL } from "../../../constants/crossSectionViewDirection";
import { useCrossSectionContainer, useSurveysDataContainer, useFormationsDataContainer } from "../../App/Containers";
import SelectedProjectionMethod from "./Details/SelectedProjectionMethod";
import Button from "@material-ui/core/Button";
import { useSetupWizardData } from "../../Interpretation/selectors";
import WellInfoField from "./Details/WellInfoField";
import { limitAzm } from "./CrossSection/formulas";
import { CSTableButton } from "../../../components/TableButton";
import { withRouter, Route } from "react-router";
import AddButton from "./CrossSection/AddButton";
import { NORMAL, ADD_PA_STATION } from "../../../constants/crossSectionModes";

export const CrossSectionDashboard = React.memo(
  ({ wellId, className, view, updateView, isReadOnly, hideCard, match, history, viewName }) => {
    const [expanded, toggleExpanded] = useReducer(e => !e, true);

    const { wellPlanIsImported } = useSetupWizardData();
    const [viewDirection, setViewDirection] = useState(0);

    const { updateTieInTCL } = useSurveysDataContainer();
    const { selectedSections, calcSections } = useCrossSectionContainer();
    const selectedSegment = useMemo(() => {
      return calcSections.find(s => selectedSections[s.id]) || {};
    }, [calcSections, selectedSections]);
    const [showImportWellPlanModal, toggleImportWellPlanModal] = useReducer(m => !m, false);
    const [activeTab, changeActiveTab] = useState(WELL_PLAN);
    const [mode, setMode] = useState(NORMAL);
    const { allStepsAreCompleted } = useSetupWizardData();
    const { refreshFormations } = useFormationsDataContainer();

    const tabs = useMemo(
      () => (
        <Tabs
          className={classNames(classes.tabs, { [classes.hiddenCardTabs]: hideCard })}
          value={viewDirection}
          onChange={(e, v) => setViewDirection(v)}
          indicatorColor="primary"
          textColor="primary"
          aria-label="Cross Section view direction"
        >
          <Tab label="Vertical" value={VERTICAL} className={classes.tab} />
          <Tab label="Horizontal" value={HORIZONTAL} className={classes.tab} />
        </Tabs>
      ),
      [hideCard, viewDirection]
    );

    return (
      <WidgetCard
        className={classNames(classes.crossSectionDash, className, "layout vertical")}
        title="Cross Section"
        hideCard={hideCard}
        hideMenu
      >
        {tabs}
        {allStepsAreCompleted && !isReadOnly && (
          <AddButton className={classes.addProjectionButton} onClick={() => setMode(ADD_PA_STATION)} />
        )}

        <div className={classNames(classes.responsiveWrapper, classes.column)}>
          <div className={classNames(classes.column, classes.grow)}>
            <ParentSize debounceTime={100} className={classes.responsiveWrapper}>
              {({ width, height }) => (
                <CrossSection
                  width={width}
                  height={height}
                  mode={mode}
                  setMode={setMode}
                  wellId={wellId}
                  viewDirection={viewDirection}
                  view={view}
                  updateView={updateView}
                  viewName={viewName}
                  isReadOnly={isReadOnly}
                />
              )}
            </ParentSize>
            {!wellPlanIsImported && !isReadOnly && (
              <div className={classes.importWellPlanButton}>
                <Button
                  onClick={() => {
                    changeActiveTab(WELL_PLAN);
                    toggleImportWellPlanModal();
                    history.push(`${match.url}/detailsTable`);
                  }}
                >
                  <Import />
                  Import Well Plan
                </Button>
              </div>
            )}
          </div>
          <div className={classes.cardLine} />
          {!isReadOnly && (
            <div className={classNames(classes.column, classes.shrink)}>
              <div className={classNames(classes.row, classes.detailsHeader)}>
                <IconButton
                  size="small"
                  className={classNames(classes.expand, {
                    [classes.expandOpen]: expanded
                  })}
                  onClick={toggleExpanded}
                  aria-expanded={expanded}
                  aria-label="Show details"
                >
                  <ExpandMoreIcon />
                </IconButton>
                <Typography variant="subtitle1">Details</Typography>
                <div className={classes.flexRight}>
                  {expanded && selectedSegment.isProjection && (
                    <React.Fragment>
                      <SelectedProjectionMethod selectedProjection={selectedSegment} />
                      <WellInfoField label={"Auto Pos-TCL"} field="autoposdec" inputProps={{ min: "0" }} />
                    </React.Fragment>
                  )}
                  {expanded && !selectedSegment.isProjection && (
                    <React.Fragment>
                      <WellInfoField label={"Proposed Direction"} field="propazm" options={{ mask: limitAzm }} />
                      <WellInfoField label={"Projected Dip"} field="projdip" />
                      <WellInfoField
                        label={"TCL"}
                        onAfterUpdate={refreshFormations}
                        field="tot"
                        inputProps={{ min: "0" }}
                        options={{
                          debounceAction: updateTieInTCL
                        }}
                      />
                    </React.Fragment>
                  )}
                  <CSTableButton />
                </div>
              </div>
              <Collapse in={expanded} unmountOnExit>
                <div className={classes.tableWrapper}>
                  <DetailsTable />
                </div>
              </Collapse>
              <Route
                path="/:wellId/:page/detailsTable"
                render={match => {
                  return (
                    <DetailsFullModal
                      handleClose={() => history.goBack()}
                      isVisible
                      activeTab={activeTab}
                      showImportWellPlanModal={showImportWellPlanModal}
                      toggleImportWellPlanModal={toggleImportWellPlanModal}
                      changeActiveTab={changeActiveTab}
                    />
                  );
                }}
              />
            </div>
          )}
        </div>
      </WidgetCard>
    );
  }
);

export default withRouter(CrossSectionDashboard);

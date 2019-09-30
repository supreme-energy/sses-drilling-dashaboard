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
import DetailsFullModal from "./Details/DetailsFullModal";
import CrossSection from "./CrossSection/index";
import { HORIZONTAL, VERTICAL } from "../../../constants/crossSectionViewDirection";
import { useCrossSectionContainer, useSurveysDataContainer } from "../../App/Containers";
import SelectedProjectionMethod from "./Details/SelectedProjectionMethod";
import Button from "@material-ui/core/Button";
import { useSetupWizardData } from "../../Interpretation/selectors";
import WellPlanImporterModal from "../../../modals/WellPlanImporterModal";
import WellInfoField from "./Details/WellInfoField";
import { limitAzm } from "./CrossSection/formulas";
import TableButton from "../../../components/TableButton";

export const CrossSectionDashboard = React.memo(({ wellId, className, view, updateView }) => {
  const [expanded, toggleExpanded] = useReducer(e => !e, true);
  const [showModal, toggleModal] = useReducer(m => !m, false);
  const [showImportWellPlanModal, toggleImportWellPlanModal] = useReducer(m => !m, false);
  const { wellPlanIsImported } = useSetupWizardData();
  const [viewDirection, setViewDirection] = useState(0);

  const { updateTieInTCL } = useSurveysDataContainer();
  const { selectedSections, calcSections } = useCrossSectionContainer();
  const selectedSegment = useMemo(() => {
    return calcSections.find(s => selectedSections[s.id]) || {};
  }, [calcSections, selectedSections]);

  return (
    <WidgetCard className={classNames(classes.crossSectionDash, className)} title="Cross Section" hideMenu>
      <Tabs
        className={classes.tabs}
        value={viewDirection}
        onChange={(e, v) => setViewDirection(v)}
        indicatorColor="primary"
        textColor="primary"
        aria-label="Cross Section view direction"
      >
        <Tab label="Vertical" value={VERTICAL} className={classes.tab} />
        <Tab label="Horizontal" value={HORIZONTAL} className={classes.tab} />
      </Tabs>
      <div className={classNames(classes.responsiveWrapper, classes.column)}>
        <div className={classNames(classes.column, classes.grow)}>
          <ParentSize debounceTime={100} className={classes.responsiveWrapper}>
            {({ width, height }) => (
              <CrossSection
                width={width}
                height={height}
                viewDirection={viewDirection}
                view={view}
                updateView={updateView}
              />
            )}
          </ParentSize>
          {!wellPlanIsImported && (
            <div className={classes.importWellPlanButton}>
              <Button onClick={toggleImportWellPlanModal}>
                <Import />
                Import Well Plan
              </Button>
            </div>
          )}
        </div>
        <div className={classes.cardLine} />
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
                  <WellInfoField label={"Auto Pos-TCL"} field="autoposdec" type="number" inputProps={{ min: "0" }} />
                </React.Fragment>
              )}
              {expanded && !selectedSegment.isProjection && (
                <React.Fragment>
                  <WellInfoField
                    label={"Proposed Direction"}
                    field="propazm"
                    type="number"
                    options={{ mask: limitAzm }}
                  />
                  <WellInfoField label={"Projected Dip"} field="projdip" type="number" />
                  <WellInfoField
                    label={"TCL"}
                    field="tot"
                    type="number"
                    inputProps={{ min: "0" }}
                    options={{
                      debounceAction: updateTieInTCL
                    }}
                  />
                </React.Fragment>
              )}
              <TableButton onClick={toggleModal} />
            </div>
          </div>
          <Collapse in={expanded} unmountOnExit>
            <div className={classes.tableWrapper}>
              <DetailsTable />
            </div>
          </Collapse>
          <DetailsFullModal handleClose={toggleModal} isVisible={showModal} />
          <WellPlanImporterModal handleClose={toggleImportWellPlanModal} isVisible={showImportWellPlanModal} />
        </div>
      </div>
    </WidgetCard>
  );
});

export default CrossSectionDashboard;

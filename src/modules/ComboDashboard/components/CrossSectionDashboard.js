import { Typography } from "@material-ui/core";
import { ParentSize } from "@vx/responsive";
import React, { useCallback, useMemo, useReducer, useState } from "react";
import classNames from "classnames";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TableChartIcon from "../../../assets/tableChart.svg";

import WidgetCard from "../../../components/WidgetCard";
import classes from "./ComboDashboard.scss";
import Collapse from "@material-ui/core/Collapse";
import DetailsTable from "./Details";
import DetailsFullModal from "./Details/DetailsFullModal";
import CrossSection from "./CrossSection/index";
import { HORIZONTAL, VERTICAL } from "../../../constants/crossSectionViewDirection";
import { useSelectedWellInfoContainer, useCrossSectionContainer } from "../../App/Containers";
import { DebouncedTextField } from "../../../components/DebouncedInputs";
import SelectedProjectionMethod from "./Details/SelectedProjectionMethod";

export const CrossSectionDashboard = React.memo(({ wellId, className, view, updateView }) => {
  const [expanded, toggleExpanded] = useReducer(e => !e, false);
  const [showModal, toggleModal] = useReducer(m => !m, false);
  const [viewDirection, setViewDirection] = useState(0);
  const [data, , updateWell, refreshFetchStore] = useSelectedWellInfoContainer();
  const wellInfo = (data && data.wellInfo) || {};

  const { selectedSections, calcSections } = useCrossSectionContainer();
  const selectedSegment = useMemo(() => {
    return calcSections.find(s => selectedSections[s.id]) || {};
  }, [calcSections, selectedSections]);

  const updateAutoPosTCL = useCallback(
    async value => {
      await updateWell({ wellId, field: "autoposdec", value });
      refreshFetchStore();
    },
    [updateWell, wellId, refreshFetchStore]
  );

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
                <SelectedProjectionMethod selectedProjection={selectedSegment} />
              )}
              {expanded && (
                <React.Fragment>
                  <Typography variant="subtitle2">Auto Pos-TCL: </Typography>
                  <DebouncedTextField
                    debounceInterval={100}
                    type="number"
                    variant="filled"
                    inputProps={{ min: "0" }}
                    value={wellInfo.autoposdec}
                    onChange={updateAutoPosTCL}
                    className={classes.textField}
                  />
                </React.Fragment>
              )}
              <IconButton
                size="small"
                className={classNames(classes.expand, classes.fullTableButton)}
                onClick={toggleModal}
                aria-label="Show full details table"
              >
                <img src={TableChartIcon} className={classes.icon} />
              </IconButton>
            </div>
          </div>
          <Collapse in={expanded} unmountOnExit>
            <div className={classes.tableWrapper}>
              <DetailsTable />
            </div>
          </Collapse>
          <DetailsFullModal handleClose={toggleModal} isVisible={showModal} />
        </div>
      </div>
    </WidgetCard>
  );
});

export default CrossSectionDashboard;

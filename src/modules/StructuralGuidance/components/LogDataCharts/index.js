import React, { useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import AddCircle from "@material-ui/icons/AddCircle";
import Import from "@material-ui/icons/OpenInBrowser";
import _ from "lodash";
import classNames from "classnames";

import { MD } from "../../../../constants/structuralGuidance";
import LogMenu from "./LogMenu";
import { useAdditionalDataLogsList } from "../../../../api";
import WidgetCard from "../../../../components/WidgetCard";
import Chart from "./Chart";
import classes from "./styles.scss";

function LogData({ wellId }) {
  const { data = [], dataBySection = {} } = useAdditionalDataLogsList(wellId);
  const [selectedGraphs, setSelectedGraph] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const graphInitialized = useRef(false);

  const currentGraphs = useMemo(() => _.keys(_.pickBy(selectedGraphs, "checked")), [selectedGraphs]);
  const availableGraphs = useMemo(() => {
    return data
      .filter(l => l.data_count > 0)
      .map(({ label, color }) => {
        return { label, color };
      });
  }, [data]);
  const menuItems = useMemo(() => availableGraphs.map(({ label }) => label), [availableGraphs]);
  const areGraphsSelected = useMemo(() => _.some(selectedGraphs, "checked"), [selectedGraphs]);

  const handleAddChart = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleRemoveGraph = graph => {
    setSelectedGraph({ ...selectedGraphs, [graph]: false });
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleImport = () => {};

  useEffect(() => {
    if (!graphInitialized.current && menuItems.length) {
      setSelectedGraph({ [menuItems[0]]: { checked: true } });
      graphInitialized.current = true;
    }
  }, [menuItems]);

  if (!availableGraphs.length) {
    return (
      <WidgetCard className={classes.dataChartsContainer} title="Log Data" hideMenu>
        <Button
          className={classNames(classes.addChartButton, classes.addChartButtonInitial)}
          color="secondary"
          onClick={handleImport}
        >
          <Import />
          Import Survey Data
        </Button>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard className={classes.dataChartsContainer} title="Log Data" hideMenu>
      {currentGraphs.map(graph => {
        if (!_.isEmpty(dataBySection)) {
          const logId = dataBySection[graph].id;
          return (
            <Chart
              key={logId}
              wellId={wellId}
              logId={logId}
              availableGraphs={availableGraphs}
              dataBySection={dataBySection}
              handleRemoveGraph={handleRemoveGraph}
              xAxis={MD}
            />
          );
        }
      })}
      <Button
        className={classNames(classes.addChartButton, {
          [classes.addChartButtonInitial]: !areGraphsSelected
        })}
        color="secondary"
        onClick={handleAddChart}
      >
        <AddCircle />
        Add Chart
      </Button>
      <LogMenu
        menuItems={menuItems}
        selectedGraphs={selectedGraphs}
        setSelectedGraph={setSelectedGraph}
        handleClose={handleCloseMenu}
        anchorEl={anchorEl}
        availableGraphs={availableGraphs}
      />
    </WidgetCard>
  );
}

LogData.propTypes = {
  wellId: PropTypes.string
};

export default LogData;

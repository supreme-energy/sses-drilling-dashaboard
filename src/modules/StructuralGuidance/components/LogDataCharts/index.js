import React, { useMemo, useState } from "react";
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
  const [selectedGraphs, setSelectedGraph] = useState({ GR: true });
  const { data = [], dataBySection = {} } = useAdditionalDataLogsList(wellId);
  const [anchorEl, setAnchorEl] = useState(null);

  const availableGraphs = useMemo(() => {
    return data.filter(l => l.data_count > 0).map(l => l.label);
  }, [data]);

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

  console.log(_.filter(selectedGraphs, (value, key) => value).length);
  return (
    <WidgetCard className={classes.dataChartsContainer} title="Log Data" hideMenu>
      {_.map(selectedGraphs, (value, graph) => {
        if (value && !_.isEmpty(dataBySection)) {
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
          [classes.addChartButtonInitial]: !_.filter(selectedGraphs, (value, key) => value).length
        })}
        color="secondary"
        onClick={handleAddChart}
      >
        <AddCircle />
        Add Chart
      </Button>
      <LogMenu
        menuItems={availableGraphs}
        selectedGraphs={selectedGraphs}
        setSelectedGraph={setSelectedGraph}
        handleClose={handleCloseMenu}
        anchorEl={anchorEl}
      />
    </WidgetCard>
  );
}

LogData.propTypes = {
  wellId: PropTypes.string
};

export default LogData;

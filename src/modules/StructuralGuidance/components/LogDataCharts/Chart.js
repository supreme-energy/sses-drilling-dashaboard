import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import usePrevious from "react-use/lib/usePrevious";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import MoreVert from "@material-ui/icons/MoreVert";
import _ from "lodash";

import LogPlotIcon from "../../../../assets/logPlot.svg";
import { useAdditionalDataLog } from "../../../../api";
import classes from "./styles.scss";
import PixiContainer from "../../../../components/PixiContainer";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiLine from "../../../../components/PixiLine";
import Grid from "../../../../components/Grid";
import LogMenu from "./LogMenu";
import SettingsMenu from "./SettingsMenu";
import { MD } from "../../../../constants/structuralGuidance";

const SCALE_FACTOR = 1;
const gridGutter = 50;

function Line({ wellId, logId, viewport, mapper, refresh }) {
  const { color, data = [] } = useAdditionalDataLog(wellId, logId);

  useEffect(
    function refreshWebGLRenderer() {
      if (data.length) {
        refresh();
      }
    },
    [refresh, data]
  );

  return <PixiLine container={viewport} data={data} mapData={mapper} color={Number(`0x${color}`)} />;
}

function Chart({ wellId, logId, xAxis, availableGraphs, dataBySection, handleRemoveGraph }) {
  const { color, data = [], label: graphName } = useAdditionalDataLog(wellId, logId);
  const [selectedGraphs, setSelectedGraph] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [{ isSettingsVisible, settingsView }, setSettingsMenu] = useState({
    isSettingsVisible: false,
    settingsView: MD
  });

  const handleOpenGraphMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenSettings = () => {
    setSettingsMenu(d => {
      return { ...d, isSettingsVisible: true };
    });
  };

  const handleCloseGraphMenu = () => {
    setAnchorEl(null);
  };

  const prevXAxis = usePrevious(xAxis);
  const mapper = d => [Number(d[xAxis.toLowerCase()]), Number(d.value)];
  const menuItems = useMemo(() => availableGraphs.filter(g => g !== graphName), [availableGraphs, graphName]);

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const scaleInitialized = useRef(false);

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: true,
    zoomYScale: true,
    isXScalingValid: () => 1
  });

  const onScale = useCallback(() => {
    const minDepth = Math.min(...data.map(d => d[xAxis.toLowerCase()]));
    const minValue = Math.min(...data.map(d => d.value));

    updateView(view => {
      return {
        ...view,
        x: (-minDepth + 20) * view.xScale,
        y: (-minValue + 40) * view.yScale,
        yScale: SCALE_FACTOR,
        xScale: SCALE_FACTOR
      };
    });
  }, [data, xAxis]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (data && data.length && width && height && (!scaleInitialized.current || xAxis !== prevXAxis)) {
        onScale();
        scaleInitialized.current = true;
      }
    },
    [width, data, height, onScale, xAxis, prevXAxis]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, data, selectedGraphs]
  );

  return (
    <div className={classes.graphContainer}>
      <Box display="flex">
        <Box display="flex" flexDirection="column">
          <IconButton className={classes.moreVerticalMenu} color="secondary" onClick={handleOpenSettings}>
            <MoreVert />
          </IconButton>
          <IconButton color="secondary" onClick={handleOpenGraphMenu}>
            <img src={LogPlotIcon} className={classes.icon} />
          </IconButton>
        </Box>
        <div className={classes.plot} ref={canvasRef}>
          <PixiContainer ref={viewportContainer} container={stage} />
          <PixiContainer
            container={viewport}
            child={container => {
              return _.map(selectedGraphs, (value, graph) => {
                if (value) {
                  const id = dataBySection[graph].id;
                  return (
                    <Line key={id} wellId={wellId} logId={id} viewport={container} mapper={mapper} refresh={refresh} />
                  );
                }
              });
            }}
          />
          <PixiLine container={viewport} data={data} mapData={mapper} color={Number(`0x${color}`)} />
          <Grid
            container={viewport}
            view={view}
            width={width}
            height={height}
            gridGutter={gridGutter}
            showXAxis={false}
          />
        </div>
      </Box>

      <LogMenu
        menuItems={menuItems}
        selectedGraphs={selectedGraphs}
        setSelectedGraph={setSelectedGraph}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        handleClose={handleCloseGraphMenu}
      />
      <SettingsMenu
        graph={graphName}
        isVisible={isSettingsVisible}
        setMenu={setSettingsMenu}
        view={settingsView}
        handleRemoveGraph={handleRemoveGraph}
        data={data}
      />
    </div>
  );
}

Chart.propTypes = {
  wellId: PropTypes.string,
  logId: PropTypes.number,
  availableGraphs: PropTypes.arrayOf(PropTypes.string),
  dataBySection: PropTypes.object,
  handleRemoveGraph: PropTypes.func,
  xAxis: PropTypes.string
};

export default Chart;

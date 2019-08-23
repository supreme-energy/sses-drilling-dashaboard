import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useSize } from "react-hook-size";
import usePrevious from "react-use/lib/usePrevious";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import MoreVert from "@material-ui/icons/MoreVert";
import _ from "lodash";
import { max, min } from "d3-array";
import { scaleLinear } from "d3-scale";

import LogPlotIcon from "../../../../assets/logPlot.svg";
import { useAdditionalDataLog } from "../../../../api";
import classes from "./styles.scss";
import PixiContainer from "../../../../components/PixiContainer";
import PixiLabel from "../../../../components/PixiLabel";
import { frozenXYTransform } from "../../../ComboDashboard/components/CrossSection/customPixiTransforms";
import { useWebGLRenderer } from "../../../../hooks/useWebGLRenderer";
import useViewport from "../../../../hooks/useViewport";
import PixiLine from "../../../../components/PixiLine";
import Grid from "../../../../components/Grid";
import LogMenu from "./LogMenu";
import SettingsMenu from "./SettingsMenu";

const gridGutter = 20;

function computeInitialViewXScaleValue(data) {
  const diff = max(data, d => d.md) - min(data, d => d.md);
  return scaleLinear()
    .domain([0, diff])
    .range([0, 1]);
}

function Line({ wellId, logId, viewport, mapper, refresh }) {
  const {
    data: { color, data = [] }
  } = useAdditionalDataLog(wellId, logId);

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
  const {
    data: { color, data = [], label: graphName }
  } = useAdditionalDataLog(wellId, logId);
  const [selectedGraphs, setSelectedGraph] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [{ isSettingsVisible, settingsView }, setSettingsMenu] = useState({
    isSettingsVisible: false,
    settingsView: ""
  });
  const [{ labelHeight, labelWidth }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const currentGraphs = useMemo(() => _.keys(_.pickBy(selectedGraphs, "checked")), [selectedGraphs]);

  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => updateLabelDimensions({ labelWidth, labelHeight }),
    []
  );

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
  const menuItems = useMemo(() => availableGraphs.map(({ label }) => label), [availableGraphs]);

  const canvasRef = useRef(null);
  const { width, height } = useSize(canvasRef);
  const [stage, refresh, renderer] = useWebGLRenderer({ canvas: canvasRef.current, width, height });

  const getInitialViewXScaleValue = useMemo(
    () => (data && data.length ? computeInitialViewXScaleValue(data) : () => 1),
    [data]
  );

  const [view, updateView] = useState({
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1
  });

  const viewportContainer = useRef(null);

  const viewport = useViewport({
    renderer,
    stage: viewportContainer.current && viewportContainer.current.container,
    width,
    height,
    view,
    updateView,
    zoomXScale: false,
    zoomYScale: false
  });

  const onScale = useCallback(() => {
    const minDepth = Math.min(...data.map(d => d[xAxis.toLowerCase()]));
    const minValue = Math.min(...data.map(d => d.value));

    updateView(view => {
      const xScale = getInitialViewXScaleValue(width - gridGutter);
      return {
        ...view,
        x: -minDepth * xScale + gridGutter,
        y: -minValue * view.yScale + 10,
        yScale: 0.15,
        xScale
      };
    });
  }, [data, xAxis, width, getInitialViewXScaleValue]);

  // set initial scale
  useEffect(
    function setInitialXScale() {
      if (data && data.length && width && height) {
        onScale();
      }
    },
    [width, data, height, onScale, xAxis, prevXAxis]
  );

  useEffect(
    function refreshWebGLRenderer() {
      refresh();
    },
    [refresh, stage, view, width, height, data, selectedGraphs, labelHeight, labelWidth]
  );

  useEffect(() => {
    if (color) {
      setSelectedGraph(selectedGraphs => {
        return { ...selectedGraphs, [graphName]: { color, checked: true } };
      });
    }
  }, [color, graphName]);

  useEffect(() => {
    if (graphName) setSettingsMenu({ isSettingsVisible, settingsView: graphName });
  }, [graphName, isSettingsVisible]);

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
          {currentGraphs.map((graph, index) => (
            <PixiLabel
              key={graph}
              container={stage}
              text={graph}
              x={index * 30}
              y={0}
              height={height}
              width={30}
              updateTransform={frozenXYTransform}
              sizeChanged={onSizeChanged}
              textProps={{ fontSize: 14, color: 0xffffff, rotation: -Math.PI / 2, anchor: [1, 0] }}
              backgroundProps={{ backgroundColor: Number(`0x${selectedGraphs[graph].color}`) }}
            />
          ))}

          <PixiContainer
            container={viewport}
            child={container => {
              return currentGraphs.map(graph => {
                const id = dataBySection[graph].id;
                return (
                  <Line key={id} wellId={wellId} logId={id} viewport={container} mapper={mapper} refresh={refresh} />
                );
              });
            }}
          />
          <Grid
            container={viewport}
            view={view}
            width={width}
            height={height}
            gridGutter={gridGutter}
            showXAxis={false}
            showYAxis={false}
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
        availableGraphs={availableGraphs}
      />
      <SettingsMenu
        graph={graphName}
        isVisible={isSettingsVisible}
        setMenu={setSettingsMenu}
        view={settingsView}
        handleRemoveGraph={handleRemoveGraph}
        data={data}
        setSelectedGraph={setSelectedGraph}
        selectedGraphs={selectedGraphs}
        currentGraphs={currentGraphs}
      />
    </div>
  );
}

Chart.propTypes = {
  wellId: PropTypes.string,
  logId: PropTypes.number,
  availableGraphs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      color: PropTypes.color
    })
  ),
  dataBySection: PropTypes.object,
  handleRemoveGraph: PropTypes.func,
  xAxis: PropTypes.string
};

export default Chart;

import React, { useCallback, useReducer, useState, useEffect } from "react";
import { useInterpretationRenderer, gridGutter } from ".";
import { useComputedDraftSegmentsOnly } from "../selectors";
import useMemo from "react-powertools/hooks/useMemo";
import useRef from "react-powertools/hooks/useRef";
import { useDragActions, useSaveWellLogActions } from "../actions";
import useDraggable from "../../../hooks/useDraggable";
import { selectionColor } from "../pixiColors";
import PixiContainer from "../../../components/PixiContainer";
import { frozenScaleTransform } from "../../ComboDashboard/components/CrossSection/customPixiTransforms";
import PixiLabel from "../../../components/PixiLabel";
import { twoDecimals, threeDecimals } from "../../../constants/format";
import PixiLine from "../../../components/PixiLine";
import PixiRectangle from "../../../components/PixiRectangle";
import SegmentLabel from "../../../components/SegmentLabel";

function PixiTooltip({ refresh, target, text, labelPadding, textProps, position, canvas, hovered, maxX, ...props }) {
  const [state, updateState] = useState({ x: 0, y: 0, width: 0, height: 0, mouseOut: !hovered });
  const { mouseOut, x, y, width, height } = state;
  const onSizeChanged = useCallback(
    (width, height) => {
      updateState(state => ({ ...state, width, height }));
    },
    [updateState]
  );

  const havePosition = position !== null;
  const showTooltip = !mouseOut || position;

  useEffect(
    function enableMouseInteractions() {
      const onMouseMove = e => {
        updateState(state => ({ ...state, ...e.data.getLocalPosition(target) }));
      };

      const onMouseOver = e => {
        if (e) {
          e.target.emit("mouseover");

          updateState(state => ({ ...state, ...e.data.getLocalPosition(target), mouseOut: false }));
          target.on("mousemove", onMouseMove);
        }
      };

      const onMouseOut = e => {
        target.off("mousemove", onMouseMove);

        updateState(state => ({ ...state, mouseOut: true }));
      };

      if (target && !havePosition) {
        target.on("mouseout", onMouseOut);
        target.on("mouseover", onMouseOver);
        if (!mouseOut) {
          target.on("mousemove", onMouseMove);
        }
      }

      return () => {
        if (target) {
          target.off("mouseout", onMouseOut);
          target.off("mouseover", onMouseOver);
          target.off("mousemove", onMouseMove);
        }
      };
    },
    [target, havePosition, mouseOut, canvas]
  );

  // reinitialize mouseOut
  useEffect(() => {
    updateState(state => ({ ...state, mouseOut: !hovered }));
  }, [target, updateState, hovered]);

  useEffect(refresh, [state, text]);

  const calcX = position ? position.x : Math.min(maxX, x) - width / 2;
  const calcY = position ? position.y : y - height - 10;

  return showTooltip ? (
    <PixiLabel
      container={target}
      backgroundProps={{ backgroundColor: 0x000000, radius: 5, backgroundAlpha: 0.7 }}
      textProps={{ color: 0xffffff, fontSize: 12, ...textProps }}
      sizeChanged={onSizeChanged}
      {...props}
      text={text}
      padding={labelPadding}
      x={calcX}
      y={calcY}
    />
  ) : null;
}

PixiTooltip.defaultProps = {
  labelPadding: { top: 5, bottom: 5, left: 5, right: 5 },
  textProps: {}
};

const initialState = {
  interactionsRunning: false,
  currentInteractions: { dip: false, fault: false }
};

const segmentSelectionReducer = (state, action) => {
  switch (action.type) {
    case "SET_INTERACTIONS":
      return {
        ...state,
        interactionsRunning: false,
        currentInteractions: action.interactions
      };

    case "START_INTERACTIONS":
      return {
        ...state,
        interactionsRunning: true
      };
    case "STOP_INTERACTIONS":
      return {
        ...state,
        interactionsRunning: false
      };

    default:
      throw new Error("action not defined");
  }
};

const tooltipTextProps = {
  breakWords: false,
  wrap: true,
  wordWrap: true,
  wrapWidth: 30
};

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function getTooltipText({ interactionsRunning, segments, ...rest }) {
  if (interactionsRunning) {
    return ["dip", "fault"]
      .filter(p => rest[p])
      .map(p =>
        p === "dip"
          ? `Dip ${segments.map(s => threeDecimals(s.sectdip)).join(" ")}`
          : `Fault ${segments.map(s => threeDecimals(s.fault)).join(" ")}`
      )
      .join("\n");
  }
  return ["dip", "fault"]
    .filter(p => rest[p])
    .map(capitalize)
    .join(" ");
}

const SegmentSelection = ({
  totalWidth,
  container,
  allSegments,
  draftColor,
  draftMode,
  selectedIndex,
  zIndex,
  onSegmentClick
}) => {
  const { viewport, stage, canvasRef, view } = useInterpretationRenderer();
  const selectedSegment = allSegments[selectedIndex];

  const draftSegments = useComputedDraftSegmentsOnly();

  const segments = useMemo(() => (draftMode ? draftSegments : [selectedSegment]), [
    draftSegments,
    selectedSegment,
    draftMode
  ]);

  const lineData = useMemo(() => [[0, 0], [totalWidth, 0]], [totalWidth]);
  const [firstSegment] = segments;
  const lastSegment = segments[segments.length - 1];
  const segmentHeight = view.yScale * Math.abs(lastSegment.enddepth - firstSegment.startdepth);
  const selectionContainerRef = useRef(null);
  const segmentRef = useRef(null);
  const { onSegmentDrag, onEndSegmentDrag, onStartSegmentDrag } = useDragActions();
  const { saveSelectedWellLog } = useSaveWellLogActions();
  const internalState = useRef({ tooltip: null });

  const [
    {
      interactionsRunning,
      currentInteractions: { dip, fault }
    },
    dispatch
  ] = useReducer(segmentSelectionReducer, initialState);

  const startInteractions = useCallback(() => {
    if (!interactionsRunning) {
      dispatch({ type: "START_INTERACTIONS" });
    }
  }, [interactionsRunning, dispatch]);

  const onStartSegmentDragHandler = useCallback(
    event => {
      onStartSegmentDrag(event.data.getLocalPosition(viewport), firstSegment);
      startInteractions();
    },
    [viewport, onStartSegmentDrag, firstSegment, startInteractions]
  );
  const onEndSegmentDragHandler = useCallback(
    event => {
      onEndSegmentDrag(event.data.getLocalPosition(viewport), lastSegment);
      startInteractions();
    },
    [viewport, onEndSegmentDrag, lastSegment, startInteractions]
  );

  const onSegmentDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = (currMouse.y - prevMouse.y) / view.yScale;
      onSegmentDrag(event.data.getLocalPosition(viewport), delta, firstSegment);
      startInteractions();
    },
    [viewport, onSegmentDrag, firstSegment, view, startInteractions]
  );

  const startLineRef = useRef(null);
  const endLineRef = useRef(null);
  const leftSegmentDragContainer = useRef(null);
  const rightSegmentDragContainer = useRef(null);
  const onDragEnd = useCallback(async () => {
    dispatch({ type: "STOP_INTERACTIONS" });

    if (!draftMode) {
      saveSelectedWellLog();
    }
  }, [saveSelectedWellLog, draftMode]);
  const { refresh } = useInterpretationRenderer();
  const getStartLine = useCallback(() => startLineRef.current && startLineRef.current.container, []);
  const getEndLine = useCallback(() => endLineRef.current && endLineRef.current.container, []);
  const getLeftSegmentContainer = useCallback(
    () => leftSegmentDragContainer.current && leftSegmentDragContainer.current.container,
    []
  );

  const getRightSegmentContainer = useCallback(
    () => rightSegmentDragContainer.current && rightSegmentDragContainer.current.container,
    []
  );

  const updateInteractions = useCallback(
    interactions => {
      if (!interactionsRunning) {
        dispatch({ type: "SET_INTERACTIONS", interactions });
      }
    },
    [interactionsRunning, dispatch]
  );

  const onSegmentOver = useCallback(
    e => {
      if (e) {
        internalState.current.tooltipTarget = e.target;
      }
      refresh();
      updateInteractions({ fault: true, dip: false });
    },
    [refresh, updateInteractions]
  );

  const onStartOver = useCallback(
    e => {
      if (e) {
        internalState.current.tooltipTarget = e.target;
      }
      refresh();
      updateInteractions({ fault: true, dip: true });
    },
    [refresh, updateInteractions]
  );

  const onEndOver = useCallback(
    e => {
      if (e) {
        internalState.current.tooltipTarget = e.target;
      }
      refresh();
      updateInteractions({ dip: true, fault: false });
    },
    [refresh, updateInteractions]
  );

  const onLeftSegmentDragEnd = useCallback(
    (e, dragged) => {
      // no drag, just click
      if (!dragged) {
        onSegmentClick(selectedSegment);
      }

      onDragEnd(e, dragged);
    },
    [onSegmentClick, onDragEnd, selectedSegment]
  );

  useDraggable({
    getContainer: getStartLine,
    root: stage,
    canvas: canvasRef.current,
    cursor: "row-resize",
    onOver: onStartOver,
    onDrag: onStartSegmentDragHandler,
    onDragEnd,
    x: 0,
    y: -5,
    width: totalWidth,
    height: 10
  });

  useDraggable({
    getContainer: getEndLine,
    root: stage,
    onDrag: onEndSegmentDragHandler,
    canvas: canvasRef.current,
    onOver: onEndOver,
    cursor: "row-resize",
    onDragEnd,
    x: 0,
    y: -5,
    width: totalWidth,
    height: 10
  });

  useDraggable({
    getContainer: getLeftSegmentContainer,
    root: stage,
    onDrag: onSegmentDragHandler,
    canvas: canvasRef.current,
    onOver: onSegmentOver,
    onDragEnd: onLeftSegmentDragEnd,
    cursor: "ns-resize",
    x: 0,
    y: 2,
    width: 10,
    height: segmentHeight - 4
  });

  useDraggable({
    getContainer: getRightSegmentContainer,
    root: stage,
    onDrag: onSegmentDragHandler,
    canvas: canvasRef.current,
    onOver: onSegmentOver,
    onDragEnd,
    cursor: "ns-resize",
    x: totalWidth - gridGutter - 20,
    y: 2,
    width: 10,
    height: segmentHeight - 4
  });

  const backgroundColor = draftMode ? draftColor : selectionColor;

  const tooltipText = useMemo(() => getTooltipText({ interactionsRunning, dip, fault, segments }), [
    interactionsRunning,
    dip,
    fault,
    segments
  ]);

  const tooltipPosition = useMemo(
    () =>
      interactionsRunning
        ? {
            x: -55,
            y: fault ? 10 : -60
          }
        : null,
    [interactionsRunning, fault]
  );

  const startDepth = firstSegment.startdepth < lastSegment.enddepth ? 0 : segmentHeight;
  const endDepth = firstSegment.startdepth < lastSegment.enddepth ? segmentHeight : 0;

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={Math.min(firstSegment.startdepth, lastSegment.enddepth)}
      container={container}
      updateTransform={frozenScaleTransform}
      zIndex={zIndex}
      child={container => (
        <React.Fragment>
          <SegmentLabel
            refresh={refresh}
            container={container}
            backgroundColor={backgroundColor}
            segment={firstSegment}
            y={startDepth}
            text={twoDecimals(firstSegment.startdepth)}
            ref={segmentRef}
          />
          <SegmentLabel
            refresh={refresh}
            container={container}
            backgroundColor={backgroundColor}
            segment={lastSegment}
            text={twoDecimals(lastSegment.enddepth)}
            y={endDepth}
          />

          <PixiContainer
            x={10}
            width={10}
            ref={rightSegmentDragContainer}
            container={container}
            updateTransform={frozenScaleTransform}
          />

          <PixiContainer
            x={0}
            width={10}
            ref={leftSegmentDragContainer}
            container={container}
            updateTransform={frozenScaleTransform}
          />

          <PixiContainer
            ref={startLineRef}
            zIndex={zIndex}
            container={container}
            y={startDepth}
            updateTransform={frozenScaleTransform}
            child={startLineContainer => (
              <PixiLine
                y={0}
                container={startLineContainer}
                data={lineData}
                color={draftMode ? draftColor : selectionColor}
                lineWidth={2}
                nativeLines={false}
              />
            )}
          />
          <PixiContainer
            ref={endLineRef}
            container={container}
            y={endDepth}
            updateTransform={frozenScaleTransform}
            child={endLineContainer => (
              <PixiLine
                y={0}
                container={endLineContainer}
                data={lineData}
                color={draftMode ? draftColor : selectionColor}
                lineWidth={2}
                nativeLines={false}
              />
            )}
          />

          {!draftMode && (
            <PixiRectangle
              width={10}
              height={segmentHeight}
              y={0}
              backgroundAlpha={0.5}
              x={totalWidth - gridGutter - 10}
              radius={5}
              backgroundColor={backgroundColor}
              container={container}
            />
          )}
          <PixiTooltip
            canvas={canvasRef.current}
            hovered
            position={tooltipPosition}
            target={internalState.current.tooltipTarget}
            text={tooltipText}
            refresh={refresh}
            zIndex={zIndex}
            textProps={tooltipTextProps}
            maxX={totalWidth - gridGutter - 30}
          />
        </React.Fragment>
      )}
    />
  );
};

export default SegmentSelection;

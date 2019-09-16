import React, { useCallback, useReducer, forwardRef, useState, useEffect, useImperativeHandle } from "react";
import { useInterpretationRenderer } from ".";
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
import * as PIXI from "pixi.js";

function PixiTooltip({
  refresh,
  target,
  text,
  labelPadding,
  textProps,
  targetWidth,
  targetX,
  targetY,
  targetHeight,
  position,
  canvas,
  ...props
}) {
  const [state, updatePosition] = useState({ x: 0, y: 0, width: 0, height: 0, mouseOut: true });
  const { mouseOut, x, y, width, height } = state;
  const onSizeChanged = useCallback(
    (width, height) => {
      updatePosition(state => ({ ...state, width, height }));
    },
    [updatePosition]
  );

  const havePosition = position !== null;

  useEffect(
    function makeInteractive() {
      if (target && !havePosition) {
        target.interactive = true;
        target.hitArea = new PIXI.Rectangle(targetX, targetY, targetWidth, targetHeight);
      }

      return () => {
        if (target) {
          target.interactive = false;
          target.hitArea = null;
        }
      };
    },
    [target, targetWidth, targetHeight, havePosition, targetX, targetY]
  );

  useEffect(
    function enableMouseInteractions() {
      const onMouseMove = e => {
        updatePosition(state => ({ ...state, ...e.data.getLocalPosition(target) }));
      };

      const onMouseOver = e => {
        if (e) {
          e.target.emit("mouseover");
          updatePosition(state => ({ ...state, ...e.data.getLocalPosition(target), mouseOut: false }));
          target.on("mousemove", onMouseMove);
        }
      };

      const onMouseOut = e => {
        target.off("mousemove", onMouseMove);
        updatePosition(state => ({ ...state, mouseOut: true }));
        if (canvas && !(e.target && e.target.__draggable)) {
          canvas.style.cursor = "default";
        }
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

  useEffect(refresh, [state, text]);
  const calcX = position ? position.x : x - width / 2;
  const calcY = position ? position.y : y - height - 10;

  return !state.mouseOut ? (
    <PixiLabel
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
  labelPadding: { top: 10, bottom: 10, left: 5, right: 5 },
  textProps: {}
};

const SegmentLabel = forwardRef(({ container, segment, y, backgroundColor, ...props }, ref) => {
  const [{ labelWidth, labelHeight }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => {
      updateLabelDimensions({ labelWidth, labelHeight });
    },
    [updateLabelDimensions]
  );

  const labelRef = useRef(null);

  const { refresh } = useInterpretationRenderer();

  useEffect(
    function refreshWebGl() {
      refresh();
    },
    [labelWidth, labelHeight, refresh]
  );

  useImperativeHandle(ref, () => ({
    container: labelRef.current && labelRef.current.container
  }));

  const labelX = -labelWidth;
  const labelY = y - labelHeight / 2;

  return (
    <PixiLabel
      {...props}
      ref={labelRef}
      y={labelY}
      sizeChanged={onSizeChanged}
      container={container}
      x={labelX}
      textProps={{ fontSize: 12, color: 0xffffff }}
      backgroundProps={{ backgroundColor, radius: 5 }}
    />
  );
});

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
  wrap: true,
  breakWords: true,
  wrapWidth: 50
};

function getTooltipText(interactionsRunning, dip, fault, selectedSegment) {
  if (interactionsRunning) {
    return `${dip ? `Dip ${threeDecimals(selectedSegment.sectdip)} ` : ""}${
      fault ? `Fault ${threeDecimals(selectedSegment.fault)}` : ""
    }`;
  }
  return `${dip ? "Dip " : ""}${fault ? "Fault" : ""}`;
}

const SegmentSelection = ({
  totalWidth,
  container,
  selectedWellLog,
  allSegments,
  draftColor,
  draftMode,
  nrPrevSurveysToDraft,
  selectedIndex
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
  const segmentHeight = view.yScale * (lastSegment.enddepth - firstSegment.startdepth);
  const selectionContainerRef = useRef(null);
  const segmentRef = useRef(null);
  const { onSegmentDrag, onEndSegmentDrag, onStartSegmentDrag } = useDragActions();
  const { saveSelectedWellLog } = useSaveWellLogActions();

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
  const segmentDragContainer = useRef(null);
  const onDragEnd = useCallback(() => {
    !draftMode && saveSelectedWellLog();
    dispatch({ type: "STOP_INTERACTIONS" });
  }, [saveSelectedWellLog, draftMode]);
  const { refresh } = useInterpretationRenderer();
  const getStartLine = useCallback(() => startLineRef.current && startLineRef.current.container, []);
  const getEndLine = useCallback(() => endLineRef.current && endLineRef.current.container, []);
  const getSegmentContainer = useCallback(
    () => segmentDragContainer.current && segmentDragContainer.current.container,
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

  const onSegmentOver = useCallback(() => {
    refresh();
    updateInteractions({ fault: true });
  }, [refresh, updateInteractions]);

  const onStartOver = useCallback(() => {
    refresh();
    updateInteractions({ fault: true, dip: true });
  }, [refresh, updateInteractions]);

  const onEndOver = useCallback(() => {
    refresh();
    updateInteractions({ dip: true });
  }, [refresh, updateInteractions]);

  useDraggable({
    getContainer: getStartLine,
    root: stage,
    canvas: canvasRef.current,
    cursor: "row-resize",
    onOver: onStartOver,
    onDrag: onStartSegmentDragHandler,
    onDragEnd,
    x: 0,
    y: -2,
    width: totalWidth,
    height: 4
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
    y: -2,
    width: totalWidth,
    height: 6
  });

  useDraggable({
    getContainer: getSegmentContainer,
    root: stage,
    onDrag: onSegmentDragHandler,
    canvas: canvasRef.current,
    onOver: onSegmentOver,
    onDragEnd,
    cursor: "ns-resize",
    x: 0,
    y: 2,
    width: totalWidth,
    height: segmentHeight - 2
  });

  const backgroundColor = draftMode ? draftColor : selectionColor;

  const tooltipText = getTooltipText(interactionsRunning, dip, fault, selectedSegment);

  const tooltipPosition = useMemo(
    () =>
      interactionsRunning
        ? {
            x: -55,
            y: fault ? 10 : segmentHeight - 60
          }
        : null,
    [interactionsRunning, segmentHeight, fault]
  );

  return (
    <PixiContainer
      ref={selectionContainerRef}
      y={firstSegment.startdepth - 2}
      container={container}
      updateTransform={frozenScaleTransform}
      child={container => (
        <React.Fragment>
          <SegmentLabel
            container={container}
            backgroundColor={backgroundColor}
            segment={firstSegment}
            y={0}
            text={twoDecimals(firstSegment.startdepth)}
            ref={segmentRef}
          />
          <SegmentLabel
            container={container}
            backgroundColor={backgroundColor}
            segment={lastSegment}
            text={twoDecimals(lastSegment.enddepth)}
            y={segmentHeight}
          />
          <PixiTooltip
            canvas={canvasRef.current}
            targetWidth={totalWidth - 10}
            targetX={10}
            targetY={-2}
            position={tooltipPosition}
            targetHeight={segmentHeight + 5}
            target={container}
            text={tooltipText}
            container={container}
            refresh={refresh}
            textProps={tooltipTextProps}
          />
          <PixiContainer
            x={0}
            ref={segmentDragContainer}
            container={container}
            updateTransform={frozenScaleTransform}
          />
          <PixiContainer
            ref={startLineRef}
            container={container}
            y={2}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                y={0}
                container={container}
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
            y={segmentHeight}
            updateTransform={frozenScaleTransform}
            child={container => (
              <PixiLine
                y={2}
                container={container}
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
              x={totalWidth - 70}
              radius={5}
              backgroundColor={backgroundColor}
              container={container}
            />
          )}
        </React.Fragment>
      )}
    />
  );
};

export default SegmentSelection;

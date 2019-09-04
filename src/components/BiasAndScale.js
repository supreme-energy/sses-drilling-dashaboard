import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import PixiRectangle from "./PixiRectangle";
import PixiContainer from "./PixiContainer";
import PixiLine from "./PixiLine";
import useDraggable from "../hooks/useDraggable";
import useRef from "react-powertools/hooks/useRef";

function BiasAndScale({
  container,
  x,
  y,
  axis,
  extent,
  bias,
  scale,
  setScale,
  gridGutter,
  refresh,
  canvas,
  color,
  handleDragEnd
}) {
  const length = extent[1] - extent[0];
  const isVertical = axis === "y";
  const segmentCursor = isVertical ? "ns-resize" : "ew-resize";
  const lineCursor = isVertical ? "row-resize" : "col-resize";
  const lineData = isVertical ? [[10, 0], [0, 0]] : [[0, 10], [0, 0]];

  useEffect(
    function redraw() {
      refresh();
    },
    [refresh, bias, scale]
  );

  const segmentContainerRef = useRef(null);
  const startLineRef = useRef(null);
  const endLineRef = useRef(null);

  const onRootDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse[axis] - prevMouse[axis];

      setScale(scale, bias + delta);
    },
    [bias, scale, setScale, axis]
  );

  const onStartDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse[axis] - prevMouse[axis];

      const newLength = length * scale - delta;
      const newScale = newLength / length;

      setScale(newScale, bias + delta / 2);
    },
    [length, bias, scale, setScale, axis]
  );

  const onEndDragHandler = useCallback(
    (event, prevMouse) => {
      const currMouse = event.data.global;
      const delta = currMouse[axis] - prevMouse[axis];

      const newLength = length * scale + delta;
      const newScale = newLength / length;

      setScale(newScale, bias + delta / 2);
    },
    [length, setScale, scale, bias, axis]
  );

  const computedLength = length * scale;
  const computedMin = extent[0] - (computedLength - length) / 2;

  const onDragEnd = () => handleDragEnd();

  const getSegment = useCallback(() => segmentContainerRef.current && segmentContainerRef.current.container, []);
  useDraggable({
    getContainer: getSegment,
    root: container,
    onDrag: onRootDragHandler,
    onDragEnd,
    canvas,
    cursor: segmentCursor,
    width: !isVertical ? computedLength - 4 : 8,
    height: isVertical ? computedLength - 4 : 8,
    x: 2,
    y: 0
  });

  const getSegmentStart = useCallback(() => startLineRef.current && startLineRef.current.container, []);
  useDraggable({
    getContainer: getSegmentStart,
    root: container,
    onDrag: onStartDragHandler,
    onDragEnd,
    canvas,
    cursor: lineCursor,
    width: isVertical ? 10 : 3,
    x: -1,
    y: -1,
    height: isVertical ? 3 : 10
  });

  const getSegmentEnd = useCallback(() => endLineRef.current && endLineRef.current.container, []);
  useDraggable({
    getContainer: getSegmentEnd,
    root: container,
    onDrag: onEndDragHandler,
    onDragEnd,
    canvas,
    cursor: lineCursor,
    width: isVertical ? 10 : 3,
    x: 0,
    y: 0,
    height: isVertical ? 3 : 10
  });

  return (
    <React.Fragment>
      <PixiContainer
        container={container}
        x={!isVertical ? gridGutter + computedMin + bias : x}
        y={isVertical ? computedMin + bias - gridGutter : y}
        child={container => (
          <React.Fragment>
            <PixiContainer
              ref={startLineRef}
              container={container}
              x={!isVertical ? 0 : -1}
              y={isVertical ? -2 : -1}
              child={container => (
                <PixiLine container={container} data={lineData} color={color} nativeLines={false} lineWidth={2} />
              )}
            />
            <PixiContainer
              ref={endLineRef}
              container={container}
              x={!isVertical ? computedLength : -1}
              y={isVertical ? computedLength - 2 : -1}
              child={container => (
                <PixiLine container={container} data={lineData} color={color} nativeLines={false} lineWidth={2} />
              )}
            />

            <PixiContainer
              ref={segmentContainerRef}
              container={container}
              x={0}
              y={0}
              child={container => (
                <PixiRectangle
                  container={container}
                  width={!isVertical ? computedLength - 2 : 8}
                  height={isVertical ? computedLength - 2 : 8}
                  radius={5}
                  backgroundColor={color}
                />
              )}
            />
          </React.Fragment>
        )}
      />
    </React.Fragment>
  );
}
BiasAndScale.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  axis: PropTypes.string,
  bias: PropTypes.number,
  scale: PropTypes.number,
  setScale: PropTypes.func,
  gridGutter: PropTypes.number,
  refresh: PropTypes.func,
  container: PropTypes.object.isRequired,
  color: PropTypes.number,
  canvas: PropTypes.object,
  handleDragEnd: PropTypes.func,
  extent: PropTypes.arrayOf(PropTypes.number)
};

BiasAndScale.defaultProps = {
  x: 0,
  y: 0,
  axis: "x",
  gridGutter: 0,
  handleDragEnd: () => {}
};

export default BiasAndScale;

import React, { forwardRef, useCallback, useState, useRef, useEffect, useImperativeHandle } from "react";
import PixiLabel from "./PixiLabel";

const SegmentLabel = forwardRef(({ container, y, backgroundColor, refresh, offsetX, ...props }, ref) => {
  const [{ labelWidth, labelHeight }, updateLabelDimensions] = useState({ labelWidth: 0, labelHeight: 0 });
  const onSizeChanged = useCallback(
    (labelWidth, labelHeight) => {
      updateLabelDimensions({ labelWidth, labelHeight });
    },
    [updateLabelDimensions]
  );

  const labelRef = useRef(null);

  useEffect(
    function refreshWebGl() {
      refresh();
    },
    [labelWidth, labelHeight, refresh]
  );

  useImperativeHandle(ref, () => ({
    container: labelRef.current && labelRef.current.container
  }));

  const labelX = -labelWidth + offsetX;
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

SegmentLabel.defaultProps = {
  offsetX: 0
};

export default SegmentLabel;

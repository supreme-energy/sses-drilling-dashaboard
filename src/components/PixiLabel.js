import React, { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import PixiRectangle from "./PixiRectangle";
import PixiText from "./PixiText";
import useRef from "react-powertools/hooks/useRef";
import PixiContainer from "./PixiContainer";

const PixiLabel = forwardRef(
  ({ text, padding, container, backgroundProps, textProps, x, y, sizeChanged, height, width, ...props }, ref) => {
    const textRef = useRef(null);

    const [{ textWidth, textHeight }, updateLabelDimensions] = useState({ textWidth: 0, textHeight: 0 });
    const bgWidth = width || textWidth + padding.left + padding.right;
    const bgHeight = height || textHeight + padding.top + padding.bottom;
    const containerRef = useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        width: bgWidth,
        height: bgHeight,
        container: containerRef.current && containerRef.current.container
      }),
      [bgWidth, bgHeight]
    );

    useEffect(() => {
      const measuredTextWidth = (textRef.current && textRef.current.pixiText.width) || 0;
      const measuredTextHeight = (textRef.current && textRef.current.pixiText.height) || 0;
      updateLabelDimensions({ textWidth: measuredTextWidth, textHeight: measuredTextHeight });
    }, [text]);

    useEffect(() => {
      sizeChanged(bgWidth, bgHeight);
    }, [bgWidth, bgHeight, sizeChanged]);

    return (
      <PixiContainer
        ref={containerRef}
        container={container}
        {...props}
        child={container => (
          <React.Fragment>
            <PixiRectangle width={bgWidth} height={bgHeight} x={x} y={y} container={container} {...backgroundProps} />
            <PixiText
              ref={textRef}
              container={container}
              text={text}
              x={x + padding.left}
              y={y + padding.top}
              {...textProps}
            />
          </React.Fragment>
        )}
      />
    );
  }
);

PixiLabel.defaultProps = {
  backgroundProps: {},
  sizeChanged: () => {},
  x: 0,
  y: 0,
  textProps: {},
  padding: { top: 5, bottom: 2, left: 5, right: 5 }
};

export default PixiLabel;

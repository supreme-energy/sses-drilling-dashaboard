import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import PixiRectangle from "./PixiRectangle";
import PixiText from "./PixiText";
import useRef from "react-powertools/hooks/useRef";
import PixiContainer from "./PixiContainer";

const PixiLabel = forwardRef(
  ({ text, padding, container, backgroundProps, textProps, x, y, sizeChanged, ...props }, ref) => {
    const textRef = useRef(null);
    const textWidth = (textRef.current && textRef.current.pixiText.width) || 0;
    const textHeight = (textRef.current && textRef.current.pixiText.height) || 0;
    const bgWidth = textWidth + padding.left + padding.right;
    const bgHeight = textHeight + padding.top + padding.bottom;
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
  textProps: {},
  padding: { top: 5, bottom: 2, left: 5, right: 5 }
};

export default PixiLabel;

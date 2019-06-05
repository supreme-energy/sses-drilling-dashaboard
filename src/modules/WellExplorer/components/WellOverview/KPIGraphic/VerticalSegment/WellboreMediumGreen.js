import React from "react";
import PropTypes from "prop-types";
import { transparentColor, openHoleColor } from "../colorStops";

export default function WellboreMediumGreen({ height, transparent, className, openHole }) {
  const segmentColor = (
    <React.Fragment>
      <stop stopColor="#8AAC74" offset="0%" />
      <stop stopColor="#538531" offset="100%" />
    </React.Fragment>
  );

  const curveColor = (
    <React.Fragment>
      <stop stopColor="#538531" offset="0%" />
      <stop stopColor="#8AAC74" offset="100%" />
    </React.Fragment>
  );
  const getColor = defaultColor => (transparent ? transparentColor : openHole ? openHoleColor : defaultColor);
  return (
    <svg
      width="79px"
      className={className}
      height={`${height}px`}
      viewBox={`0 0 79 ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Illustration / Wellbore_Medium_Green</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbmg-linearGradient-1">
          {getColor(segmentColor)}
        </linearGradient>
        <linearGradient x1="0%" y1="41.0801055%" x2="100%" y2="41.0801055%" id="wbmg-linearGradient-3">
          {getColor(curveColor)}
        </linearGradient>
        <ellipse id="wbmg-path-4" cx="35.5" cy="7" rx="35.5" ry="7" />
        <filter x="-11.3%" y="-28.6%" width="122.5%" height="214.3%" filterUnits="objectBoundingBox" id="wbmg-filter-5">
          <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1" />
        </filter>
      </defs>
      <g id="wbmg-Scratch-Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="wbmg-Illustration-/-Wellbore_Medium_Green" transform="translate(4.000000, 0.000000)">
          <ellipse
            id="wbmg-Oval-Copy-3"
            fill="url(#wbmg-linearGradient-1)"
            cx="35.5"
            cy={height - 7}
            rx="35.5"
            ry="7"
          />
          <rect id="wbmg-Rectangle" fill="url(#wbmg-linearGradient-1)" x="0" y="7" width="71" height={height - 14} />
          <g id="wbmg-Oval-Copy-3">
            <use fill="black" fillOpacity="1" filter="url(#wbmg-filter-5)" xlinkHref="#wbmg-path-4" />
            <use fill="url(#wbmg-linearGradient-3)" fillRule="evenodd" xlinkHref="#wbmg-path-4" />
          </g>
        </g>
      </g>
    </svg>
  );
}

WellboreMediumGreen.defaultProps = {
  height: 271
};

WellboreMediumGreen.propTypes = {
  height: PropTypes.number.isRequired,
  className: PropTypes.string,
  transparent: PropTypes.bool,
  openHole: PropTypes.bool
};

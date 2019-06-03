import React from "react";
import uniqueId from "lodash/uniqueId";
import PropTypes from "prop-types";
import { transparentColor, openHoleColor } from "../colorStops";

export default function WellboreLargeGreen({ className, height, transparent, openHole }) {
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

  const gradient1 = uniqueId();
  const gradient2 = uniqueId();

  return (
    <svg
      width="93px"
      height={`${height}px`}
      viewBox={`0 0 93 ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Illustration / Wellbore_Large_Green</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <linearGradient x1="0%" y1="41.0801055%" x2="100%" y2="41.0801055%" id={gradient1}>
          {getColor(curveColor)}
        </linearGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id={gradient2}>
          {getColor(segmentColor)}
        </linearGradient>
        <ellipse id="path-4" cx="42.5" cy="7" rx="42.5" ry="7" />
        <filter x="-9.4%" y="-28.6%" width="118.8%" height="214.3%" filterUnits="objectBoundingBox" id="wblgfilter-4">
          <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="wblg-shadowBlurOuter1" />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0"
            type="matrix"
            in="wblg-shadowBlurOuter1"
          />
        </filter>
      </defs>
      <g id="Scratch-Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Illustration-/-Wellbore_Large_Green" transform="translate(4.000000, 0.000000)">
          <ellipse id="Oval-Copy-3" fill={`url(#${gradient1})`} cx="42.5" cy={height - 7} rx="42.5" ry="7" />
          <rect id="Rectangle" fill={`url(#${gradient2})`} x="0" y="6" width="85" height={height - 14} />
          <g id="Oval-Copy-3">
            <use fill="black" fillOpacity="1" filter="url(#wblgfilter-4)" xlinkHref="#path-4" />
            <use fill={`url(#${gradient1})`} fillRule="evenodd" xlinkHref="#path-4" />
          </g>
        </g>
      </g>
    </svg>
  );
}

WellboreLargeGreen.defaultProps = {
  height: 125
};

WellboreLargeGreen.propTypes = {
  height: PropTypes.number.isRequired,
  className: PropTypes.string,
  transparent: PropTypes.bool,
  openHole: PropTypes.bool
};

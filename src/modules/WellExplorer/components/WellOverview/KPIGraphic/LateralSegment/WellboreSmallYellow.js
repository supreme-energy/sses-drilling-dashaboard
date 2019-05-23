import React from "react";

export default function WellboreSmallYellow({ className, width, transparent, openHole }) {
  const transparentColor = <stop stopColor="#E2E2E2" offset="100%" />;
  const openHoleColor = <stop stopColor="#000000" offset="100%" />;
  const segmentColor = (
    <React.Fragment>
      <stop stopColor="#C39200" offset="0%" />
      <stop stopColor="#DEC683" offset="100%" />
    </React.Fragment>
  );
  const wellColor = transparent ? transparentColor : openHole ? openHoleColor : segmentColor;
  return (
    <svg
      className={className}
      width={`${width}px`}
      height="69px"
      viewBox={`0 0 ${width} 69`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Illustration / Wellbore_Small_Yellow</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbsy-linearGradient-1">
          {wellColor}
        </linearGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbsy-linearGradient-2">
          {wellColor}
        </linearGradient>
        <linearGradient x1="0%" y1="41.0801055%" x2="100%" y2="41.0801055%" id="wbsy-linearGradient-3">
          <stop stopColor="#C39200" offset="0%" />
          <stop stopColor="#DEC683" offset="100%" />
        </linearGradient>
        <ellipse id="wbsy-path-4" cx="31.4373884" cy="7.0879197" rx="30.5" ry="7" />
        <filter x="-13.1%" y="-28.6%" width="126.2%" height="214.3%" filterUnits="objectBoundingBox" id="wbsy-filter-5">
          <feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="wbsy-shadowBlurOuter1" />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0"
            type="matrix"
            in="wbsy-shadowBlurOuter1"
          />
        </filter>
      </defs>
      <g id="Scratch-Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          id="Illustration-/-Wellbore_Small_Yellow"
          transform="translate(166.500000, 35.000000) rotate(-90.000000)
          translate(-166.500000, -35.000000) translate(135.500000, -131.500000)"
        >
          <rect id="Rectangle" fill="url(#wbsy-linearGradient-1)" x="1" y="7" width="61" height={width - 15} />
          <ellipse
            id="wbsy-Oval-Copy-2"
            fill="url(#wbsy-linearGradient-2)"
            cx="31.4373884"
            cy={width - 7}
            rx="30.5"
            ry="7"
          />
          <g id="Oval-Copy-3">
            <use fill="black" fillOpacity="1" filter="url(#wbsy-filter-5)" xlinkHref="#wbsy-path-4" />
            <use fill="url(#wbsy-linearGradient-3)" fillRule="evenodd" xlinkHref="#wbsy-path-4" />
          </g>
        </g>
      </g>
    </svg>
  );
}

WellboreSmallYellow.defaultProps = {
  width: 333
};

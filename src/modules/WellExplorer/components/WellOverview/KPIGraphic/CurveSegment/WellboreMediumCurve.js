import React from "react";

export default function WellboreMediumCurve({ className, transparent, openHole }) {
  const transparentColor = <stop stopColor="#e2e2e2" offset="100%" />;
  const openHoleColor = <stop stopColor="#000000" offset="100%" />;
  const segmentColor = (
    <React.Fragment>
      <stop stopColor="#A7A7A7" offset="0%" />
      <stop stopColor="#7C7C7C" offset="100%" />
    </React.Fragment>
  );

  const activeCurveColor = (
    <React.Fragment>
      <stop stopColor="#A6A6A6" offset="0%" />
      <stop stopColor="#7C7C7C" offset="100%" />
    </React.Fragment>
  );

  const curveColor = transparent ? transparentColor : openHole ? openHoleColor : activeCurveColor;

  const wellColor = transparent ? transparentColor : openHole ? openHoleColor : segmentColor;

  return (
    <svg
      className={className}
      width="222px"
      height="181px"
      viewBox="0 0 222 181"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Illustration / Wellbore_Medium_Grey_Curve</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <radialGradient cx="53.3251016%" cy="50%" fx="53.3251016%" fy="50%" r="50.3441611%" id="wbmc-radialGradient-1">
          {curveColor}
        </radialGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbmc-linearGradient-2">
          {wellColor}
        </linearGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbmc-linearGradient-3">
          {wellColor}
        </linearGradient>
        <ellipse id="wbmc-path-4" cx="35.5" cy="7" rx="35.5" ry="7" />
        <filter x="-9.9%" y="-35.7%" width="119.7%" height="200.0%" filterUnits="objectBoundingBox" id="wbmc-filter-5">
          <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1" />
        </filter>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbmc-linearGradient-6">
          {wellColor}
        </linearGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="-1.11022302e-14%" y2="41.0801055%" id="wbmmc-linearGradient-7">
          {wellColor}
        </linearGradient>
      </defs>
      <g id="Scratch-Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Illustration-/-Wellbore_Medium_Grey_Curve" transform="translate(4.000000, 2.000000)">
          <path
            d="M70.9999938,37.0017359 L70.8370971,82.8370971 L71,82.9833617 L71,97 C71,102.522847 75.4771525,107 81,107 L131,107 C131.170849,107 131.340698,
            106.995715 131.509444,106.987248 L140.998264,106.999998 C140.999421,107.166529 141,107.333197 141,107.5 C141,146.436075 109.436075,178 70.5,178 C31.5639251,
            178 0,146.436075 0,107.5 C0,68.5639251 31.5639251,37 70.5,37 C70.6668005,37 70.8334658,37.0005793 70.9999938,37.0017359 Z"
            id="Combined-Shape"
            fill="url(#wbmc-radialGradient-1)"
          />
          <rect id="Rectangle" fill="url(#wbmc-linearGradient-2)" x="0" y="7" width="71" height="100" />
          <g id="Oval-Copy-3">
            <use fill="black" fillOpacity="1" filter="url(#wbmc-filter-5)" xlinkHref="#wbmc-path-4" />
            <use fill="url(#wbmc-linearGradient-3)" fillRule="evenodd" xlinkHref="#wbmc-path-4" />
          </g>
          <rect
            id="Rectangle-Copy-4"
            fill="url(#wbmc-linearGradient-6)"
            transform="translate(131.199471, 142.723137) rotate(-90.000000) translate(-131.199471, -142.723137) "
            x="95.6994715"
            y="82.2231374"
            width="71"
            height="141"
          />
          <ellipse
            id="Oval-Copy-2"
            fill="url(#wbmmc-linearGradient-7)"
            transform="translate(191.000000, 142.500000) rotate(-90.000000) translate(-191.000000, -142.500000) "
            cx="191"
            cy="162.5"
            rx="35.5"
            ry="7"
          />
        </g>
      </g>
    </svg>
  );
}

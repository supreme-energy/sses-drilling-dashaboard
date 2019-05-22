import React from "react";

export default function WellboreBlue({ className, height = 139 }) {
  return (
    <svg
      className={className}
      width="97px"
      height={`${height}px`}
      viewBox={`0 0 97 ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Illustration / Wellbore_Largest_Blue</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
          <stop stopColor="#74A6E4" offset="0%" />
          <stop stopColor="#406DC5" offset="100%" />
        </linearGradient>
        <linearGradient x1="100%" y1="41.0801055%" x2="0%" y2="41.0801055%" id="linearGradient-2">
          <stop stopColor="#74A6E4" offset="0%" />
          <stop stopColor="#406DC5" offset="100%" />
        </linearGradient>
        <linearGradient x1="50%" y1="100%" x2="50%" y2="3.061617e-15%" id="linearGradient-3">
          <stop stopColor="#DFE9F5" offset="0%" />
          <stop stopColor="#91ABDE" offset="100%" />
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="-2.22044605e-14%" y2="50%" id="linearGradient-4">
          <stop stopColor="#064EA8" offset="0%" />
          <stop stopColor="#406DC5" offset="100%" />
        </linearGradient>
      </defs>
      <g id="Scratch-Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Illustration-/-Wellbore_Largest_Blue">
          <ellipse id="Oval-Copy-2" fill="url(#linearGradient-1)" cx="48.5" cy={height - 7} rx="48.5" ry="7" />
          <rect id="Rectangle" fill="url(#linearGradient-2)" x="0" y="7" width="107" height={height - 15} />
          <ellipse id="Oval" fill="url(#linearGradient-3)" cx="48.5" cy="7" rx="48.5" ry="7" />
          <ellipse id="Oval-Copy" fill="url(#linearGradient-4)" cx="49" cy="7" rx="43" ry="5" />
        </g>
      </g>
    </svg>
  );
}

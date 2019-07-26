import React from "react";

export default function({ fill, outline, className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 10 10"
      version="1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4" cy="4" r="4" transform="translate(1 1)" fill={fill} stroke={outline} fillRule="evenodd" />
    </svg>
  );
}

import React from "react";
import PropTypes from "prop-types";
import css from "./styles.scss";
import Box from "@material-ui/core/Box";

export default function PointIcon({ fill }) {
  return (
    <Box px={1} mr={1} display="flex" flexDirection="column" justifyContent="center" className={css.pointIcon}>
      <svg
        width="19px"
        height="23px"
        viewBox="0 0 19 23"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <polygon
            id="path-1"
            points={`12.5 7.5 11.61875 6.61875 8.125 10.10625 8.125 2.5 6.875 2.5 6.875 
            10.10625 3.3875 6.6125 2.5 7.5 7.5 12.5`}
          />
        </defs>
        <g id="SSES-Assets" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-72.000000, -142.000000)" id="Map-Marker/Well/Drilling">
            <g transform="translate(69.000000, 142.000000)">
              <rect id="Container" x="0" y="0" width="24" height="24" />
              <path
                d="M12.5,22.5125132 C14.2784649,17.8257795 21,14.1944204 21,9.5 C21,4.80557963 17.1944204,1 12.5,
                1 C7.80557963,1 4,4.80557963 4,9.5 C4,14.1944204 10.6849926,17.7367036 12.5,22.5125132 Z"
                id="Oval-Copy-11"
                stroke="#FFFFFF"
                fill={fill}
              />
              <g id="icon/navigation/arrow_upward_24px-copy-7" transform="translate(5.000000, 2.000000)">
                <mask id="mask-2" fill="white">
                  <use xlinkHref="#path-1" />
                </mask>
                <g id="icon/navigation/arrow_downward_24px" fillRule="nonzero" />
                <g id="↳-Color" mask="url(#mask-2)" fill="#FFFFFF" />
              </g>
            </g>
          </g>
        </g>
      </svg>
      <div className={css.phasePointIcon} />
    </Box>
  );
}

PointIcon.propTypes = {
  fill: PropTypes.string.isRequired
};

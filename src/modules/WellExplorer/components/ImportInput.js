import React from "react";
import uniqueId from "lodash/uniqueId";
import useRef from "react-powertools/hooks/useRef";

export default function ImportInput({ children, ...props }) {
  const { current: id } = useRef(() => uniqueId());
  return (
    <React.Fragment>
      <input id={id} accept=".csv, .las, .laz" type="file" style={{ display: "none" }} {...props} />
      <label htmlFor={id}>{children}</label>
    </React.Fragment>
  );
}

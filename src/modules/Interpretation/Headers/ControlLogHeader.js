import React from "react";
import Header from "./Header";
import { logDataExtent } from "../selectors";

export default function ControlLogHeader({ data, ...props }) {
  const range = logDataExtent(data);
  return <Header {...props} range={range} />;
}

ControlLogHeader.defaultProps = {
  data: [],
  color: "#7E7D7E"
};

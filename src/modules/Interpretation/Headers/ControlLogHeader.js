import React from "react";
import Header from "./Header";
import { useLogBiasAndScale } from "../selectors";

export default function ControlLogHeader({ data, ...props }) {
  const { bias, scale } = useLogBiasAndScale(props.logId);
  return <Header {...props} range={[bias, scale]} />;
}

ControlLogHeader.defaultProps = {
  data: [],
  color: "#7E7D7E"
};

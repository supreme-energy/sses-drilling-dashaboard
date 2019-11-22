import React from "react";
import Header from "./Header";
import { withWellLogsData } from "../../../api";
import { useLogBiasAndScale } from "../selectors";

function WellLogsHeader({ logs, data: { result }, ...props }) {
  const { bias, scale } = useLogBiasAndScale("wellLogs");

  return <Header {...props} range={[bias, scale]} />;
}

export default withWellLogsData(WellLogsHeader);

WellLogsHeader.defaultProps = {
  logs: []
};

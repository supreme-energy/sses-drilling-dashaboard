import React from "react";
import Header from "./Header";
import { withWellLogsData, EMPTY_ARRAY } from "../../../api";

function WellLogsHeader({ logs, data: { result }, ...props }) {
  const logsGammaExtent = result && result.logsGammaExtent;
  return <Header {...props} range={logsGammaExtent} />;
}

export default withWellLogsData(WellLogsHeader);

WellLogsHeader.defaultProps = {
  logs: []
};

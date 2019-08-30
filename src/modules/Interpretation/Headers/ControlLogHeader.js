import React, { useMemo } from "react";
import Header from "./Header";
import { extent } from "d3-array";

export default function ControlLogHeader({ data, ...props }) {
  const range = useMemo(() => extent(data, item => item.value), [data]);
  return <Header {...props} range={range} />;
}

ControlLogHeader.defaultProps = {
  data: []
};

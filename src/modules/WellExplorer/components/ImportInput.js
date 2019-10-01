import React from "react";
import uniqueId from "lodash/uniqueId";
import useRef from "react-powertools/hooks/useRef";

export default function ImportInput({ children, labelProps, ...props }) {
  const { current: id } = useRef(() => uniqueId());
  return (
    <React.Fragment>
      <input
        id={id}
        accept=".csv, .las, .laz"
        type="file"
        style={{ display: "none" }}
        {...props}
        onChange={e => {
          props.onChange && props.onChange(e);
          e.target.value = null;
        }}
      />
      <label htmlFor={id} {...labelProps}>
        {children}
      </label>
    </React.Fragment>
  );
}

ImportInput.defaultProps = {
  labelProps: {}
};

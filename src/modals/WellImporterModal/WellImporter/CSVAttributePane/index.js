import React from "react";
import { Box } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import PropTypes from "prop-types";
import css from "./styles.scss";
import classNames from "classnames";
import { useWellImporterContainer } from "..";
import isEmpty from "lodash/isEmpty";

export default function CSVAttributePane({ data }) {
  const [state, dispatch] = useWellImporterContainer();
  const { activeInput } = state;
  const unlocked = !isEmpty(activeInput);

  return (
    <Box className={classNames(css.body, { [css.unlocked]: unlocked })} display="flex" flexDirection="column">
      {data.map(d => (
        <Box display="flex" flexDirection="row">
          {Object.keys(d).map(key => (
            <TableCell size="small" component="div" key={key} className={classNames("flex", css.cell)}>
              {d[key]}
            </TableCell>
          ))}
        </Box>
      ))}
    </Box>
  );
}

CSVAttributePane.defaultProps = {
  data: []
};

CSVAttributePane.proptypes = {
  data: PropTypes.array
};

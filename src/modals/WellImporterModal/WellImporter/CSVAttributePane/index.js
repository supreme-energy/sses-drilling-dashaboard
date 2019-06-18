import React from "react";
import { Box } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import PropTypes from "prop-types";
import css from "./styles.scss";
import classNames from "classnames";
import { useWellImporterContainer } from "..";
import isEmpty from "lodash/isEmpty";
import { SELECT_CSV_CELL } from "../state/actions";
import { isSelected, isActive, useParsedFileSelector } from "../selectors";

export default function CSVAttributePane() {
  const { data } = useParsedFileSelector();
  const [state, dispatch] = useWellImporterContainer();
  const { activeInput, csvSelection } = state;
  const unlocked = !isEmpty(activeInput);
  return (
    <Box className={classNames(css.body, { [css.unlocked]: unlocked })} display="flex" flexDirection="column">
      {data.map((d, index) => (
        <Box key={index} display="flex" flexDirection="row">
          {Object.keys(d).map(key => (
            <TableCell
              size="small"
              component="div"
              key={key}
              className={classNames("flex", css.cell, {
                [css.selectedCell]: isSelected(index, key, csvSelection),
                [css.activeField]: isActive(index, key, csvSelection, activeInput && activeInput.fieldKey)
              })}
              onClick={() => {
                if (unlocked) {
                  dispatch({ type: SELECT_CSV_CELL, column: key, row: index, field: activeInput });
                }
              }}
            >
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

import React from "react";
import TableCell from "@material-ui/core/TableCell";
import { Box } from "@material-ui/core";
import classNames from "classnames";
import css from "./styles.scss";
import { useWellImporterContainer } from "..";
import isEmpty from "lodash/isEmpty";
import { isSelected, isActive } from "../selectors";
import { SELECT_CSV_CELL } from "../state/actions";

export default function Header({ fields }) {
  const [state, dispatch] = useWellImporterContainer();
  const { activeInput, csvSelection } = state;
  const unlocked = !isEmpty(activeInput);
  return (
    <Box className={classNames(css.header, { [css.unlocked]: unlocked })} display="flex" flexDirection="row">
      {fields.map(f => (
        <TableCell
          key={f}
          size="small"
          component="div"
          className={classNames("flex", css.headCell, {
            [css.selectedCell]: isSelected(null, f, csvSelection),
            [css.activeField]: isActive(null, f, csvSelection, activeInput && activeInput.fieldKey)
          })}
          variant="head"
          onClick={() => {
            if (unlocked) {
              dispatch({ type: SELECT_CSV_CELL, column: f, row: null, field: activeInput });
            }
          }}
        >
          {f}
        </TableCell>
      ))}
    </Box>
  );
}

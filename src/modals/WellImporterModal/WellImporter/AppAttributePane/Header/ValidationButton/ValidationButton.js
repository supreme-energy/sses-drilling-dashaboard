import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import classnames from "classnames";

import css from "./styles.scss";

const ValidationButton = ({ model, fieldMapping, sectionInfoMapping }) => {
  const isValid = useMemo(
    () =>
      Object.keys(model).reduce((isValid, modelKey) => {
        const data = model[modelKey];
        const mapping = fieldMapping[modelKey];
        if (!isValid) {
          return isValid;
        }

        if (mapping.required && data.value === "") {
          return false;
        }

        return isValid;
      }, true),
    [model, fieldMapping]
  );

  return (
    <Button
      size="small"
      variant="outlined"
      className={classnames({
        [css.button]: true,
        [css.valid]: isValid
      })}
    >
      {isValid ? <CheckIcon className={css.checkIcon} /> : <CloseIcon className={css.closeIcon} />}
      {(sectionInfoMapping && sectionInfoMapping.labelName) || ""}
    </Button>
  );
};

ValidationButton.propTypes = {
  model: PropTypes.object.isRequired,
  fieldMapping: PropTypes.object.isRequired,
  sectionInfoMapping: PropTypes.object.isRequired
};

export default ValidationButton;

import upperFirst from "lodash/upperFirst";
import React from "react";
import { Button, Typography } from "@material-ui/core";

import css from "./styles.scss";

const Header = ({ data, className, onClickCancel }) => {
  return (
    <div className={className}>
      <div>
        <Typography
          variant="h5"
          color="primary"
          className={css.title}
        >
          Import a New Well
        </Typography>
      </div>

      <div className={css.topButtonContainer}>
        <Button
          className={css.button}
          color="primary"
          onClick={onClickCancel}
        >
          Cancel
        </Button>
        <Button
          className={css.button}
          variant="contained"
          color="secondary"
          disabled
        >
          Import
        </Button>
      </div>

      <div className={css.bottomContainer}>
        {
          Object.keys(data).map((sectionName) => {
            return (
              <Button
                key={sectionName}
                className={css.skipToSectionButton}
                size="small"
                variant="outlined"
                href={`#${sectionName}`}
              >
                ~{upperFirst(sectionName)}
              </Button>
            );
          })
        }
      </div>
    </div>
  );
};

Header.defaultProps = {
  className: css.container,
};

export default Header;

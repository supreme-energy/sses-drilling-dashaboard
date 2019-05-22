import React from "react";
import PropTypes from "prop-types";

import LASAttributePaneBody from "../LASAttributePane/Body";

import css from "./styles.scss";

const Body = ({
                data,
                className,
                highlightedRowAndColumnList,
                textHighlightedRowAndColumnList,
                onClickCell,
              }) => {
  return (
    <div className={className}>
      <div className={css.appAttributePaneBodyContainer}>
      </div>
      <div className={css.lasAttributePaneBodyContainer}>
        <LASAttributePaneBody
          data={data}
          highlightedRowAndColumnList={highlightedRowAndColumnList}
          textHighlightedRowAndColumnList={textHighlightedRowAndColumnList}
          onClickCell={onClickCell}
        />
      </div>
    </div>
  );
};

Body.defaultProps = {
  className: css.container,
  highlightedRowAndColumnList: [],
};

Body.propTypes = {
  data: PropTypes.object.isRequired,
  onClickCell: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.object,
  textHighlightedRowAndColumnList: PropTypes.object,
};

export default Body;

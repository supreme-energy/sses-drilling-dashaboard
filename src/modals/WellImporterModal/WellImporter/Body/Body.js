import React from "react";
import PropTypes from "prop-types";

import LASAttributePaneBody from "../LASAttributePane/Body";

import css from "./styles.scss";

const Body = ({ data, className, highlightedRowAndColumnList, onClickCell, unlocked }) => {
  return (
    <div className={className}>
      <div className={css.appAttributePaneBodyContainer} />
      <div className={css.lasAttributePaneBodyContainer}>
        <LASAttributePaneBody
          data={data}
          highlightedRowAndColumns={highlightedRowAndColumnList}
          onClickCell={onClickCell}
          unlocked={unlocked}
        />
      </div>
    </div>
  );
};

Body.defaultProps = {
  className: css.container,
  highlightedRowAndColumnList: [],
  locked: true
};

Body.propTypes = {
  data: PropTypes.object.isRequired,
  onClickCell: PropTypes.func.isRequired,
  className: PropTypes.string,
  highlightedRowAndColumnList: PropTypes.arrayOf(
    PropTypes.shape({
      rowIndex: PropTypes.number.isRequired,
      columnIndex: PropTypes.number.isRequired
    })
  ),
  unlocked: PropTypes.bool
};

export default Body;

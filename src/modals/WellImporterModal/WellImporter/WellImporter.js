import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Body from "./Body";
import Header from "./Header";
import LAS2Parser from "../../../parsers/las/LAS2Parser";

import css from "./styles.scss";

const WellImporter = ({ files, onClickCancel, onClickCell }) => {
  const [ isLoaded, setIsLoaded ] = useState(false);
  const [ data, setData ] = useState(null);

  useEffect(() => {
    if (!isLoaded && files.length) {
      const parsedData = LAS2Parser.parse(files[ 0 ].fileText);
      setData(parsedData);
      setIsLoaded(true);
    }
  }, [isLoaded, files]);

  if (!files || !files.length || !data) {
    return null;
  }

  return (
    <div className={css.container}>
      <Header data={data} onClickCancel={onClickCancel} />
      <Body data={data} onClickCell={onClickCell} />
    </div>
  );
};

WellImporter.defaultProps = {
  onClickCell: () => {},
};

WellImporter.propTypes = {
  onClickCancel: PropTypes.func.isRequired,
  files: PropTypes.array,
  onClickCell: PropTypes.func,
};

export default WellImporter;

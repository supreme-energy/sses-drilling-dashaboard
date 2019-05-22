import React from "react";
import PropTypes from "prop-types";
import { IconButton, InputBase, Paper } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const Search = ({ onChange, className, iconButtonClassName, inputClassName, placeholder }) => {
  return (
    <Paper className={className} elevation={1}>
      <IconButton className={iconButtonClassName} aria-label="Search">
        <SearchIcon />
      </IconButton>
      <InputBase className={inputClassName} placeholder={placeholder} onChange={onChange} />
    </Paper>
  );
};

Search.propTypes = {
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconButtonClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  placeholder: PropTypes.string
};

Search.defaultProps = {
  className: "",
  iconButtonClassName: "",
  inputClassName: "",
  placeholder: "Search by Well attributes"
};

export default Search;

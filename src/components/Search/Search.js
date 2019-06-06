import React from "react";
import PropTypes from "prop-types";
import { IconButton, InputBase, Paper } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

const Search = ({ onChange, className, iconButtonClassName, inputClassName, placeholder, onClick }) => {
  return (
    <Paper className={className} elevation={1}>
      <IconButton className={iconButtonClassName} aria-label="Search">
        <SearchIcon />
      </IconButton>
      <InputBase
        className={inputClassName}
        placeholder={placeholder}
        onChange={onChange}
        onClick={onClick}
        type="search"
      />
    </Paper>
  );
};

Search.propTypes = {
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconButtonClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  placeholder: PropTypes.string,
  onClick: PropTypes.func
};

Search.defaultProps = {
  className: "",
  iconButtonClassName: "",
  inputClassName: "",
  placeholder: "Search by Well attributes",
  onClick: () => {}
};

export default Search;

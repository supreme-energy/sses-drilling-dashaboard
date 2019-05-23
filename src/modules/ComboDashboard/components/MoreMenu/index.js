import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Menu, IconButton, MenuItem } from "@material-ui/core";
import { CheckCircle, MoreVert } from "@material-ui/icons";
import classNames from "classnames";
import classes from "./MoreMenu.scss";

function MoreMenu({ className, id, selectedMenuItems, setSelectedMenuItem, menuItemEnum, multiSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = useCallback(
    ({ currentTarget: { innerText } }) => {
      const clickedItemText = innerText.toUpperCase();
      if (selectedMenuItems.includes(clickedItemText)) {
        setSelectedMenuItem(selectedMenuItems => selectedMenuItems.filter(item => item !== clickedItemText));
      } else {
        setSelectedMenuItem(selectedMenuItems => [...selectedMenuItems, clickedItemText]);
      }
    },
    [selectedMenuItems, setSelectedMenuItem]
  );

  const handleAnchorEl = useCallback(
    ({ currentTarget }) => {
      setAnchorEl(currentTarget);
    },
    [setAnchorEl]
  );

  const handleMenuClose = useCallback(
    ({ currentTarget }) => {
      setAnchorEl(null);
    },
    [setAnchorEl]
  );

  return (
    <div className={className}>
      <IconButton
        className={classes.menuButton}
        aria-owns={selectedMenuItems.length ? id : undefined}
        aria-haspopup="true"
        onClick={handleAnchorEl}
      >
        <MoreVert />
      </IconButton>
      <Menu id={id} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableAutoFocusItem>
        {menuItemEnum.map((item, index) => {
          const selected = selectedMenuItems.includes(item);
          return (
            <MenuItem
              key={index}
              className={classNames(classes.menuItem, selected ? classes.selectedMenuItem : null)}
              onClick={handleMenuClick}
              onClose={!multiSelect ? handleMenuClose : null}
            >
              {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
              {selected && <CheckCircle className={classes.selectedItemIcon} />}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

MoreMenu.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedMenuItem: PropTypes.func,
  menuItemEnum: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiSelect: PropTypes.bool
};

export default MoreMenu;

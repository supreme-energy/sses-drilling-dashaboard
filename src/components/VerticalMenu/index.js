import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Menu, IconButton, MenuItem } from "@material-ui/core";
import { CheckCircle, MoreVert } from "@material-ui/icons";

import classes from "./VerticalMenu.scss";

function VerticalMenu({ className, id, selectedMenuItems, setSelectedMenuItem, menuItemEnum, multiSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = useCallback(
    ({ currentTarget: { innerText } }) => {
      if (selectedMenuItems.includes(innerText)) {
        setSelectedMenuItem({ type: "REMOVE", payload: innerText });
      } else {
        setSelectedMenuItem({ type: "ADD", payload: innerText });
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

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  return (
    <div className={className}>
      <IconButton className={classes.menuButton} aria-owns={id} aria-haspopup="true" onClick={handleAnchorEl}>
        <MoreVert />
      </IconButton>
      <Menu id={id} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableAutoFocusItem>
        {menuItemEnum.map(item => {
          const selected = selectedMenuItems.includes(item);
          return (
            <MenuItem
              key={item}
              className={classes.menuItem}
              onClick={handleMenuClick}
              onClose={!multiSelect ? handleMenuClose : null}
              selected={selected}
            >
              {item}
              {selected && <CheckCircle className={classes.selectedItemIcon} />}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

VerticalMenu.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedMenuItem: PropTypes.func,
  menuItemEnum: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiSelect: PropTypes.bool
};

export default VerticalMenu;

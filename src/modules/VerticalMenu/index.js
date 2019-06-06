import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Menu, IconButton, MenuItem } from "@material-ui/core";
import { CheckCircle, MoreVert } from "@material-ui/icons";

import classes from "./VerticalMenu.scss";

const VerticalMenu = React.memo(
  ({ className, id, selectedMenuItems, setSelectedMenuItem, menuItemEnum, multiSelect }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuClick = useCallback(
      ({ currentTarget: { innerText } }) => {
        const selectedItem = innerText.toUpperCase();
        if (selectedMenuItems.includes(selectedItem)) {
          setSelectedMenuItem({ type: "REMOVE", payload: selectedItem });
        } else {
          setSelectedMenuItem({ type: "ADD", payload: selectedItem });
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
          {menuItemEnum.map((item, index) => {
            const selected = selectedMenuItems.includes(item);
            return (
              <MenuItem
                key={item}
                className={classes.menuItem}
                onClick={handleMenuClick}
                onClose={!multiSelect ? handleMenuClose : null}
                selected={selected}
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
);

VerticalMenu.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedMenuItem: PropTypes.func,
  menuItemEnum: PropTypes.arrayOf(PropTypes.string).isRequired,
  multiSelect: PropTypes.bool
};

export default VerticalMenu;

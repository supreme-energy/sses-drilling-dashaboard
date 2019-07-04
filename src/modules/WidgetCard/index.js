import React from "react";
import PropTypes from "prop-types";
import { Card } from "@material-ui/core";
import classNames from "classnames";
import VerticalMenu from "../VerticalMenu";
import classes from "./WidgetCard.scss";

function WidgetCard({
  children,
  className,
  selectedMenuItems = [],
  setSelectedMenuItem,
  menuItemEnum = [],
  hideMenu,
  ...props
}) {
  return (
    <Card className={classNames(className, classes.widgetCardContainer)}>
      {!hideMenu && (
        <VerticalMenu
          id="footage-zone-stats-widget-menu"
          className={classes.verticalMenu}
          selectedMenuItems={selectedMenuItems}
          setSelectedMenuItem={setSelectedMenuItem}
          menuItemEnum={menuItemEnum}
          {...props}
        />
      )}
      {children}
    </Card>
  );
}

WidgetCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hideMenu: PropTypes.bool,
  setSelectedMenuItem: PropTypes.func,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  menuItemEnum: PropTypes.arrayOf(PropTypes.string)
};

export default WidgetCard;

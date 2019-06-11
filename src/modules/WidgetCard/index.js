import React from "react";
import PropTypes from "prop-types";
import { Card } from "@material-ui/core";
import classNames from "classnames";
import classes from "./WidgetCard.scss";

function WidgetCard({ children, className }) {
  return <Card className={classNames(className, classes.widgetCardContainer)}>{children}</Card>;
}

WidgetCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

export default WidgetCard;

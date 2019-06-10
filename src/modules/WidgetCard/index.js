import React from "react";
import PropTypes from "prop-types";
import { Card } from "@material-ui/core";
import classes from "./WidgetCard.scss";

function WidgetCard({ children }) {
  return <Card className={classes.widgetCardContainer}>{children}</Card>;
}

WidgetCard.propTypes = {
  children: PropTypes.node
};

export default WidgetCard;

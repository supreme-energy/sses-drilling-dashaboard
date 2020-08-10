import React, { useReducer, useState } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";
import VerticalMenu from "../VerticalMenu";
import classes from "./WidgetCard.scss";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import { useWellIdContainer } from "../../modules/App/Containers";
import { useLocalStorage } from "../../modules/App/localstorers";
export const WidgetTitle = props => <Typography className={classes.widgetTitle} variant="subtitle1" {...props} />;

function WidgetCard({
  children,
  className,
  title,
  selectedMenuItems = [],
  setSelectedMenuItem,
  menuItemEnum = [],
  hideMenu,
  hideCard,
  renderHeader,
  collapsible,
  ...props
}) {
  if (hideCard) {
    return <div className={classNames(className, classes.widgetCardContainer)}>{children}</div>;
  }
  let collapseButton = null;
  let content = children;
  if(collapsible){
	  const { wellId } = useWellIdContainer();
	  let noTitle = title || '';
	  let stateAccessor = wellId + noTitle.replace(/ /g,"_") + "collapse_state";
	  const [expanded, setExpanded] =  useLocalStorage(stateAccessor, 'true');
	  collapseButton = <IconButton
		style={{float: 'left'}}
	    size="small"
	    className={classNames(classes.expand, {
	      [classes.expandOpen]: expanded
	    })}
	    onClick={() => {
	    	let stateAccessor = event.target.parentElement.parentElement.getAttribute('state-accessor')	    	
	    	let cstate = (localStorage.getItem(stateAccessor) == "true" || localStorage.getItem(stateAccessor) == null)
	    	setExpanded(!cstate)
		}}
	    state-accessor={stateAccessor}
	    aria-expanded={expanded}
	    aria-label="Show details"
	  >
	    <ExpandMoreIcon />
	  </IconButton>;
	  content = <Collapse in={expanded} timeout="auto" unmountOnExit>
	    {children}
        </Collapse>;
  }
  return (
    <Card className={classNames(className, classes.widgetCardContainer, classes.shrink)}>
    		  {collapseButton}
		      {renderHeader ? renderHeader() : title ? <WidgetTitle>{title}</WidgetTitle> : null}
		      
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
		      {content}
    </Card>
  );
}

WidgetCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  hideMenu: PropTypes.bool,
  hideCard: PropTypes.bool,
  setSelectedMenuItem: PropTypes.func,
  selectedMenuItems: PropTypes.arrayOf(PropTypes.string),
  menuItemEnum: PropTypes.arrayOf(PropTypes.string),
  renderHeader: PropTypes.func
};

export default WidgetCard;

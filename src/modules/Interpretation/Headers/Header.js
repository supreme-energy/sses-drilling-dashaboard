import React, { useRef, useCallback } from "react";
import css from "./styles.scss";
import { MoreVert, ArrowBack, ArrowForward } from "@material-ui/icons";
import ScalePlotIcon from "../../../assets/scalePlot.svg";
import { ListItem, ListItemIcon, ListItemText, Box, Typography, Popover, IconButton, List } from "@material-ui/core";
import ColorPickerBox from "../../../components/ColorPickerBox";

function LogPopupContent({
  name,
  selectedLogs,
  handleEditScale,
  handleDelete,
  onNextClick,
  onPrevClick,
  color,
  onChangeColor
}) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton aria-label="arrow-back" onClick={onPrevClick}>
          <ArrowBack />
        </IconButton>
        <span>{name}</span>
        <IconButton aria-label="arrow-forward" onClick={onNextClick}>
          <ArrowForward />
        </IconButton>
      </Box>
      <List>
        <ListItem>
          <ListItemIcon>
            <ColorPickerBox hex={color} color={color} handleSave={onChangeColor} />
          </ListItemIcon>
          <ListItemText primary="Edit Style" />
        </ListItem>
        <ListItem button onClick={handleEditScale}>
          <ListItemIcon>
            <img src={ScalePlotIcon} />
          </ListItemIcon>
          <ListItemText primary="Edit Bias and Scale" />
        </ListItem>
      </List>
    </Box>
  );
}

export default function Header({
  color,
  range,
  name,
  logId,
  active,
  onMenuClick,
  menuIcon,
  onClose,
  isActive,
  onNextClick,
  onPrevClick,
  handleEditScale,
  onChangeColor
}) {
  const headerRef = useRef(null);

  const handleChangeColor = useCallback(color => onChangeColor({ color, logId }), [onChangeColor, logId]);
  const editScaleCallback = useCallback(() => handleEditScale(logId), [handleEditScale, logId]);
  return (
    <React.Fragment>
      <Box display="flex" className={css.header}>
        <IconButton size="small" className={css.moreBtn} onClick={onMenuClick}>
          {menuIcon || <MoreVert />}
        </IconButton>
        <Box
          display="flex"
          flex="1"
          ref={headerRef}
          pl={0.5}
          pr={0.5}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ backgroundColor: color }}
        >
          <Typography className={css.headerText} variant="caption">
            {range[0]}
          </Typography>
          <Typography className={css.headerText} variant="caption">
            {name}
          </Typography>
          <Typography className={css.headerText} variant="caption">
            {range[1]}
          </Typography>
        </Box>
      </Box>
      <Popover
        id={open ? "headerPopup" : null}
        open={isActive && headerRef.current}
        anchorEl={headerRef.current}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        <LogPopupContent
          onChangeColor={handleChangeColor}
          color={color}
          onNextClick={onNextClick}
          onPrevClick={onPrevClick}
          name={name}
          handleEditScale={editScaleCallback}
        />
      </Popover>
    </React.Fragment>
  );
}

Header.defaultProps = {
  range: []
};

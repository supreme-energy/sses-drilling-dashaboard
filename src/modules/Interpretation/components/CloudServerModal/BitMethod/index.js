import React from "react";
import { FormControl, Select, MenuItem, InputLabel, IconButton } from "@material-ui/core";
import { useSelectedWellInfoContainer, useWellIdContainer } from "../../../../App/Containers";
import HelpIcon from "../../../../../assets/help_24px.svg";
import Popover from "@material-ui/core/Popover";
import css from "./styles.scss";
import classNames from "classnames";

export default function BitMethod() {
  const [{ wellInfo }, , updateWell] = useSelectedWellInfoContainer();
  const { wellId } = useWellIdContainer();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const value = wellInfo && wellInfo.pterm_method;

  return (
    <FormControl>
      <InputLabel htmlFor="pterm_method">
        <div className="layout horizontal align-center">
          <span className={css.labelText}>Bit Method</span>
          <IconButton size="small" aria-label="Help" onClick={handlePopoverOpen}>
            <img src={HelpIcon} />
          </IconButton>
        </div>
        <Popover
          id="mouse-over-popover"
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center"
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <div className={css.popover}>
            <div className={classNames("layout horizontal", css.topRow)}>
              <div className={css.term}>bit consume</div>
              <span>
                when selected projection stations will not move and when the bit passes the projection station it will
                be consumed and be removed from the target tracker
              </span>
            </div>
            <div className="layout horizontal">
              <div className={css.term}>bit push</div>
              <span>
                when selected projection stations will be pushed forward by the bit projection. As the bit moves with
                newly imported surveys, the VS of the projection stations will change by the amount of VS difference
                between the previous station and the newly imported station. The final station will not be changed and
                as projections pass your final station they will disappear
              </span>
            </div>
          </div>
        </Popover>
      </InputLabel>

      <Select
        value={value}
        className="self-start"
        onChange={e => updateWell({ wellId, field: "pterm_method", value: e.target.value })}
        inputProps={{
          name: "type",
          id: "pterm_method"
        }}
      >
        <MenuItem value={"bc"}>Bit Consume</MenuItem>
        <MenuItem value={"bp"}>Bit Push</MenuItem>
      </Select>
    </FormControl>
  );
}

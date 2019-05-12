import Modal from "@material-ui/core/Modal";
import {withStyles} from "@material-ui/core/styles";
const styles = {
  root: {
    top: 56,
    backgroundColor: "white"
  }
};

export default withStyles(styles, { name: 'MuiModal' })(Modal);

import React from 'react';
import { Button, DialogActions } from "@material-ui/core";

const WellImporter = ({onClose}) => {
  return (
    <React.Fragment>
      <div>Well Importer</div>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </React.Fragment>
  );
};

export default WellImporter;

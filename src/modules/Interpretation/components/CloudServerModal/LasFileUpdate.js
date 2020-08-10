import React, { useCallback, useReducer, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import { useCustomManualImport } from "../../../../api";
import { IMPORT, AUTO } from "../../../../constants/interpretation";
import classNames from "classnames";
import classes from "./styles.scss";

function LasFileUpdate({
	wellId,
	appInfo,
	wellInfo,
	isAutoImportEnabled,
	handleClose,
	interval,
	refresh,
	hasNewSurvey,
	setView
}) {	
	const [survey_file, setSurveyFile] = useState("");
	const [las_file, setLasFile] = useState("");
	const { uploadSurveysFile , uploadMLasFile } = useCustomManualImport();
	const data_survey = new FormData();
	const data_las    = new FormData();
	
	const onClose = () =>{
		handleClose();
	};
	
	const handleSelectFileSurvey = async e =>{
		setSurveyFile(e.target.files[0]);	
	};
	
	const handleSelectFileLas = async e =>{
		setLasFile(e.target.files[0]);		
	};
	
	const handleImport = async () => {
	  const data1 = new FormData();
	  data1.append("file", survey_file)
	  await uploadSurveysFile(wellId, data1);
	  
	  const data2 = new FormData();
	  data2.append("file", las_file);
	  await uploadMLasFile(wellId, data2);
	  
	  setView({ type: IMPORT, payload: AUTO });
	};
	
	return(
		    <React.Fragment>
		      <DialogTitle className={classes.importDialogTitle}>
		        <span>Las Files Updater</span>
		        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
		          <Close />
		        </IconButton>
		      </DialogTitle>
		      <DialogContent className={classes.importDialogContent}>		      	
		          <Box display="flex" flexDirection="column" mb={3}>		            
		            <DialogContentText>
		              Surveys File
		            </DialogContentText>	
		            <input accept=".csv" id="survey-csv-file" type="file" onChange={handleSelectFileSurvey} hidden />
		            <label className={classes.fileUploadButton} htmlFor="survey-csv-file">
		              <Button component="span" color="primary" variant="outlined">
		                Choose File
		              </Button>
		              <span className={classes.fileName}>{survey_file.name}</span>
		            </label>		            
		          </Box>
		          <Box display="flex" flexDirection="column" mb={3}>		            
		            <DialogContentText>
		              Las File
		            </DialogContentText>
	
		            <input accept=".las" id="las-import-file" type="file" onChange={handleSelectFileLas} hidden />
		            <label className={classes.fileUploadButton} htmlFor="las-import-file">
		              <Button component="span" color="primary" variant="outlined">
		                Choose File
		              </Button>
		              <span className={classes.fileName}>{las_file.name}</span>
		            </label>		            
		          </Box>
		      </DialogContent>	
		      <DialogActions className={classes.importDialogActions}>
		        <Button color="primary" onClick={handleClose}>
		          Cancel
		        </Button>
		        <Button onClick={handleImport} variant="contained" color="primary">
		          Import
		        </Button>
		      </DialogActions>
		    </React.Fragment>
			);
}

LasFileUpdate.propTypes = {
  wellId: PropTypes.string,
  wellInfo: PropTypes.object,
  appInfo: PropTypes.object,
  isAutoImportEnabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  interval: PropTypes.number,
  refresh: PropTypes.func,
  hasNewSurvey: PropTypes.bool,
  setView: PropTypes.func
}
export default LasFileUpdate;
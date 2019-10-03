import React from "react";
import { Box } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import css from "../Interpretation.scss";
import classNames from "classnames";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

function CheckItem({ done, children }) {
  return <li className={classNames({ [css.stepDone]: done })}>{children}</li>;
}

export default withRouter(
  ({
    wellPlanIsImported,
    controlLogIsImported,
    propAzmAndProjDipAreSet,
    tieInIsCompleted,
    formationsAreCompleted,
    surveyDataIsImported,
    match: { url }
  }) => {
    return (
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" pl={3}>
          <Typography variant="subtitle2">Set Up Structural Guidance</Typography>
        </Box>
        <Box display="flex" flexDirection="row">
          <Box flexDirection="column">
            <Typography component={"div"} variant="body2">
              <ol>
                <CheckItem done={wellPlanIsImported}>
                  Import the <Link to={`${url}/detailsTable`}>Well Plan</Link>
                </CheckItem>
                <CheckItem done={controlLogIsImported}>Import a Control Log with Gamma</CheckItem>
                <CheckItem done={propAzmAndProjDipAreSet}>Set Proposed Direction &amp; Projection Dip </CheckItem>
                <CheckItem done={tieInIsCompleted}>Specify Tie-In data (including TCL)</CheckItem>
                <CheckItem done={formationsAreCompleted}>Specify the Formation Tops</CheckItem>
                <CheckItem done={surveyDataIsImported}>Import first Hang-off Survey data </CheckItem>
              </ol>
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

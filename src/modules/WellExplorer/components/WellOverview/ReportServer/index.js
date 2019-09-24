import React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import ReportMailingList from "./ReportMailList";
import OutgoingServer from "./OutgoingServer";

function ReportServer({ wellId }) {
  return (
    <div>
      <Box display="flex" flexDirection="column" flex={1} p={1}>
        <OutgoingServer wellId={wellId} />
        <ReportMailingList wellId={wellId} />
      </Box>
    </div>
  );
}

ReportServer.propTypes = {
  wellId: PropTypes.string
};

export default ReportServer;

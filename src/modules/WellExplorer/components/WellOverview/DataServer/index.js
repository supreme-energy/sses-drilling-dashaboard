import React from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import ServerInfo from "./ServerInfo";
import Notifications from "./Notifications";

function DataServer({ wellId }) {
  return (
    <div>
      <Box display="flex" flexDirection="column" flex={1} p={1}>
        <ServerInfo wellId={wellId} />
        <Notifications wellId={wellId} />
      </Box>
    </div>
  );
}

DataServer.propTypes = {
  wellId: PropTypes.string
};

export default DataServer;

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import ReportMailingList from "./ReportMailList";
import OutgoingServer from "./OutgoingServer";
import { useWellInfo } from "../../../../../api";

// TODO: IF only used by ReportMailList, move there
const MailingListData = [
  {
    personnel: "Expero",
    name: "Keith Smith",
    email_address: "ksmith@gmail.com",
    phone: "555-555-5555",
    reports: 3
  },
  {
    personnel: "Client",
    name: "Kevin Jones",
    email_address: "jones@gmail.com",
    phone: "668-142-5543",
    reports: 7
  }
];

function ReportServer({ wellId }) {
  // TODO: If only used by OutgoingServer, move to that file
  const [data, , , refreshFetchStore, updateEmail] = useWellInfo(wellId);
  const emailInfo = data.emailInfo || {};

  // TODO: If handler only used for Outgoing Server, move to file
  const onServerFieldChange = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateEmail({ wellId, field, value });
      if (shouldRefreshStore) {
        refreshFetchStore();
      }
    },
    [updateEmail, wellId, refreshFetchStore]
  );

  const onFieldChange = useCallback(
    async (field, value, shouldRefreshStore) => {
      // await updateEmail({ wellId, field, value });
      if (shouldRefreshStore) {
        refreshFetchStore();
      }
    },
    [refreshFetchStore]
  );
  return (
    <div>
      <Box display="flex" flexDirection="column" flex={1} p={1}>
        <OutgoingServer emailInfo={emailInfo} onChange={onServerFieldChange} />
        <ReportMailingList mailListData={MailingListData} onChange={onFieldChange} />
      </Box>
    </div>
  );
}

ReportServer.propTypes = {
  wellId: PropTypes.string
};

export default ReportServer;

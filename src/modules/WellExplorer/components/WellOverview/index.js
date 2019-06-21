import React, { useState } from "react";
import { Card } from "@material-ui/core";
import OverivewKpi from "./OverviewKpi";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { withRouter } from "react-router-dom";
import Overview from "./Overview";
import WellInfo from "./WellInfo";
import classNames from "classnames";

function WellOverivew({ className, well, match, history, updateFavorite, onFilesToImportChange }) {
  const [currentTab, changeCurrentTab] = useState("overview");
  const onTabChange = (_, value) => {
    changeCurrentTab(value);
  };

  return (
    <Card className={classNames(className, "layout vertical")}>
      {well && (
        <OverivewKpi well={well} updateFavorite={updateFavorite} onFilesToImportChange={onFilesToImportChange} />
      )}
      <Tabs value={currentTab} indicatorColor="primary" onChange={onTabChange}>
        <Tab value="overview" label="Well Overview" />
        <Tab value="info" label="Well Info" />
        <Tab value="data" label="Offset Well Data" onChange={onTabChange} />
        <Tab value="report-server" label="Report Server" onChange={onTabChange} />
        <Tab value="data-server" label="Data Server" onChange={onTabChange} />
      </Tabs>
      <React.Fragment>
        {currentTab === "overview" && <Overview />}
        {currentTab === "info" && <WellInfo wellId={well.id} />}
      </React.Fragment>
    </Card>
  );
}

export default withRouter(WellOverivew);

import React, { useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Bit from "./Bit";
import ProjectionToPlan from "./ProjectionToPlan";
import WidgetCard from "../../../../components/WidgetCard";
import classes from "./styles.scss";

export function Projections({ wellId }) {
  const [tab, setTab] = useState(0);
  const handleTabChange = (_, newValue) => setTab(newValue);

  return (
    <WidgetCard title="Projection" hideMenu>
      <Tabs className={classes.tabs} value={tab} onChange={handleTabChange}>
        <Tab className={classes.tab} label="BIT" />
        <Tab className={classes.tab} label="PROJECTION TO PLAN" />
      </Tabs>
      {tab === 0 && <Bit wellId={wellId} />}
      {tab === 1 && <ProjectionToPlan wellId={wellId} />}
    </WidgetCard>
  );
}

Projections.propTypes = {
  wellId: PropTypes.string
};

export default Projections;

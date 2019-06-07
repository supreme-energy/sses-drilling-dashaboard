import React, { useEffect } from "react";
import TextField from "../../../../../components/TextField";
import Title from "../../../../../components/Title";
import classes from "./styles.scss";
import classNames from "classNames";
import { useWellInfo } from "../../../../../api";

const generalFields = [
  { label: "Well", property: "wellborename" },
  { label: "Operator", property: "operatorname" },
  { label: "Rig", property: "rigid" },
  { label: "Job Number", property: "jobnumber" },
  { label: "Directional", property: "directionalname" },
  { label: "API/AFE/UWI", property: "wellid" }
];

const locationFields = [
  { label: "Field", property: "field" },
  { label: "Location", property: "location" },
  { label: "State or Province", property: "stateprov" },
  { label: "County", property: "county" },
  { label: "Country", property: "country" }
];

const FieldsList = ({ wellInfo, fields }) => (
  <React.Fragment>
    {fields.map(f => (
      <TextField key={f.property} variant="filled" label={f.label} value={wellInfo[f.property]} fullWidth />
    ))}
  </React.Fragment>
);

const GeneralInfo = ({ wellInfo }) => {
  return (
    <div className="layout vertical">
      <FieldsList fields={generalFields} wellInfo={wellInfo} />
    </div>
  );
};

const LocationFields = ({ wellInfo }) => {
  return (
    <div className="layout vertical">
      <Title>Location Info</Title>
      <FieldsList fields={locationFields} wellInfo={wellInfo} />
    </div>
  );
};

export default function WellInfo({ wellId }) {
  const [data, _, updateWell] = useWellInfo(wellId);
  const wellInfo = data.wellInfo || {};

  useEffect(() => {
    updateWell({ wellId, field: "wellborename", value: "Test Db" });
  }, [wellId, updateWell]);
  return (
    <div className={classNames("layout horizontal flex", classes.root)}>
      <div className="layout vertical flex">
        <GeneralInfo wellInfo={wellInfo} />
        <LocationFields wellInfo={wellInfo} />
      </div>
      <div className="flex-2">
        <Title>Geospatial Info</Title>
      </div>
    </div>
  );
}

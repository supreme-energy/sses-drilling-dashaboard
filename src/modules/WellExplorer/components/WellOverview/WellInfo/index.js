import React, { useCallback } from "react";

import Title from "../../../../../components/Title";
import classes from "./styles.scss";
import classNames from "classNames";
import { useWellInfo } from "../../../../../api";
import DebouncedTextField from "../../../../../components/DebouncedTextField";

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

const FieldsList = ({ wellInfo, fields, onChange }) => (
  <React.Fragment>
    {fields.map(f => (
      <DebouncedTextField
        key={f.property}
        variant="filled"
        label={f.label}
        value={wellInfo[f.property]}
        fullWidth
        onChange={value => onChange(f.property, value)}
      />
    ))}
  </React.Fragment>
);

const GeneralInfo = props => {
  return (
    <div className="layout vertical">
      <FieldsList fields={generalFields} {...props} />
    </div>
  );
};

const LocationFields = props => {
  return (
    <div className="layout vertical">
      <Title>Location Info</Title>
      <FieldsList fields={locationFields} {...props} />
    </div>
  );
};

export default function WellInfo({ wellId }) {
  const [data, _, updateWell] = useWellInfo(wellId);
  const wellInfo = data.wellInfo || {};

  // useEffect(() => {
  //   updateWell({ wellId, field: "wellborename", value: "Test Db" });
  // }, [wellId, updateWell]);

  const onFieldChange = useCallback(
    (field, value) => {
      updateWell({ wellId, field, value });
    },
    [updateWell, wellId]
  );
  return (
    <div className={classNames("layout horizontal flex", classes.root)}>
      <div className="layout vertical flex">
        <GeneralInfo wellInfo={wellInfo} onChange={onFieldChange} />
        <LocationFields wellInfo={wellInfo} onChange={onFieldChange} />
      </div>
      <div className="flex-2">
        <Title>Geospatial Info</Title>
      </div>
    </div>
  );
}

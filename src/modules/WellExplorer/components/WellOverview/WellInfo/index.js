import React, { useCallback } from "react";

import Title from "../../../../../components/Title";
import classes from "./styles.scss";

import { useWellInfo } from "../../../../../api";
import { DebouncedTextField, NumericDebouceTextField } from "../../../../../components/DebouncedInputs";
import { KeyboardDatePicker } from "@material-ui/pickers";
import moment from "moment";
import useMemo from "react-powertools/hooks/useMemo";
import { Typography } from "@material-ui/core";
import WellMapPlot from "../WellMapPlot";
import Box from "@material-ui/core/Box";
import PointIcon from "./PointIcon";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

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
  const startDate = useMemo(() => moment(props.wellInfo.startdate || Date.now()), [props.wellInfo.startdate]);
  const endDate = useMemo(() => moment(props.wellInfo.enddate || Date.now()), [props.wellInfo.enddate]);
  return (
    <Box display="flex" flexDirection="column" mb={2}>
      <FieldsList fields={generalFields} {...props} />
      <Box display="flex" flexDirection="row" mt={1}>
        <KeyboardDatePicker
          label="Start Date"
          value={startDate}
          format="YYYY-MM-DD"
          onChange={value => props.onChange("startdate", value.format())}
          animateYearScrolling
        />
        <KeyboardDatePicker
          label="End Date"
          value={endDate}
          format="YYYY-MM-DD"
          onChange={value => props.onChange("enddate", value.format())}
          animateYearScrolling
        />
      </Box>
    </Box>
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

const PoistionField = ({ iconFill, ...props }) => {
  return (
    <Box display="flex" flexDirection="row" mb={1}>
      <PointIcon fill={iconFill} />
      <DebouncedTextField {...props} />
    </Box>
  );
};

const PositionLabel = ({ iconFill, children }) => {
  return (
    <Box className={classes.positionLabel} display="flex" flexDirection="row" mb={1}>
      <PointIcon fill={iconFill} />
      <Typography variant="subtitle1" className={classes.label}>
        {children}
      </Typography>
    </Box>
  );
};

function RadioGroupList({ value, onChange, data, groupName, groupLabel }) {
  return (
    <FormControl component="fieldset" className={classes.groupFormControl}>
      <FormLabel component="legend">{groupLabel}</FormLabel>
      <RadioGroup
        aria-label={groupLabel}
        name={groupName}
        className={classes.group}
        value={value}
        onChange={e => {
          onChange(e.target.value);
        }}
      >
        {data.map(d => (
          <FormControlLabel
            key={d.value}
            value={d.value}
            control={<Radio color="secondary" />}
            label={d.label}
            checked={value === d.value}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

RadioGroupList.defaultProps = {
  value: ""
};

const coordSystemData = [{ label: "Cartesian", value: "Cartesian" }, { label: "Polar", value: "Polar" }];
const correctionData = [{ label: "Grid", value: "Grid" }, { label: "True North", value: "True North" }];

function GeospatialInfo({ wellInfo, onChange, surfaceLocation, transform }) {
  return (
    <Box display="flex" flexDirection="column" flexGrow={2}>
      <Title>Geospatial Info</Title>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" mr={1} flex={1}>
          <PoistionField
            variant="filled"
            iconFill={"#FB00FF"}
            label={"Latitude"}
            classes={{ root: classes.positionTextField }}
            InputProps={{ className: classes.positionTextField, readOnly: true }}
            value={surfaceLocation.x}
            fullWidth
            onChange={value => {
              if (transform) {
                const [easting] = transform(null).inverse([Number(value), Number(surfaceLocation.y)]);
                onChange("survey_easting", easting, true);
              }
            }}
          />
          <PositionLabel iconFill="#1AA4FF">Surface Location</PositionLabel>

          <Box display="flex" flexDirection="row" mb={1}>
            <NumericDebouceTextField
              variant="filled"
              label={"Easting (X)"}
              classes={{ root: classes.surfaceTextField }}
              InputProps={{ className: classes.surfaceTextField }}
              value={wellInfo.survey_easting}
              fullWidth
              onChange={value => onChange("survey_easting", value, true)}
            />
            <NumericDebouceTextField
              variant="filled"
              label={"Northing (Y)"}
              classes={{ root: classes.surfaceTextField }}
              InputProps={{ className: classes.surfaceTextField }}
              value={wellInfo.survey_northing}
              fullWidth
              onChange={value => onChange("survey_northing", value, true)}
            />
          </Box>
          <PositionLabel iconFill="#75BA03">Landing Point</PositionLabel>
          <Box display="flex" flexDirection="row" mb={1}>
            <NumericDebouceTextField
              variant="filled"
              label={"Easting (X)"}
              classes={{ root: classes.landingField }}
              InputProps={{ className: classes.landingField }}
              value={wellInfo.landing_easting}
              fullWidth
              onChange={value => onChange("landing_easting", value, true)}
            />
            <NumericDebouceTextField
              variant="filled"
              label={"Northing (Y)"}
              value={wellInfo.landing_northing}
              classes={{ root: classes.landingField }}
              InputProps={{ className: classes.landingField }}
              fullWidth
              onChange={value => onChange("landing_northing", value, true)}
            />
          </Box>
          <PositionLabel iconFill="#AD00DF">Proposed Bottom Hole Location</PositionLabel>
          <Box display="flex" flexDirection="row" mb={1}>
            <NumericDebouceTextField
              variant="filled"
              label={"Easting (X)"}
              value={wellInfo.pbhl_easting}
              classes={{ root: classes.positionTextField }}
              InputProps={{ className: classes.positionTextField }}
              fullWidth
              onChange={value => onChange("pbhl_easting", value, true)}
            />
            <NumericDebouceTextField
              variant="filled"
              label={"Northing (Y)"}
              value={wellInfo.pbhl_northing}
              classes={{ root: classes.positionTextField }}
              InputProps={{ className: classes.positionTextField }}
              fullWidth
              onChange={value => {
                onChange("pbhl_northing", value, true);
              }}
            />
          </Box>
          <RadioGroupList
            groupLabel="Correction"
            groupName={"correction"}
            value={wellInfo.correction}
            onChange={value => {
              onChange("correction", value);
            }}
            data={correctionData}
          />
          <RadioGroupList
            groupLabel="Coordinate System"
            groupName={"coordinateSystem"}
            value={wellInfo.coordsys}
            onChange={value => {
              onChange("coordsys", value);
            }}
            data={coordSystemData}
          />
        </Box>

        <Box display="flex" flexDirection="column" flex={1}>
          <NumericDebouceTextField
            variant="filled"
            label={"Longitude"}
            classes={{ root: classes.positionTextField }}
            InputProps={{ className: classes.positionTextField, readOnly: true }}
            value={surfaceLocation.y}
            fullWidth
            onChange={value => onChange("survey_northing", value, true)}
          />
          <WellMapPlot className={classes.map} showLegend={false} />
          <Typography variant="subtitle1" className={classes.label}>
            Elevations
          </Typography>
          <NumericDebouceTextField
            variant="filled"
            label={"Kelly Bushing (RKB)"}
            value={wellInfo.elev_rkb}
            fullWidth
            onChange={value => onChange("elev_rkb", value)}
          />
          <NumericDebouceTextField
            variant="filled"
            label={"Ground"}
            value={wellInfo.elev_ground}
            fullWidth
            onChange={value => onChange("elev_ground", value)}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function WellInfo({ wellId }) {
  const [data, , updateWell, refreshFetchStore] = useWellInfo(wellId);
  const wellInfo = data.wellInfo || {};
  const surfaceLocation = data.wellSurfaceLocation || {};
  const transform = data.transform;

  const onFieldChange = useCallback(
    async (field, value, shouldRefreshStore) => {
      await updateWell({ wellId, data: { [field]: value } });
      if (shouldRefreshStore) {
        refreshFetchStore();
      }
    },
    [updateWell, wellId, refreshFetchStore]
  );
  return (
    <Box className={classes.root} display="flex" flexDirection="row" flex={1} p={1}>
      <Box display="flex" flexDirection="column" mr={1}>
        <GeneralInfo wellInfo={wellInfo} onChange={onFieldChange} />
        <LocationFields wellInfo={wellInfo} onChange={onFieldChange} />
      </Box>

      <GeospatialInfo
        wellInfo={wellInfo}
        surfaceLocation={surfaceLocation}
        transform={transform}
        onChange={onFieldChange}
      />
    </Box>
  );
}

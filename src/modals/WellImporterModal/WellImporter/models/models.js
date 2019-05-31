import cloneDeep from "lodash/cloneDeep";

export const defaultFieldModel = { value: "" };

export const defaultWellInfoModel = {
  well: cloneDeep(defaultFieldModel),
  operator: cloneDeep(defaultFieldModel),
  rigId: cloneDeep(defaultFieldModel),
  jobNumber: cloneDeep(defaultFieldModel),
  api: cloneDeep(defaultFieldModel), // This well id can either be API for the US or UWI for locations in Canada.
  field: cloneDeep(defaultFieldModel),
  location: cloneDeep(defaultFieldModel),
  state: cloneDeep(defaultFieldModel), // Province is used for canada (this is obvious but wanted to keep track)
  county: cloneDeep(defaultFieldModel),
  country: cloneDeep(defaultFieldModel)
};

export const defaultWellParametersModel = {
  latitude: cloneDeep(defaultFieldModel),
  longitude: cloneDeep(defaultFieldModel)
};

export const defaultWellDataModel = {
  gamma: cloneDeep(defaultFieldModel)
};

export const defaultAppAttributesModel = {
  wellInfo: defaultWellInfoModel,
  wellParameters: defaultWellParametersModel,
  wellData: defaultWellDataModel
};

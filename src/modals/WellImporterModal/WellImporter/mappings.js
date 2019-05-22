export const wellInfoFieldMapping = {
  well: {
    labelName: "Well",
    required: true,
    predictedFieldName: "", // field name to be used when importing new well, we guess that it is associated with this
    // field
    index: 0
  },
  operator: {
    labelName: "Operator",
    required: true,
    index: 1
  },
  rigId: {
    labelName: "Rig Id",
    index: 2
  },
  jobNumber: {
    labelName: "Job Number",
    index: 3
  },
  api: {
    labelName: "API or UWI",
    required: true,
    index: 4
  },
  field: {
    labelName: "Field",
    required: true,
    index: 5
  },
  location: {
    labelName: "Location",
    required: true,
    index: 6
  },
  state: {
    labelName: "State or Province",
    required: true,
    index: 7
  },
  county: {
    labelName: "County",
    required: true,
    index: 8
  },
  country: {
    labelName: "Country",
    required: true,
    index: 9
  }
};

export const sectionMapping = {
  wellInfo: {
    labelName: "Well Info"
  },
  wellParameters: {
    labelName: "Well Parameters"
  },
  wellData: {
    labelName: "Well Data"
  }
};

export const wellParametersFieldMapping = {
  longitude: {
    labelName: "Longitude",
    required: true,
    index: 0
  },
  latitude: {
    labelName: "Latitude",
    required: ["Well Data"],
    index: 1
  }
};

export const wellDataFieldMapping = {
  gamma: {
    labelName: "Gamma",
    required: true,
    index: 0,
    type: "column"
  }
};

export const appAttributesFieldMapping = {
  wellInfo: wellInfoFieldMapping,
  wellParameters: wellParametersFieldMapping,
  wellData: wellDataFieldMapping
};

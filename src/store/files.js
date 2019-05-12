export const ADD_FILE = "ADD_FILE";

export const addFile = (file) => async (dispatch) => {
  const reader = new FileReader();
  const text = await new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsText(file);
  });

  dispatch({
    type: ADD_FILE,
    fileInfo: {
      id: file.name,
      file: file,
      fileText: text,
    }
  });
};

const HANDLERS = {
  [ ADD_FILE ]: (state, action) => {
    return {
      ...state,
      files: [ action.file ],
    };
  },
};

const initialState = {
  files: []
};

const reducer = (state = initialState, action) => {
  const handler = HANDLERS[ action.type ];

  return handler ? handler(state, action) : state;
};

export default reducer;

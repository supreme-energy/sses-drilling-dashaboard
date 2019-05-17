export const ADD_FILE = "ADD_FILE";
export const ADD_FILE_ERROR = "ADD_FILE_ERROR";

export const addFile = (file) => async (dispatch) => {
  const reader = new FileReader();
  let text = null;
  try {
    text = await new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });

    if (text) {
      dispatch({
        type: ADD_FILE,
        fileInfo: {
          id: file.name,
          file: file,
          fileText: text,
        }
      });
    }
  } catch (error) {
    dispatch({
      type: ADD_FILE_ERROR,
      error,
    });
  }
};

const HANDLERS = {
  [ ADD_FILE ]: (state, action) => {
    return {
      ...state,
      error: null,
      files: [ action.fileInfo ],
    };
  },
  [ ADD_FILE_ERROR ]: (state, action) => {
    return {
      ...state,
      error: [ action.error ],
    };
  },
};

const initialState = {
  files: [],
  error: null
};

const reducer = (state = initialState, action) => {
  const handler = HANDLERS[ action.type ];

  return handler ? handler(state, action) : state;
};

export default reducer;

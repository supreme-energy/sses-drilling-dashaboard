import { useLocalStorageReducer } from "react-storage-hooks";
const defaultView = { x: 0, y: 0, xScale: 1, yScale: 1 };
export const useViewportView = ({ wellId, key }) => {
  return useLocalStorageReducer(
    `${wellId}${key}`,
    function(state, arg) {
      if (typeof arg === "function") {
        return { ...state, ...arg(state) };
      }
      return { ...state, ...arg };
    },
    defaultView
  );
};

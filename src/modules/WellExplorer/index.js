import WellExplorer from "./containers/WellExplorerContainer";
import reducer from "./store";
import { injectReducer } from "../../store/reducers";

export default function(store) {
  injectReducer(store, reducer);
  return WellExplorer;
}

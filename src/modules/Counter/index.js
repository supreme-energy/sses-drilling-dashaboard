import { injectReducer } from 'store/reducers';
import reducer from './store';
import Counter from './containers/CounterContainer';

export default function (store) {
  injectReducer(store, reducer);

  return Counter;
}

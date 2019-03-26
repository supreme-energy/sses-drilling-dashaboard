import { lazy } from 'react' 

const WellExplorer = lazy(() => import(/* webpackChunkName: 'WellExplorer' */'../components/WellExplorer'));

export default WellExplorer;

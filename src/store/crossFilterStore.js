import crossfilter from 'crossfilter2';
import crossSectionData from '../data/crossSection.json';

const csFiltered = crossfilter(crossSectionData);

export default {
    'cross-section': {
        GET: (path, { query }) => {}
    }
};

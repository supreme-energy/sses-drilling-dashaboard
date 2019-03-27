import crossfilter from 'crossfilter2';
import crossSectionData from '../data/crossSection.json';

const csFiltered = crossfilter(crossSectionData);

const getLatestCrossSection= () => {
    return csFiltered;
};

export default {
    'cross-section': {
        GET: (path, { query }) => {
            return getLatestCrossSection;
        }
    }
};

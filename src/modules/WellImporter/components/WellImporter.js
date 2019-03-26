import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import Progress from '@material-ui/core/CircularProgress'

export const WellImporter = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: '0 auto' }} >
    <h2>WellImporter</h2>
  </div>
  </Suspense>
);
WellImporter.propTypes = {};

export default WellImporter;

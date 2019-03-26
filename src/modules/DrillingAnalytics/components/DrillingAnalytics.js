import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import Progress from '@material-ui/core/CircularProgress'

export const DrillingAnalytics = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: '0 auto' }} >
      <h2>DrillingAnalytics</h2>
      </div>
  </Suspense>
);
DrillingAnalytics.propTypes = {};

export default DrillingAnalytics;

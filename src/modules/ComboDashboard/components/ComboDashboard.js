import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import Progress from '@material-ui/core/CircularProgress'

export const ComboDashboard = () => (
  <Suspense fallback={<Progress />}>
    <div style={{ margin: '0 auto' }} >
      <h2>ComboDashboard</h2>
    </div>
  </Suspense>
);
ComboDashboard.propTypes = {};

export default ComboDashboard;

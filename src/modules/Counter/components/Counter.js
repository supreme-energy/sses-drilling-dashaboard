import React from 'react';
import PropTypes from 'prop-types';

export const Counter = ({ counter, increment, doubleAsync, square }) => (
  <div style={{ margin: '0 auto' }} >
    <h2>Counter: {counter} (Squared: {square.result ? square.result.num : square.error ? square.error.message : "..."})</h2>
    <button className="btn btn-primary" onClick={increment}>
      Increment
    </button>
    {' '}
    <button className="btn btn-secondary" onClick={doubleAsync}>
      Double (Async)
    </button>
  </div>
);
Counter.propTypes = {
  counter: PropTypes.number.isRequired,
  increment: PropTypes.func.isRequired,
  doubleAsync: PropTypes.func.isRequired,
  square: PropTypes.object.isRequired,
};

export default Counter;

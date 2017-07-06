import PropTypes from 'prop-types';
import {getIsAuthenticated} from './store';
import connect from 'react-redux';

/**
 * Renders the children only if the user is unauthenticated
 */
export const Unauthenticated = ({isAuthenticated, children}) => !isAuthenticated && children;

Unauthenticated.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: getIsAuthenticated(state),
  };
}

export default connect(mapStateToProps)(Unauthenticated);

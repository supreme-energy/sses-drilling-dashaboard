import PropTypes from 'prop-types';
import {getIsAuthenticated, connectOptions} from './store';
import connect from 'react-redux';

/**
 * Renders the children only if the user is authenticated
 */
export const Authenticated = ({isAuthenticated, children}) => isAuthenticated && children;

Authenticated.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: getIsAuthenticated(state),
  };
}

export default connect(mapStateToProps, undefined, undefined, connectOptions)(Authenticated);

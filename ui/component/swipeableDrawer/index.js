import { connect } from 'react-redux';
import SwipeableDrawer from './view';
import { selectTheme } from 'redux/selectors/settings';
import { selectMobilePlayerDimensions } from 'redux/selectors/app';
import { doSetMobilePlayerDimensions } from 'redux/actions/app';

const select = (state) => ({
  theme: selectTheme(state),
  mobilePlayerDimensions: selectMobilePlayerDimensions(state),
});

const perform = {
  doSetMobilePlayerDimensions,
};

export default connect(select, perform)(SwipeableDrawer);

import { connect } from 'react-redux';
import { selectActiveChannelStakedLevel } from 'redux/selectors/app';
import { doClearClaimSearch } from 'redux/actions/claims';
import { doClearPurchasedUriSuccess } from 'redux/actions/file';
import { selectUserVerifiedEmail, selectUser } from 'redux/selectors/user';
import { selectHomepageData, selectWildWestDisabled } from 'redux/selectors/settings';
import { doSignOut } from 'redux/actions/app';
import { selectUnseenNotificationCount } from 'redux/selectors/notifications';
import { selectPurchaseUriSuccess } from 'redux/selectors/claims';

import SideNavigation from './view';

const select = (state) => ({
  email: selectUserVerifiedEmail(state),
  purchaseSuccess: selectPurchaseUriSuccess(state),
  unseenCount: selectUnseenNotificationCount(state),
  user: selectUser(state),
  homepageData: selectHomepageData(state),
  activeChannelStakedLevel: selectActiveChannelStakedLevel(state),
  wildWestDisabled: selectWildWestDisabled(state),
});

const perform = {
  doClearClaimSearch,
  doSignOut,
  doClearPurchasedUriSuccess,
};

export default connect(select, perform)(SideNavigation);

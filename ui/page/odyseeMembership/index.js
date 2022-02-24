import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import OdyseeMembership from './view';
import { selectActiveChannelClaim, selectIncognito } from 'redux/selectors/app';
import { selectMyChannelClaims, selectClaimsByUri } from 'redux/selectors/claims';
import { doFetchUserMemberships } from 'redux/actions/user';
import { selectOdyseeMembershipByUri } from 'redux/selectors/user';

const select = (state) => {
  const activeChannelClaim = selectActiveChannelClaim(state);
  const uri = activeChannelClaim && activeChannelClaim.permanent_url;

  return {
    activeChannelClaim,
    channels: selectMyChannelClaims(state),
    claimsByUri: selectClaimsByUri(state),
    selectOdyseeMembershipByUri: selectOdyseeMembershipByUri(state, uri),
    incognito: selectIncognito(state),
  };
};

const perform = {
  openModal: doOpenModal,
  doFetchUserMemberships,
};

export default connect(select, perform)(OdyseeMembership);

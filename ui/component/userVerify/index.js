import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import { doUserIdentityVerify, doUserFetch } from 'redux/actions/user';
import { selectIdentityVerifyIsPending, selectIdentityVerifyErrorMessage } from 'redux/selectors/user';
import { selectLanguage } from 'redux/selectors/settings';
import * as MODALS from 'constants/modal_types';
import UserVerify from './view';

const select = (state) => ({
  errorMessage: selectIdentityVerifyErrorMessage(state),
  isPending: selectIdentityVerifyIsPending(state),
  language: selectLanguage(state),
});

const perform = (dispatch) => ({
  fetchUser: () => dispatch(doUserFetch()),
  verifyPhone: () => dispatch(doOpenModal(MODALS.PHONE_COLLECTION)),
  verifyUserIdentity: (token) => dispatch(doUserIdentityVerify(token)),
});

export default connect(select, perform)(UserVerify);

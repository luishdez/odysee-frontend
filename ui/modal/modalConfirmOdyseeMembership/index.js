import { connect } from 'react-redux';
import { doHideModal } from 'redux/actions/app';
import ModalConfirmOdyseeMembership from './view';

const select = (state) => ({});

const perform = (dispatch) => ({
  closeModal: () => dispatch(doHideModal()),
});

export default connect(select, perform)(ModalConfirmOdyseeMembership);

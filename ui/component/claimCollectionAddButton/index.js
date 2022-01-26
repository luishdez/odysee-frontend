import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import CollectionAddButton from './view';
import { selectClaimForUri } from 'redux/selectors/claims';
import { makeSelectClaimUrlInCollection } from 'redux/selectors/collections';

const select = (state, props) => {
  const { uri } = props;

  const claim = selectClaimForUri(state, uri);
  const permanentUrl = claim && claim.permanent_url;
  const streamType = (claim && claim.value && claim.value.stream_type) || '';

  return {
    streamType,
    isSaved: makeSelectClaimUrlInCollection(permanentUrl)(state),
  };
};

const perform = {
  doOpenModal,
};

export default connect(select, perform)(CollectionAddButton);

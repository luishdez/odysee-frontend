import { connect } from 'react-redux';
import { selectSubscriptions } from 'redux/selectors/subscriptions';
import SubscriptionSection from './view';

const select = (state) => ({
  subscriptions: selectSubscriptions(state),
});

export default connect(select)(SubscriptionSection);

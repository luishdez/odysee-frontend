import { connect } from 'react-redux';
import { selectLanguage } from 'redux/selectors/settings';
import HelpPage from './view';

const select = (state) => ({
  language: selectLanguage(state),
});

export default connect(select)(HelpPage);

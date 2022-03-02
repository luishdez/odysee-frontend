// @flow
import { SIDEBAR_SUBS_DISPLAYED } from 'constants/subscriptions';
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import Button from 'component/button';
import ChannelThumbnail from 'component/channelThumbnail';
import ClaimPreviewTitle from 'component/claimPreviewTitle';
import DebouncedInput from 'component/common/debounced-input';
import React from 'react';

type Props = {
  showSection: boolean,
  // redux
  subscriptions: Array<Subscription>,
};

export default function SubscriptionSection(props: Props) {
  const { showSection, subscriptions } = props;

  const [subscriptionFilter, setSubscriptionFilter] = React.useState('');

  if (!showSection || !subscriptions || !(subscriptions.length > 0)) return null;

  let displayedSubscriptions;
  if (subscriptionFilter) {
    const filter = subscriptionFilter.toLowerCase();
    displayedSubscriptions = subscriptions.filter((sub) => sub.channelName.toLowerCase().includes(filter));
  } else {
    displayedSubscriptions = subscriptions.slice(0, SIDEBAR_SUBS_DISPLAYED);
  }

  return (
    <ul className="navigation__secondary navigation-links">
      {subscriptions.length > SIDEBAR_SUBS_DISPLAYED && (
        <li className="navigation-item">
          <DebouncedInput icon={ICONS.SEARCH} placeholder={__('Filter')} onChange={setSubscriptionFilter} />
        </li>
      )}

      {displayedSubscriptions.map((subscription) => (
        <SubscriptionListItem key={subscription.uri} subscription={subscription} />
      ))}

      {!!subscriptionFilter && !displayedSubscriptions.length && (
        <li>
          <div className="navigation-item">
            <div className="empty empty--centered">{__('No results')}</div>
          </div>
        </li>
      )}

      {!subscriptionFilter && (
        <Button
          key="showMore"
          label={__('Manage')}
          className="navigation-link"
          navigate={`/$/${PAGES.CHANNELS_FOLLOWING_MANAGE}`}
        />
      )}
    </ul>
  );
}

type ItemProps = {
  subscription: Subscription,
};

const SubscriptionListItem = (props: ItemProps) => {
  const { subscription } = props;
  const { uri, channelName } = subscription;

  return (
    <li className="navigation-link__wrapper navigation__subscription">
      <Button
        navigate={uri}
        className="navigation-link navigation-link--with-thumbnail"
        activeClass="navigation-link--active"
      >
        <ChannelThumbnail xsmall uri={uri} hideStakedIndicator />
        <div className="navigation__subscription-title">
          <ClaimPreviewTitle uri={uri} />
          <span dir="auto" className="channel-name">
            {channelName}
          </span>
        </div>
      </Button>
    </li>
  );
};

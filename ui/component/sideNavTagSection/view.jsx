// @flow
import { FOLLOWED_ITEM_INITIAL_LIMIT } from 'component/sideNavigation/view';
import { SIDEBAR_SUBS_DISPLAYED } from 'constants/subscriptions';
import Button from 'component/button';
import React from 'react';

type Props = {
  showSection: boolean,
  // redux
  followedTags: Array<Tag>,
};

export default function TagSection(props: Props) {
  const { showSection, followedTags } = props;

  const [expandTags, setExpandTags] = React.useState(false);

  if (!showSection || !followedTags || !followedTags.length) return null;

  let displayedFollowedTags = followedTags;
  if (followedTags.length > FOLLOWED_ITEM_INITIAL_LIMIT && !expandTags) {
    displayedFollowedTags = followedTags.slice(0, FOLLOWED_ITEM_INITIAL_LIMIT);
  }

  return (
    <ul className="navigation__secondary navigation-links">
      {displayedFollowedTags.map(({ name }, key) => (
        <li key={name} className="navigation-link__wrapper">
          <Button navigate={`/$/discover?t=${name}`} label={`#${name}`} className="navigation-link" />
        </li>
      ))}

      {followedTags.length > SIDEBAR_SUBS_DISPLAYED && (
        <Button
          key="showMore"
          label={expandTags ? __('Show less') : __('Show more')}
          className="navigation-link"
          onClick={() => setExpandTags(!expandTags)}
        />
      )}
    </ul>
  );
}

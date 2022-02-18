// @flow
import 'scss/component/_comment-badge.scss';

import * as ICONS from 'constants/icons';
import React from 'react';
import CommentBadge from './comment-badge';
import Button from 'component/button';

type Props = {
  badgeToShow: string,
  linkPage?: boolean,
  placement?: string,
};

export default function PremiumBadge(props: Props) {
  const { badgeToShow, linkPage, placement } = props;

  const badgeProps = { size: 40, placement };

  return (
    <BadgeWrapper linkPage={linkPage}>
      {badgeToShow === 'silver' ? (
        <CommentBadge label={__('Premium')} icon={ICONS.PREMIUM} {...badgeProps} />
      ) : (
        badgeToShow === 'gold' && <CommentBadge label={__('Premium +')} icon={ICONS.PREMIUM_PLUS} {...badgeProps} />
      )}
    </BadgeWrapper>
  );
}

type WrapperProps = {
  linkPage?: boolean,
  children: any,
};

const BadgeWrapper = (props: WrapperProps) => {
  const { linkPage, children } = props;

  return linkPage ? (
    <Button target="_blank" navigate="/$/membership">
      {children}
    </Button>
  ) : (
    children
  );
};

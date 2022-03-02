//  @flow
import React from 'react';
import * as PAGES from 'constants/pages';
import * as ICONS from 'constants/icons';
import Button from 'component/button';
import NotificationBubble from 'component/notificationBubble';
import classnames from 'classnames';

type SideNavLink = {
  title: string,
  link?: string,
  route?: string,
  icon: string,
  extra?: any,
  hideForUnauth?: boolean,
  onClick?: () => any,
};

export const GO_LIVE = {
  title: 'Go Live',
  link: `/$/${PAGES.LIVESTREAM}`,
  icon: ICONS.VIDEO,
};

export const getHomeButton = (additionalAction?: () => void) => ({
  title: 'Home',
  link: `/`,
  icon: ICONS.HOME,
  onClick: () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      if (additionalAction) additionalAction();
    }
  },
});

export const RECENT_FROM_FOLLOWING = {
  title: 'Following --[sidebar button]--',
  link: `/$/${PAGES.CHANNELS_FOLLOWING}`,
  icon: ICONS.SUBSCRIBE,
};

export const NOTIFICATIONS = {
  title: 'Notifications',
  link: `/$/${PAGES.NOTIFICATIONS}`,
  icon: ICONS.NOTIFICATION,
  extra: <NotificationBubble inline />,
  hideForUnauth: true,
};

export const PLAYLISTS = {
  title: 'Lists',
  link: `/$/${PAGES.LISTS}`,
  icon: ICONS.STACK,
  hideForUnauth: true,
};

export const UNAUTH_LINKS: Array<SideNavLink> = [
  {
    title: 'Log In',
    link: `/$/${PAGES.AUTH_SIGNIN}`,
    icon: ICONS.SIGN_IN,
  },
  {
    title: 'Sign Up',
    link: `/$/${PAGES.AUTH}`,
    icon: ICONS.SIGN_UP,
  },
  {
    title: 'Settings',
    link: `/$/${PAGES.SETTINGS}`,
    icon: ICONS.SETTINGS,
  },
  {
    title: 'Help',
    link: `/$/${PAGES.HELP}`,
    icon: ICONS.HELP,
  },
];

export const WILD_WEST = {
  title: 'Wild West',
  link: `/$/${PAGES.WILD_WEST}`,
  icon: ICONS.WILD_WEST,
};

export const MOBILE_LINKS: Array<SideNavLink> = [
  {
    title: 'Upload',
    link: `/$/${PAGES.UPLOAD}`,
    icon: ICONS.PUBLISH,
  },
  {
    title: 'New Channel',
    link: `/$/${PAGES.CHANNEL_NEW}`,
    icon: ICONS.CHANNEL,
    hideForUnauth: true,
  },
  {
    title: 'Sync YouTube Channel',
    link: `/$/${PAGES.YOUTUBE_SYNC}`,
    icon: ICONS.YOUTUBE,
    hideForUnauth: true,
  },
  {
    title: 'Uploads',
    link: `/$/${PAGES.UPLOADS}`,
    icon: ICONS.PUBLISH,
    hideForUnauth: true,
  },

  {
    title: 'Channels',
    link: `/$/${PAGES.CHANNELS}`,
    icon: ICONS.CHANNEL,
    hideForUnauth: true,
  },
  {
    title: 'Creator Analytics',
    link: `/$/${PAGES.CREATOR_DASHBOARD}`,
    icon: ICONS.ANALYTICS,
    hideForUnauth: true,
  },
  {
    title: 'Wallet',
    link: `/$/${PAGES.WALLET}`,
    icon: ICONS.WALLET,
    hideForUnauth: true,
  },
  {
    title: 'Rewards',
    link: `/$/${PAGES.REWARDS}`,
    icon: ICONS.REWARDS,
    hideForUnauth: true,
  },
  {
    title: 'Invites',
    link: `/$/${PAGES.INVITE}`,
    icon: ICONS.INVITE,
    hideForUnauth: true,
  },
  {
    title: 'Settings',
    link: `/$/${PAGES.SETTINGS}`,
    icon: ICONS.SETTINGS,
    hideForUnauth: true,
  },
  {
    title: 'Help',
    link: `/$/${PAGES.HELP}`,
    icon: ICONS.HELP,
    hideForUnauth: true,
  },
  {
    title: 'Sign Out',
    icon: ICONS.SIGN_OUT,
    hideForUnauth: true,
  },
];

type SideLinkProps = SideNavLink & {
  pulseLibrary: boolean,
  unseenCount: number,
  email: ?string,
  doSignOut?: () => void,
};

export default function SideLink(props: SideLinkProps) {
  const { hideForUnauth, route, link, pulseLibrary, unseenCount, email, doSignOut, ...passedProps } = props;
  const { title, icon, extra } = passedProps;

  if (hideForUnauth && !email) return null;

  return (
    <li key={route || link || title}>
      <Button
        {...passedProps}
        icon={icon}
        navigate={route || link}
        label={__(title)}
        title={__(title)}
        className={classnames('navigation-link', {
          'navigation-link--pulse': icon === ICONS.LIBRARY && pulseLibrary,
          'navigation-link--highlighted': icon === ICONS.NOTIFICATION && unseenCount > 0,
        })}
        activeClass="navigation-link--active"
      />

      {extra}
    </li>
  );
}

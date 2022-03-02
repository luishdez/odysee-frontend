// @flow
import * as PAGES from 'constants/pages';
import * as ICONS from 'constants/icons';
import * as KEYCODES from 'constants/keycodes';
import React, { useEffect } from 'react';
import Button from 'component/button';
import classnames from 'classnames';
import Icon from 'component/common/icon';
import I18nMessage from 'component/i18nMessage';
import { useIsMobile, useIsLargeScreen, isTouch } from 'effects/use-screensize';
import { GetLinksData } from 'util/buildHomepage';
import { DOMAIN, ENABLE_UI_NOTIFICATIONS, ENABLE_NO_SOURCE_CLAIMS, CHANNEL_STAKED_LEVEL_LIVESTREAM } from 'config';
import SideLink, {
  GO_LIVE,
  getHomeButton,
  RECENT_FROM_FOLLOWING,
  NOTIFICATIONS,
  PLAYLISTS,
  UNAUTH_LINKS,
  WILD_WEST,
  MOBILE_LINKS,
} from './link-props';
import SubscriptionSection from 'component/sideNavSubSection';
import TagsSection from 'component/sideNavTagSection';

export const FOLLOWED_ITEM_INITIAL_LIMIT = 10;

// ****************************************************************************
// ****************************************************************************

type Props = {
  email: ?string,
  doSignOut: () => void,
  sidebarOpen: boolean,
  setSidebarOpen: (boolean) => void,
  isMediumScreen: boolean,
  isOnFilePage: boolean,
  unseenCount: number,
  purchaseSuccess: boolean,
  doClearPurchasedUriSuccess: () => void,
  user: ?User,
  homepageData: any,
  activeChannelStakedLevel: number,
  wildWestDisabled: boolean,
  doClearClaimSearch: () => void,
};

export default function SideNavigation(props: Props) {
  const {
    doSignOut,
    email,
    purchaseSuccess,
    doClearPurchasedUriSuccess,
    sidebarOpen,
    setSidebarOpen,
    isMediumScreen,
    isOnFilePage,
    unseenCount,
    homepageData,
    user,
    activeChannelStakedLevel,
    wildWestDisabled,
    doClearClaimSearch,
  } = props;

  const touch = isTouch();
  const isLargeScreen = useIsLargeScreen();

  const EXTRA_SIDEBAR_LINKS = GetLinksData(homepageData, isLargeScreen).map(({ pinnedUrls, ...theRest }) => theRest);

  const notificationsEnabled = ENABLE_UI_NOTIFICATIONS || (user && user.experimental_ui);
  const isAuthenticated = Boolean(email);

  const livestreamEnabled = Boolean(
    ENABLE_NO_SOURCE_CLAIMS &&
      user &&
      !user.odysee_live_disabled &&
      (activeChannelStakedLevel >= CHANNEL_STAKED_LEVEL_LIVESTREAM || user.odysee_live_enabled)
  );

  const [pulseLibrary, setPulseLibrary] = React.useState(false);

  const isAbsolute = isOnFilePage || isMediumScreen;
  const isMobile = useIsMobile();

  const [menuInitialized, setMenuInitialized] = React.useState(false);

  const menuCanCloseCompletely = (isOnFilePage && !isMobile) || (isMobile && menuInitialized);
  const hideMenuFromView = menuCanCloseCompletely && !sidebarOpen;

  const [canDisposeMenu, setCanDisposeMenu] = React.useState(false);

  React.useEffect(() => {
    if (hideMenuFromView || !menuInitialized) {
      const handler = setTimeout(() => {
        setMenuInitialized(true);
        setCanDisposeMenu(true);
      }, 250);
      return () => {
        clearTimeout(handler);
      };
    } else {
      setCanDisposeMenu(false);
    }
  }, [hideMenuFromView, menuInitialized]);

  const shouldRenderLargeMenu = menuCanCloseCompletely || sidebarOpen;

  const showMicroMenu = !sidebarOpen && !menuCanCloseCompletely;
  const showPushMenu = sidebarOpen && !menuCanCloseCompletely;
  const showOverlay = isAbsolute && sidebarOpen;

  React.useEffect(() => {
    // $FlowFixMe
    document.body.style.overflowY = showOverlay ? 'hidden' : '';
    return () => {
      // $FlowFixMe
      document.body.style.overflowY = '';
    };
  }, [showOverlay]);

  React.useEffect(() => {
    if (purchaseSuccess) {
      setPulseLibrary(true);

      let timeout = setTimeout(() => {
        setPulseLibrary(false);
        doClearPurchasedUriSuccess();
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [setPulseLibrary, purchaseSuccess, doClearPurchasedUriSuccess]);

  React.useEffect(() => {
    function handleKeydown(e: SyntheticKeyboardEvent<*>) {
      if (e.keyCode === KEYCODES.ESCAPE && isAbsolute) {
        setSidebarOpen(false);
      } else if (e.keyCode === KEYCODES.BACKSLASH) {
        const hasActiveInput = document.querySelector('input:focus, textarea:focus');
        if (!hasActiveInput) {
          setSidebarOpen(!sidebarOpen);
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, [sidebarOpen, setSidebarOpen, isAbsolute]);

  useEffect(() => {
    if (!window.Optanon) {
      const gdprDiv = document.getElementById('gdprSidebarLink');
      if (gdprDiv) {
        gdprDiv.style.display = 'none';
      }
    }
  }, [sidebarOpen]);

  const unAuthNudge =
    DOMAIN === 'lbry.tv' ? null : (
      <div className="navigation__auth-nudge">
        <span>
          <I18nMessage tokens={{ lbc: <Icon icon={ICONS.LBC} /> }}>
            Sign up to earn %lbc% for you and your favorite creators.
          </I18nMessage>
        </span>
        <Button
          button="secondary"
          label={__('Sign Up')}
          navigate={`/$/${PAGES.AUTH}?src=sidenav_nudge`}
          disabled={user === null}
        />{' '}
      </div>
    );

  const defaultLinkProps = { pulseLibrary, unseenCount, email };

  return (
    <div
      className={classnames('navigation__wrapper', {
        'navigation__wrapper--micro': showMicroMenu,
        'navigation__wrapper--absolute': isAbsolute,
      })}
    >
      <nav
        aria-label="Sidebar"
        className={classnames('navigation', {
          'navigation--micro': showMicroMenu,
          'navigation--push': showPushMenu,
          'navigation-file-page-and-mobile': hideMenuFromView,
          'navigation-touch': touch,
        })}
      >
        {(!canDisposeMenu || sidebarOpen) && (
          <div className="navigation-inner-container">
            <ul className="navigation-links--absolute mobile-only">
              {notificationsEnabled && <SideLink {...NOTIFICATIONS} {...defaultLinkProps} />}
              {email && livestreamEnabled && <SideLink {...GO_LIVE} {...defaultLinkProps} />}
            </ul>

            <ul
              className={classnames('navigation-links', {
                'navigation-links--micro': showMicroMenu,
                'navigation-links--absolute': shouldRenderLargeMenu,
              })}
            >
              <SideLink {...getHomeButton(doClearClaimSearch)} {...defaultLinkProps} />
              <SideLink {...RECENT_FROM_FOLLOWING} {...defaultLinkProps} />
              <SideLink {...PLAYLISTS} {...defaultLinkProps} />
            </ul>

            {EXTRA_SIDEBAR_LINKS && (
              <ul
                className={classnames('navigation-links', {
                  'navigation-links--micro': showMicroMenu,
                  'navigation-links--absolute': shouldRenderLargeMenu,
                })}
              >
                {/* $FlowFixMe -- GetLinksData should fix its data type */}
                {EXTRA_SIDEBAR_LINKS.map((linkProps, index) => (
                  <SideLink key={index} {...linkProps} {...defaultLinkProps} />
                ))}

                {!wildWestDisabled && <SideLink {...WILD_WEST} {...defaultLinkProps} />}
              </ul>
            )}

            <ul className="navigation-links--absolute mobile-only">
              {email
                ? MOBILE_LINKS.map((linkProps, index) => (
                    <SideLink key={index} {...linkProps} {...defaultLinkProps} doSignOut={doSignOut} />
                  ))
                : UNAUTH_LINKS.map((linkProps, index) => <SideLink key={index} {...linkProps} {...defaultLinkProps} />)}
            </ul>

            <SubscriptionSection showSection={shouldRenderLargeMenu && isAuthenticated} />

            <TagsSection showSection={sidebarOpen && isAuthenticated} />

            {!isAuthenticated && sidebarOpen && unAuthNudge}
          </div>
        )}
        {(!canDisposeMenu || sidebarOpen) && shouldRenderLargeMenu && <HelpLinks />}
      </nav>

      <div
        className={classnames('navigation__overlay', {
          'navigation__overlay--active': showOverlay,
        })}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
}

const HelpLinks = () => (
  <ul className="navigation__tertiary navigation-links--small">
    <li className="navigation-link">
      <Button label={__('FAQ and Support')} href="https://odysee.com/@OdyseeHelp:b" />
    </li>
    <li className="navigation-link">
      <Button label={__('Community Guidelines')} href="https://odysee.com/@OdyseeHelp:b/Community-Guidelines:c" />
    </li>
    <li className="navigation-link">
      <Button label={__('Terms')} href="https://odysee.com/$/tos" />
    </li>
    <li className="navigation-link">
      <Button label={__('Privacy Policy')} href="https://odysee.com/$/privacypolicy" />
    </li>
    <li className="navigation-link" id="gdprSidebarLink">
      <Button label={__('Cookie Settings')} onClick={() => window.Optanon && window.Optanon.ToggleInfoDisplay()} />
    </li>
  </ul>
);

// @flow

// $FlowFixMe
import { Global } from '@emotion/react';

import type { ElementRef } from 'react';
import * as ICONS from 'constants/icons';
import * as RENDER_MODES from 'constants/file_render_modes';
import React from 'react';
import Button from 'component/button';
import classnames from 'classnames';
import LoadingScreen from 'component/common/loading-screen';
import FileRender from 'component/fileRender';
import UriIndicator from 'component/uriIndicator';
import usePersistedState from 'effects/use-persisted-state';
import { PRIMARY_PLAYER_WRAPPER_CLASS } from 'page/file/view';
import Draggable from 'react-draggable';
import { onFullscreenChange } from 'util/full-screen';
import { generateListSearchUrlParams, formatLbryChannelName } from 'util/url';
import { useIsMobile } from 'effects/use-screensize';
import debounce from 'util/debounce';
import { useHistory } from 'react-router';
import { isURIEqual } from 'util/lbryURI';
import AutoplayCountdown from 'component/autoplayCountdown';
import usePlayNext from 'effects/use-play-next';
import {
  getRootEl,
  getScreenWidth,
  getScreenHeight,
  clampFloatingPlayerToScreen,
  calculateRelativePos,
  getAspectRatio,
  getMaxLandscapeHeight,
  getAmountNeededToCenterVideo,
  getPossiblePlayerHeight,
} from './helper-functions';

// scss/init/vars.scss
// --header-height
const HEADER_HEIGHT = 60;
// --header-height-mobile
export const HEADER_HEIGHT_MOBILE = 56;

const DEBOUNCE_WINDOW_RESIZE_HANDLER_MS = 100;

export const INLINE_PLAYER_WRAPPER_CLASS = 'inline-player__wrapper';
export const CONTENT_VIEWER_CLASS = 'content__viewer';
export const FLOATING_PLAYER_CLASS = 'content__viewer--floating';

// ****************************************************************************
// ****************************************************************************

type Props = {
  claimId: ?string,
  channelUrl: ?string,
  isFloating: boolean,
  uri: string,
  streamingUrl?: string,
  title: ?string,
  floatingPlayerEnabled: boolean,
  renderMode: string,
  playingUri: PlayingUri,
  primaryUri: ?string,
  videoTheaterMode: boolean,
  collectionId: string,
  costInfo: any,
  claimWasPurchased: boolean,
  nextListUri: string,
  previousListUri: string,
  doFetchRecommendedContent: (uri: string) => void,
  doUriInitiatePlay: (playingOptions: PlayingUri, isPlayable: ?boolean, isFloating: ?boolean) => void,
  doSetPlayingUri: ({ uri?: ?string }) => void,
  isCurrentClaimLive?: boolean,
  playerDimensions: { height: ?number, width: ?number },
  socketConnected: boolean,
  isLivestreamClaim: boolean,
  geoRestriction: ?GeoRestriction,
  appDrawerOpen: boolean,
  doCommentSocketConnect: (string, string, string) => void,
  doCommentSocketDisconnect: (string, string) => void,
};

export default function FileRenderFloating(props: Props) {
  const {
    claimId,
    channelUrl,
    uri,
    streamingUrl,
    title,
    isFloating,
    floatingPlayerEnabled,
    renderMode,
    playingUri,
    primaryUri,
    videoTheaterMode,
    collectionId,
    costInfo,
    claimWasPurchased,
    nextListUri,
    previousListUri,
    socketConnected,
    isLivestreamClaim,
    doFetchRecommendedContent,
    doUriInitiatePlay,
    doSetPlayingUri,
    isCurrentClaimLive,
    playerDimensions,
    geoRestriction,
    appDrawerOpen,
    doCommentSocketConnect,
    doCommentSocketDisconnect,
  } = props;

  const isMobile = useIsMobile();

  const resizedPlayerHeight = React.useRef();
  const initialRect = React.useRef();
  const resizedBetweenFloating = React.useRef();

  const {
    location: { state },
  } = useHistory();
  const hideFloatingPlayer = state && state.hideFloatingPlayer;

  const { uri: playingUrl, source: playingUriSource, primaryUri: playingPrimaryUri } = playingUri;

  const isComment = playingUriSource === 'comment';
  const mainFilePlaying = Boolean(!isFloating && primaryUri && isURIEqual(uri, primaryUri));
  const noFloatingPlayer = !isFloating || !floatingPlayerEnabled || hideFloatingPlayer;

  const [fileViewerRect, setFileViewerRect] = React.useState();
  const [wasDragging, setWasDragging] = React.useState(false);
  const [doNavigate, setDoNavigate] = React.useState(false);
  const [shouldPlayNext, setPlayNext] = React.useState(true);
  const [countdownCanceled, setCountdownCanceled] = React.useState(false);
  const [position, setPosition] = usePersistedState('floating-file-viewer:position', {
    x: -25,
    y: window.innerHeight - 400,
  });
  const relativePosRef = React.useRef({ x: 0, y: 0 });

  const navigateUrl =
    (playingPrimaryUri || playingUrl || '') + (collectionId ? generateListSearchUrlParams(collectionId) : '');

  const isFree = costInfo && costInfo.cost === 0;
  const canViewFile = isFree || claimWasPurchased;
  const isPlayable = RENDER_MODES.FLOATING_MODES.includes(renderMode) || isCurrentClaimLive;
  const isReadyToPlay = isCurrentClaimLive || (isPlayable && streamingUrl);

  // ****************************************************************************
  // FUNCTIONS
  // ****************************************************************************

  const handleResize = React.useCallback(() => {
    const element = mainFilePlaying
      ? document.querySelector(`.${PRIMARY_PLAYER_WRAPPER_CLASS}`)
      : document.querySelector(`.${INLINE_PLAYER_WRAPPER_CLASS}`);

    if (!element) return;

    const rect = element.getBoundingClientRect();

    // getBoundingClientRect returns a DomRect, not an object
    const objectRect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      // $FlowFixMe
      x: rect.x,
    };

    if (playerDimensions.height && playerDimensions.width && !initialRect.current) {
      initialRect.current = { ...objectRect, windowOffset: window.pageYOffset };
      // $FlowFixMe -- already considered above
      const aspectRatio = getAspectRatio(playerDimensions.height, playerDimensions.width);
      const heightForViewer = aspectRatio * rect.width;
      const heightResult = getPossiblePlayerHeight(heightForViewer, isMobile);
      const newHeight = resizedPlayerHeight.current || heightResult;

      if (!resizedPlayerHeight.current) resizedPlayerHeight.current = newHeight;
    }

    // $FlowFixMe
    setFileViewerRect({ ...objectRect, windowOffset: window.pageYOffset });
  }, [isMobile, mainFilePlaying, playerDimensions.height, playerDimensions.width]);

  const restoreToRelativePosition = React.useCallback(() => {
    const SCROLL_BAR_PX = 12; // root: --body-scrollbar-width
    const screenW = getScreenWidth() - SCROLL_BAR_PX;
    const screenH = getScreenHeight();

    const newX = Math.round(relativePosRef.current.x * screenW);
    const newY = Math.round(relativePosRef.current.y * screenH);

    setPosition(clampFloatingPlayerToScreen(newX, newY));
  }, [setPosition]);

  const clampToScreenOnResize = React.useCallback(
    debounce(restoreToRelativePosition, DEBOUNCE_WINDOW_RESIZE_HANDLER_MS),
    []
  );

  // For playlists when pressing next/previous etc and switching players
  function resetState() {
    setCountdownCanceled(false);
    setDoNavigate(false);
    setPlayNext(true);
  }

  // ****************************************************************************
  // EFFECTS
  // ****************************************************************************

  usePlayNext(
    isFloating,
    collectionId,
    shouldPlayNext,
    nextListUri,
    previousListUri,
    doNavigate,
    doUriInitiatePlay,
    resetState
  );

  // Establish web socket connection for viewer count.
  React.useEffect(() => {
    if (!claimId || !channelUrl || !isCurrentClaimLive) return;

    const channelName = formatLbryChannelName(channelUrl);

    // Only connect if not yet connected, so for example clicked on an embed instead of accessing
    // from the Livestream page
    if (!socketConnected) doCommentSocketConnect(uri, channelName, claimId);

    // This will be used to disconnect for every case, since this is the main player component
    return () => doCommentSocketDisconnect(claimId, channelName);

    // only listen to socketConnected on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelUrl, claimId, doCommentSocketConnect, doCommentSocketDisconnect, isCurrentClaimLive, uri]);

  React.useEffect(() => {
    if (playingPrimaryUri || playingUrl) {
      handleResize();
    }
  }, [handleResize, playingPrimaryUri, videoTheaterMode, playingUrl]);

  // Listen to main-window resizing and adjust the floating player position accordingly:
  React.useEffect(() => {
    // intended to only run once: when floating player switches between true - false
    // otherwise handleResize() can run twice when this effect re-runs, so use
    // resizedBetweenFloating ref
    if (isFloating) {
      // Ensure player is within screen when 'isFloating' changes.
      restoreToRelativePosition();
      resizedBetweenFloating.current = false;
    } else if (!resizedBetweenFloating.current) {
      handleResize();
      resizedBetweenFloating.current = true;
    }

    function onWindowResize() {
      return isFloating ? clampToScreenOnResize() : handleResize();
    }

    window.addEventListener('resize', onWindowResize);
    if (!isFloating && !isMobile) onFullscreenChange(window, 'add', handleResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (!isFloating && !isMobile) onFullscreenChange(window, 'remove', handleResize);
    };

    // Only listen to these and avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampToScreenOnResize, handleResize, isFloating]);

  React.useEffect(() => {
    // Initial update for relativePosRef:
    relativePosRef.current = calculateRelativePos(position.x, position.y);

    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (isFloating && isComment) {
      // When the player begins floating, remove the comment source
      // so that it doesn't try to resize again in case of going back
      // to the origin's comment section and fail to position correctly
      doSetPlayingUri({ ...playingUri, source: null });
    }
  }, [doSetPlayingUri, isComment, isFloating, playingUri]);

  React.useEffect(() => {
    if (isFloating) doFetchRecommendedContent(uri);
  }, [doFetchRecommendedContent, isFloating, uri]);

  React.useEffect(() => {
    return () => {
      // basically if switched videos (playingUrl change or unmount),
      // erase the data so it can be re-calculated
      if (playingUrl) {
        resizedPlayerHeight.current = undefined;
        initialRect.current = undefined;
      }
    };
  }, [playingUrl]);

  if (
    geoRestriction ||
    !isPlayable ||
    !uri ||
    (isFloating && noFloatingPlayer) ||
    (collectionId && !isFloating && ((!canViewFile && !nextListUri) || countdownCanceled)) ||
    (isLivestreamClaim && !isCurrentClaimLive)
  ) {
    return null;
  }

  // ****************************************************************************
  // RENDER
  // ****************************************************************************

  function handleDragStart() {
    // Not really necessary, but reset just in case 'handleStop' didn't fire.
    setWasDragging(false);
  }

  function handleDragMove(e, ui) {
    const { x, y } = position;
    const newX = ui.x;
    const newY = ui.y;

    // Mark as dragging if the position changed and we were not dragging before.
    if (!wasDragging && (newX !== x || newY !== y)) {
      setWasDragging(true);
    }
  }

  function handleDragStop(e, ui) {
    if (wasDragging) setWasDragging(false);
    const { x, y } = ui;
    let newPos = { x, y };

    if (newPos.x !== position.x || newPos.y !== position.y) {
      newPos = clampFloatingPlayerToScreen(newPos.x, newPos.y);

      setPosition(newPos);
      relativePosRef.current = calculateRelativePos(newPos.x, newPos.y);
    }
  }

  return (
    <Draggable
      onDrag={handleDragMove}
      onStart={handleDragStart}
      onStop={handleDragStop}
      defaultPosition={position}
      position={isFloating ? position : { x: 0, y: 0 }}
      bounds="parent"
      disabled={noFloatingPlayer}
      handle=".draggable"
      cancel=".button"
    >
      <div
        className={classnames([CONTENT_VIEWER_CLASS], {
          [FLOATING_PLAYER_CLASS]: isFloating,
          'content__viewer--inline': !isFloating,
          'content__viewer--secondary': isComment,
          'content__viewer--theater-mode': videoTheaterMode && mainFilePlaying && !isCurrentClaimLive && !isMobile,
          'content__viewer--disable-click': wasDragging,
          'content__viewer--mobile': isMobile && !playingUriSource,
        })}
        style={
          !isFloating && fileViewerRect
            ? {
                width: fileViewerRect.width,
                height: appDrawerOpen ? `${getMaxLandscapeHeight()}px` : fileViewerRect.height,
                left: fileViewerRect.x,
                top:
                  isMobile && !playingUriSource
                    ? HEADER_HEIGHT_MOBILE
                    : fileViewerRect.windowOffset + fileViewerRect.top - HEADER_HEIGHT,
              }
            : {}
        }
      >
        {uri && playerDimensions.height && playerDimensions.width && fileViewerRect ? (
          <PlayerGlobalStyles
            playerDimensions={playerDimensions}
            videoTheaterMode={videoTheaterMode}
            appDrawerOpen={appDrawerOpen}
            resizedPlayerHeight={resizedPlayerHeight}
            isFloating={isFloating}
            fileViewerRect={fileViewerRect}
            mainFilePlaying={mainFilePlaying}
            playingUrl={playingUrl}
          />
        ) : null}

        <div className={classnames('content__wrapper', { 'content__wrapper--floating': isFloating })}>
          {isFloating && (
            <Button
              title={__('Close')}
              onClick={() => doSetPlayingUri({ uri: null })}
              icon={ICONS.REMOVE}
              button="primary"
              className="content__floating-close"
            />
          )}

          {isReadyToPlay ? (
            <FileRender className="draggable" uri={uri} />
          ) : collectionId && !canViewFile ? (
            <div className="content__loading">
              <AutoplayCountdown
                nextRecommendedUri={nextListUri}
                doNavigate={() => setDoNavigate(true)}
                doReplay={() => doUriInitiatePlay({ uri, collectionId }, false, isFloating)}
                doPrevious={() => {
                  setPlayNext(false);
                  setDoNavigate(true);
                }}
                onCanceled={() => setCountdownCanceled(true)}
                skipPaid
              />
            </div>
          ) : (
            <LoadingScreen status={__('Loading')} />
          )}

          {isFloating && (
            <div className="draggable content__info">
              <div className="claim-preview__title" title={title || uri}>
                <Button label={title || uri} navigate={navigateUrl} button="link" className="content__floating-link" />
              </div>

              <UriIndicator link uri={uri} />
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
}

type GlobalStylesProps = {
  playerDimensions: any,
  videoTheaterMode: boolean,
  appDrawerOpen: boolean,
  resizedPlayerHeight: ElementRef<any>,
  isFloating: boolean,
  fileViewerRect: any,
  mainFilePlaying: boolean,
  playingUrl: ?string,
};

const PlayerGlobalStyles = (props: GlobalStylesProps) => {
  const {
    playerDimensions,
    videoTheaterMode,
    appDrawerOpen,
    resizedPlayerHeight,
    playingUrl,
    isFloating,
    fileViewerRect,
    mainFilePlaying,
  } = props;

  const isMobile = useIsMobile();
  const isMobilePlayer = isMobile && !isFloating; // to avoid miniplayer -> file page only

  const previousPlayingUri = React.useRef(playingUrl);

  // $FlowFixMe -- already considered before calling component
  const videoAspectRatio = getAspectRatio(playerDimensions.height, playerDimensions.width);
  const heightForViewer = getPossiblePlayerHeight(videoAspectRatio * fileViewerRect.width, isMobile);
  const widthForViewer = heightForViewer / videoAspectRatio;
  const maxLandscapeHeight = getMaxLandscapeHeight(isMobile ? undefined : widthForViewer);
  const heightResult = appDrawerOpen ? `${maxLandscapeHeight}px` : `${heightForViewer}px`;
  const amountToFullyCenterVideo = getAmountNeededToCenterVideo(heightForViewer, maxLandscapeHeight);

  const forceDefaults = !mainFilePlaying || videoTheaterMode || isFloating || isMobile;
  const videoGreaterThanLandscape = heightForViewer > maxLandscapeHeight;

  const switchedVids = previousPlayingUri.current !== playingUrl;

  React.useEffect(() => {
    if (switchedVids) {
      previousPlayingUri.current = playingUrl;
    }
  }, [playingUrl, previousPlayingUri, switchedVids]);

  React.useEffect(() => {
    if (!isMobilePlayer || !mainFilePlaying || appDrawerOpen) return;

    const viewer = document.querySelector(`.${CONTENT_VIEWER_CLASS}`);
    if (viewer) viewer.style.height = `${heightForViewer}px`;

    function handleScroll() {
      const rootEl = getRootEl();

      const viewer = document.querySelector(`.${CONTENT_VIEWER_CLASS}`);
      const videoNode = document.querySelector('.vjs-tech');
      const touchOverlay = document.querySelector('.vjs-touch-overlay');

      if (rootEl && viewer) {
        const scrollTop = window.pageYOffset || rootEl.scrollTop;
        const isHigherThanLandscape = scrollTop < resizedPlayerHeight.current - maxLandscapeHeight;

        if (videoNode) {
          if (isHigherThanLandscape) {
            if (resizedPlayerHeight.current > maxLandscapeHeight) {
              const result = resizedPlayerHeight.current - scrollTop;
              const amountNeededToCenter = getAmountNeededToCenterVideo(videoNode.offsetHeight, result);

              videoNode.style.top = `${amountNeededToCenter}px`;
              if (touchOverlay) touchOverlay.style.height = `${result}px`;
              viewer.style.height = `${result}px`;
            }
          } else {
            if (touchOverlay) touchOverlay.style.height = `${maxLandscapeHeight}px`;
            viewer.style.height = `${maxLandscapeHeight}px`;
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      const viewer = document.querySelector(`.${CONTENT_VIEWER_CLASS}`);
      const videoNode = document.querySelector('.vjs-tech');
      const touchOverlay = document.querySelector('.vjs-touch-overlay');
      if (videoNode && touchOverlay && viewer) {
        // clear the added styles on unmount
        videoNode.removeAttribute('style');
        touchOverlay.removeAttribute('style');
        // $FlowFixMe
        viewer.style.height = undefined;
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [appDrawerOpen, heightForViewer, isMobilePlayer, mainFilePlaying, maxLandscapeHeight, resizedPlayerHeight]);

  // -- render styles --

  const transparentBackground = {
    background: videoGreaterThanLandscape && mainFilePlaying && !forceDefaults ? 'transparent !important' : undefined,
  };
  const maxHeight = { maxHeight: !videoTheaterMode ? 'var(--desktop-portrait-player-max-height)' : undefined };

  return (
    <Global
      styles={{
        [`.${PRIMARY_PLAYER_WRAPPER_CLASS}`]: {
          height: !videoTheaterMode && mainFilePlaying && !switchedVids ? `${heightResult} !important` : undefined,
          opacity: !videoTheaterMode && mainFilePlaying ? '0 !important' : undefined,
        },

        '.file-render--video': {
          ...transparentBackground,
          ...maxHeight,

          video: maxHeight,
        },
        '.content__wrapper': transparentBackground,
        '.video-js': transparentBackground,

        '.vjs-fullscreen': {
          video: {
            top: 'unset !important',
            height: '100% !important',
          },
          '.vjs-touch-overlay': {
            height: '100% !important',
            maxHeight: 'unset !important',
          },
        },

        '.vjs-tech': {
          opacity: '1',
          height:
            isMobilePlayer && ((appDrawerOpen && videoGreaterThanLandscape) || videoGreaterThanLandscape)
              ? 'unset !important'
              : '100%',
          position: 'absolute',
          top: appDrawerOpen ? `${amountToFullyCenterVideo}px !important` : '0px',
        },

        [`.${CONTENT_VIEWER_CLASS}`]: {
          height:
            !forceDefaults && !switchedVids && (!isMobile || isMobilePlayer) ? `${heightResult} !important` : undefined,
          ...maxHeight,
        },
      }}
    />
  );
};

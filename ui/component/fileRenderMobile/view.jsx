// @flow
import * as RENDER_MODES from 'constants/file_render_modes';
import React, { useEffect, useState } from 'react';
import { onFullscreenChange } from 'util/full-screen';
import { generateListSearchUrlParams, formatLbryUrlForWeb } from 'util/url';
import { useHistory } from 'react-router';
import LoadingScreen from 'component/common/loading-screen';
import FileRender from 'component/fileRender';
import AutoplayCountdown from 'component/autoplayCountdown';
import LivestreamIframeRender from 'component/livestreamLayout/iframe-render';

const PRIMARY_PLAYER_WRAPPER_CLASS = 'file-page__video-container';
export const INLINE_PLAYER_WRAPPER_CLASS = 'inline-player__wrapper';
export const HEADER_HEIGHT_MOBILE = 56;

const ORIENTATION = {
  landscape: 'landscape',
  portrait: 'portrait',
  square: 'square',
};

// ****************************************************************************
// ****************************************************************************

type Props = {
  claimId?: string,
  uri: string,
  streamingUrl?: string,
  renderMode: string,
  collectionId: string,
  costInfo: any,
  claimWasPurchased: boolean,
  nextListUri: string,
  previousListUri: string,
  activeLivestreamForChannel?: any,
  channelClaimId?: any,
  playingUri?: PlayingUri,
  mobilePlayerDimensions?: any,
  doPlayUri: (string) => void,
  doSetMobilePlayerDimensions: (height: number, width: number) => void,
};

export default function FileRenderMobile(props: Props) {
  const {
    claimId,
    uri,
    streamingUrl,
    renderMode,
    collectionId,
    costInfo,
    claimWasPurchased,
    nextListUri,
    previousListUri,
    activeLivestreamForChannel,
    channelClaimId,
    playingUri,
    mobilePlayerDimensions,
    doPlayUri,
    doSetMobilePlayerDimensions,
  } = props;

  const { push } = useHistory();

  const windowWidth = window.innerWidth;
  const maxLandscapeHeight = (windowWidth * 9) / 16;

  const [fileViewerRect, setFileViewerRect] = useState();
  const [doNavigate, setDoNavigate] = useState(false);
  const [playNextUrl, setPlayNextUrl] = useState(true);
  const [countdownCanceled, setCountdownCanceled] = useState(false);
  const [firstHeight, setFirstHeight] = useState(false);

  const isCurrentClaimLive = activeLivestreamForChannel && activeLivestreamForChannel.claimId === claimId;
  const isFree = costInfo && costInfo.cost === 0;
  const canViewFile = isFree || claimWasPurchased;
  const isPlayable = RENDER_MODES.FLOATING_MODES.includes(renderMode) || activeLivestreamForChannel;
  const isReadyToPlay = isPlayable && streamingUrl;
  const isCurrentMediaPlaying = playingUri && playingUri.uri === uri;

  const handleResize = React.useCallback(() => {
    const element = document.querySelector(`.${PRIMARY_PLAYER_WRAPPER_CLASS}`);

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

    // $FlowFixMe
    setFileViewerRect({ ...objectRect });

    if (doSetMobilePlayerDimensions && !mobilePlayerDimensions) {
      doSetMobilePlayerDimensions(rect.height, rect.width);
    }
  }, [doSetMobilePlayerDimensions, mobilePlayerDimensions]);

  // Initial resize, will place the player correctly above the cover when starts playing
  // (remember the URI here is from playingUri). The cover then keeps on the page and kind of serves as a placeholder
  // for the player size and gives the content layered behind the player a "max scroll height"
  useEffect(() => {
    if (uri) {
      handleResize();
      setCountdownCanceled(false);
    }
  }, [handleResize, uri]);

  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);
    onFullscreenChange(window, 'add', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      onFullscreenChange(window, 'remove', handleResize);
    };
  }, [handleResize]);

  const doPlay = React.useCallback(
    (playUri) => {
      setDoNavigate(false);
      const navigateUrl = formatLbryUrlForWeb(playUri);
      push({
        pathname: navigateUrl,
        search: collectionId && generateListSearchUrlParams(collectionId),
        state: { collectionId, forceAutoplay: true, hideFloatingPlayer: true },
      });
    },
    [collectionId, push]
  );

  const getAspectRatio = React.useCallback((width, height) => {
    const ratioFloatsArray = [1.77, 1.6, 1.5, 1.33, 1, 0.75, 0.66, 0.625, 0.56];

    const currentRatioFloat = width / height;
    const matchedRatioFloat = parseFloat(getClosest(currentRatioFloat, ratioFloatsArray));

    if (matchedRatioFloat === 1) {
      return ORIENTATION.square;
    } else if (matchedRatioFloat < 1) {
      return ORIENTATION.landscape;
    } else {
      return ORIENTATION.portrait;
    }
  }, []);

  React.useEffect(() => {
    if (mobilePlayerDimensions && mobilePlayerDimensions.height) {
      const videoNode = document.querySelector('video');

      if (videoNode) {
        videoNode.style.height = '100%';
        videoNode.style.position = 'absolute';
        videoNode.style.top = '0px';

        const parent = document.querySelector('.vjs-fluid');
        const orientation = getAspectRatio(mobilePlayerDimensions.height, mobilePlayerDimensions.width);

        if (orientation === ORIENTATION.landscape) {
          parent.classList.add('vjs-16-9');
        } else if (orientation === ORIENTATION.portrait) {
          parent.classList.add('vjs-9-16');
        } else if (orientation === ORIENTATION.square) {
          parent.classList.add('vjs-1-1');
        }
      }
    }
  }, [getAspectRatio, mobilePlayerDimensions]);

  React.useEffect(() => {
    if (uri && mobilePlayerDimensions && firstHeight && mobilePlayerDimensions.height !== firstHeight) {
      const cover = document.querySelector(`.${PRIMARY_PLAYER_WRAPPER_CLASS}`);
      cover.style.height = `${mobilePlayerDimensions.height}px`;
      cover.style.opacity = '0';
      const elem = document.querySelector('.content__viewer');
      elem.style.paddingBottom = `${mobilePlayerDimensions.height}px`;
    }
  }, [firstHeight, mobilePlayerDimensions, uri]);

  React.useEffect(() => {
    if (uri && mobilePlayerDimensions && mobilePlayerDimensions.height && !firstHeight) {
      setFirstHeight(mobilePlayerDimensions.height);
    }

    return () => {
      const cover = document.querySelector(`.${PRIMARY_PLAYER_WRAPPER_CLASS}`);
      if (cover.style.opacity === '0' && firstHeight && (!mobilePlayerDimensions || !mobilePlayerDimensions.height)) {
        setFirstHeight(undefined);
      }
    };
  }, [firstHeight, mobilePlayerDimensions, uri]);
  console.log(firstHeight, mobilePlayerDimensions);
  React.useEffect(() => {
    if (!uri) return;

    function handleScroll() {
      if (mobilePlayerDimensions) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isHigherThanLandscape = scrollTop < mobilePlayerDimensions.height - maxLandscapeHeight;
        const timesHigherThanLandscape = mobilePlayerDimensions.height / maxLandscapeHeight;

        const element = document.querySelector('video');
        const touchOverlay = document.querySelector('.vjs-touch-overlay');
        const elem = document.querySelector('.content__viewer');

        if (element) {
          if (isHigherThanLandscape) {
            if (mobilePlayerDimensions.height > maxLandscapeHeight) {
              const result = mobilePlayerDimensions.height - scrollTop;
              const amountNeededToCenter = (element.offsetHeight - result) / timesHigherThanLandscape;

              element.style.top = `${amountNeededToCenter * -1}px`;
              touchOverlay.style.height = `${result}px`;
              elem.style.paddingBottom = `${result}px`;
            }
          } else {
            touchOverlay.style.height = `${maxLandscapeHeight}px`;
            elem.style.paddingBottom = `${maxLandscapeHeight}px`;
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [maxLandscapeHeight, mobilePlayerDimensions, uri]);

  React.useEffect(() => {
    if (!doNavigate) return;

    if (playNextUrl && nextListUri) {
      doPlay(nextListUri);
    } else if (previousListUri) {
      doPlay(previousListUri);
    }
    setPlayNextUrl(true);
  }, [doNavigate, doPlay, nextListUri, playNextUrl, previousListUri]);

  if (
    !isCurrentMediaPlaying ||
    !isPlayable ||
    !uri ||
    countdownCanceled ||
    (collectionId && !canViewFile && !nextListUri)
  ) {
    return null;
  }

  return (
    <div
      className="content__viewer content__viewer--inline content__viewer--mobile"
      style={
        fileViewerRect
          ? {
              width: fileViewerRect.width,
              height: '0px',
              left: fileViewerRect.x,
              paddingBottom: fileViewerRect.height,
            }
          : {}
      }
    >
      <div className="content__wrapper">
        {isCurrentClaimLive && channelClaimId ? (
          <LivestreamIframeRender channelClaimId={channelClaimId} showLivestream mobileVersion />
        ) : isReadyToPlay ? (
          <FileRender uri={uri} />
        ) : !canViewFile ? (
          <div className="content__loading">
            <AutoplayCountdown
              nextRecommendedUri={nextListUri}
              doNavigate={() => setDoNavigate(true)}
              doReplay={() => doPlayUri(uri)}
              doPrevious={() => {
                setPlayNextUrl(false);
                setDoNavigate(true);
              }}
              onCanceled={() => setCountdownCanceled(true)}
              skipPaid
            />
          </div>
        ) : (
          <LoadingScreen status={__('Loading')} />
        )}
      </div>
    </div>
  );
}

function getClosest(num, arr) {
  let curr = arr[0];
  let diff = Math.abs(num - curr);
  for (let val = 0; val < arr.length; val++) {
    const newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  return curr;
}

// @flow
import { FLOATING_PLAYER_CLASS } from './view';

export function getRootEl() {
  return document && document.documentElement;
}

export function getScreenWidth() {
  const rootEl = getRootEl();
  return rootEl ? rootEl.clientWidth : window.innerWidth;
}

export function getScreenHeight() {
  const rootEl = getRootEl();
  return rootEl ? rootEl.clientHeight : window.innerHeight;
}

export function getFloatingPlayerRect() {
  const elem = document.querySelector(`.${FLOATING_PLAYER_CLASS}`);
  return elem ? elem.getBoundingClientRect() : null;
}

export function clampFloatingPlayerToScreen(x: number, y: number) {
  const playerRect = getFloatingPlayerRect();

  let newX = x;
  let newY = y;

  if (playerRect) {
    const screenW = getScreenWidth();
    const screenH = getScreenHeight();

    if (x + playerRect.width > screenW) {
      newX = screenW - playerRect.width;
    } else if (x < 0) {
      newX = 0;
    }

    if (y + playerRect.height > screenH) {
      newY = screenH - playerRect.height;
    } else if (y < 0) {
      newY = 0;
    }
  }

  return { x: newX, y: newY };
}

export function calculateRelativePos(x: number, y: number) {
  return {
    x: x / getScreenWidth(),
    y: y / getScreenHeight(),
  };
}

export function getAspectRatio(width: number, height: number) {
  return width / height;
}

// Max landscape height = calculates the maximum size the player would be at
// if it was at landscape aspect ratio
export function getMaxLandscapeHeight(width?: number) {
  const windowWidth = width || getScreenWidth();
  const maxLandscapeHeight = (windowWidth * 9) / 16;

  return maxLandscapeHeight;
}

// If a video is higher than landscape, this calculates how much is needed in order
// for the video to be centered in a container at the landscape height
export function getAmountNeededToCenterVideo(height: number, fromValue: number) {
  const minVideoHeight = getMaxLandscapeHeight();
  const timesHigherThanLandscape = height / minVideoHeight;
  const amountNeededToCenter = (height - fromValue) / timesHigherThanLandscape;

  return amountNeededToCenter * -1;
}

export function getPossiblePlayerHeight(height: number, isMobile: boolean) {
  // min player height = landscape size based on screen width (only for mobile, since
  // comment expansion will default to landscape view height)
  const minHeight = getMaxLandscapeHeight();
  // max player height = 80% of screen desktop, 70% mobile
  const maxPercent = isMobile ? 70 : 80;
  const maxHeight = (getScreenHeight() * maxPercent) / 100;

  const forceMaxHeight = height < maxHeight ? height : maxHeight;
  const forceMinHeight = isMobile && height < minHeight ? minHeight : forceMaxHeight;

  return forceMinHeight;
}

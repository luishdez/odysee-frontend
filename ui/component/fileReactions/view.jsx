// @flow
import * as REACTION_TYPES from 'constants/reactions';
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import Button from 'component/button';
import { formatNumberWithCommas } from 'util/number';
import NudgeFloating from 'component/nudgeFloating';
import Tooltip from 'component/common/tooltip';

const LIVE_REACTION_FETCH_MS = 1000 * 45;

type Props = {
  uri: string,
  // redux
  claimId?: string,
  channelName?: string,
  isCollection?: boolean,
  likeCount: number,
  dislikeCount: number,
  myReaction: ?string,
  isLivestreamClaim?: boolean,
  doFetchReactions: (claimId: ?string) => void,
  doReactionLike: (uri: string) => void,
  doReactionDislike: (uri: string) => void,
};

export default function FileReactions(props: Props) {
  const {
    uri,
    claimId,
    channelName,
    isCollection,
    myReaction,
    likeCount,
    dislikeCount,
    isLivestreamClaim,
    doFetchReactions,
    doReactionLike,
    doReactionDislike,
  } = props;

  const likeIcon = myReaction === REACTION_TYPES.LIKE ? ICONS.FIRE_ACTIVE : ICONS.FIRE;
  const dislikeIcon = myReaction === REACTION_TYPES.DISLIKE ? ICONS.SLIME_ACTIVE : ICONS.SLIME;

  React.useEffect(() => {
    function fetchReactions() {
      doFetchReactions(claimId);
    }

    let fetchInterval;
    if (claimId) {
      fetchReactions();

      if (isLivestreamClaim) {
        fetchInterval = setInterval(fetchReactions, LIVE_REACTION_FETCH_MS);
      }
    }

    return () => {
      if (fetchInterval) {
        clearInterval(fetchInterval);
      }
    };
  }, [claimId, doFetchReactions, isLivestreamClaim]);

  return (
    <>
      {channelName && !isCollection && (
        <NudgeFloating
          name="nudge:support-acknowledge"
          text={__('Let %channel% know you enjoyed this!', { channel: channelName })}
        />
      )}

      <Tooltip title={__('I like this')} arrow={false}>
        <div style={{ margin: '0' }}>
          <Button
            requiresAuth
            authSrc="filereaction_like"
            className={classnames('button--file-action', { 'button--fire': myReaction === REACTION_TYPES.LIKE })}
            label={
              <>
                {myReaction === REACTION_TYPES.LIKE && (
                  <>
                    <div className="button__fire-glow" />
                    <div className="button__fire-particle1" />
                    <div className="button__fire-particle2" />
                    <div className="button__fire-particle3" />
                    <div className="button__fire-particle4" />
                    <div className="button__fire-particle5" />
                    <div className="button__fire-particle6" />
                  </>
                )}
                {formatNumberWithCommas(likeCount, 0)}
              </>
            }
            iconSize={18}
            icon={likeIcon}
            onClick={() => doReactionLike(uri)}
          />
        </div>
      </Tooltip>

      <Tooltip title={__('I dislike this')} arrow={false}>
        <div style={{ margin: '0' }}>
          <Button
            requiresAuth
            authSrc={'filereaction_dislike'}
            className={classnames('button--file-action', { 'button--slime': myReaction === REACTION_TYPES.DISLIKE })}
            label={
              <>
                {myReaction === REACTION_TYPES.DISLIKE && (
                  <>
                    <div className="button__slime-stain" />
                    <div className="button__slime-drop1" />
                    <div className="button__slime-drop2" />
                  </>
                )}
                {formatNumberWithCommas(dislikeCount, 0)}
              </>
            }
            iconSize={18}
            icon={dislikeIcon}
            onClick={() => doReactionDislike(uri)}
          />
        </div>
      </Tooltip>
    </>
  );
}

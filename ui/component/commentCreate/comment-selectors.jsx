// @flow
import 'scss/component/_comment-selectors.scss';
import { EMOTES_48px as EMOTES } from 'constants/emotes';
import * as ICONS from 'constants/icons';
import Button from 'component/button';
import OptimizedImage from 'component/optimizedImage';
import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'component/common/tabs';
import CreditAmount from 'component/common/credit-amount';
import { FREE_GLOBAL_STICKERS, PAID_GLOBAL_STICKERS } from 'constants/stickers';

const buildStickerSideLink = (section: string, icon: string) => ({ section, icon });

const STICKER_SIDE_LINKS = [
  buildStickerSideLink(__('Free'), ICONS.TAG),
  buildStickerSideLink(__('Tips'), ICONS.FINANCE),
  // Future work may include Channel, Subscriptions, ...
];

type Props = {
  commentValue: string,
  pushEmote: (string) => void,
  onStickerSelect: (any) => void,
  closeSelector: () => void,
};

export default function CommentSelectors(props: Props) {
  const { commentValue, pushEmote, onStickerSelect, closeSelector } = props;

  function addEmoteToComment(emote: string) {
    pushEmote(
      commentValue + (commentValue && commentValue.charAt(commentValue.length - 1) !== ' ' ? ` ${emote} ` : `${emote} `)
    );
  }

  return (
    <Tabs>
      <TabList className="tabs__list--comment-selector">
        <Tab>{__('Emojis')}</Tab>
        <Tab>{__('Stickers')}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <EmojisPanel closeSelector={closeSelector} handleSelect={(emoteName) => addEmoteToComment(emoteName)} />
        </TabPanel>

        <TabPanel>
          <StickersPanel closeSelector={closeSelector} onStickerSelect={(emoteName) => onStickerSelect(emoteName)} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

type EmojisProps = {
  handleSelect: (emoteName: string) => void,
  closeSelector: () => void,
};

const EmojisPanel = (emojisProps: EmojisProps) => {
  const { handleSelect, closeSelector } = emojisProps;

  return (
    <div className="selector-menu">
      <Button button="close" icon={ICONS.REMOVE} onClick={closeSelector} />

      <div className="emote-selector__items">
        {EMOTES.map((emote) => {
          const emoteName = emote.name;

          return (
            <Button
              key={emoteName}
              title={emoteName}
              button="alt"
              className="button--file-action"
              onClick={() => handleSelect(emoteName)}
            >
              <OptimizedImage src={emote.url} waitLoad />
            </Button>
          );
        })}
      </div>
    </div>
  );
};

type StickersProps = {
  claimIsMine: any,
  onStickerSelect: (any) => void,
  closeSelector: () => void,
};

const StickersPanel = (stickersProps: StickersProps) => {
  const { claimIsMine, onStickerSelect, closeSelector } = stickersProps;

  function scrollToStickerSection(section: string) {
    const listBodyEl = document.querySelector('.sticker-selector__body');
    const sectionToScroll = document.getElementById(section);

    if (listBodyEl && sectionToScroll) {
      // $FlowFixMe
      listBodyEl.scrollTo({
        top: sectionToScroll.offsetTop - sectionToScroll.getBoundingClientRect().height * 2,
        behavior: 'smooth',
      });
    }
  }

  const StickerWrapper = (stickerProps: any) => {
    const { price, children } = stickerProps;

    return price ? <div className="stickerItem--paid">{children}</div> : children;
  };

  const getListRow = (rowTitle: string, rowStickers: any) => (
    <div className="sticker-selector__body-row">
      <label id={rowTitle} className="sticker-selector__row-title">
        {rowTitle}
      </label>

      <div className="sticker-selector__items">
        {rowStickers.map((sticker) => (
          <Button
            key={sticker.name}
            title={sticker.name}
            button="alt"
            className="button--file-action"
            onClick={() => onStickerSelect(sticker)}
          >
            <StickerWrapper price={sticker.price}>
              <OptimizedImage src={sticker.url} waitLoad loading="lazy" />
              {sticker.price && sticker.price > 0 && (
                <CreditAmount superChatLight amount={sticker.price} size={2} isFiat />
              )}
            </StickerWrapper>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="selector-menu--stickers">
      <Button button="close" icon={ICONS.REMOVE} onClick={closeSelector} />

      <div className="sticker-selector__main">
        <div className="sticker-selector__body">
          {getListRow(__('Free'), FREE_GLOBAL_STICKERS)}
          {!claimIsMine && getListRow(__('Tips'), PAID_GLOBAL_STICKERS)}
        </div>

        <div className="navigation__wrapper">
          <ul className="navigation-links">
            {STICKER_SIDE_LINKS.map(
              (linkProps) =>
                ((claimIsMine && linkProps.section !== 'Tips') || !claimIsMine) && (
                  <li key={linkProps.section}>
                    <Button
                      label={__(linkProps.section)}
                      title={__(linkProps.section)}
                      icon={linkProps.icon}
                      iconSize={1}
                      className="navigation-link"
                      onClick={() => scrollToStickerSection(linkProps.section)}
                    />
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

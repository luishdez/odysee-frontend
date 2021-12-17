// @flow
import { Lbryio } from 'lbryinc';
import { SITE_NAME } from 'config';
import * as ICONS from 'constants/icons';
import Button from 'component/button';
import Card from 'component/common/card';
import CardVerify from 'component/cardVerify';
import CHATS from 'constants/community_chats';
import I18nMessage from 'component/i18nMessage';
import LbcSymbol from 'component/common/lbc-symbol';
import React from 'react';

type Props = {
  errorMessage: ?string,
  isPending: boolean,
  language: string,
  fetchUser: () => void,
  onSkip: () => void,
  verifyPhone: () => void,
  verifyUserIdentity: (string) => void,
};

class UserVerify extends React.PureComponent<Props> {
  constructor() {
    super();

    (this: any).onToken = this.onToken.bind(this);
  }

  onToken(data: { id: string }) {
    this.props.verifyUserIdentity(data.id);
  }

  render() {
    const { errorMessage, isPending, language, fetchUser, onSkip, verifyPhone } = this.props;
    const englishLanguage = language === 'en';
    const communityChat = CHATS[language];

    return (
      <div className="main__auth-content">
        <section className="section__header">
          <h1 className="section__title--large">
            <I18nMessage tokens={{ lbc: <LbcSymbol size={48} /> }}>Verify to earn %lbc%</I18nMessage>
          </h1>

          <p>
            <I18nMessage
              tokens={{
                Refresh: <Button onClick={fetchUser} button="link" label={__('Refresh')} />,
                Skip: <Button onClick={onSkip} button="link" label={__('Skip')} />,
                SITE_NAME,
              }}
            >
              Verified accounts are eligible to earn LBRY Credits for views, watching and reposting content, sharing
              invite links etc. Verifying also helps us keep the %SITE_NAME% community safe too! %Refresh% or %Skip%.
            </I18nMessage>
          </p>

          <p className="help">
            {__('This step is not mandatory and not required in order for you to use %SITE_NAME%.', { SITE_NAME })}
          </p>
        </section>

        <div className="section">
          {buildSectionItem(
            ICONS.PHONE,
            __('Verify phone number'),
            __(
              'You will receive an SMS text message confirming your phone number is valid. May not be available in all regions.'
            ),
            <>
              <Button onClick={() => verifyPhone()} button="primary" label={__('Verify Via Text')} />
              <p className="help">
                {__('Standard messaging rates apply. Having trouble?')}{' '}
                <Button
                  button="link"
                  href="https://odysee.com/@OdyseeHelp:b/rewards-verification:3"
                  label={__('Read more')}
                />
                .
              </p>
            </>
          )}

          {buildSectionItem(
            ICONS.WALLET,
            __('Verify via credit card'),
            __('Your card information will not be stored or charged, now or in the future.'),
            <>
              {errorMessage && <p className="error__text">{errorMessage}</p>}
              <CardVerify
                label={__('Verify Card')}
                disabled={isPending}
                token={this.onToken}
                stripeKey={Lbryio.getStripeToken()}
              />
              <p className="help">
                {__('A $1 authorization may temporarily appear with your provider.')}{' '}
                <Button
                  button="link"
                  href="https://odysee.com/@OdyseeHelp:b/rewards-verification:3"
                  label={__('Read more')}
                />
                .
              </p>
            </>
          )}

          {buildSectionItem(
            ICONS.CHAT,
            __('Verify via chat'),
            <>
              <p>
                {__(
                  'A moderator can approve you within our discord server. Please review the instructions within #rewards-approval carefully.'
                )}
              </p>
              <p>{__('You will be asked to provide proof of identity.')}</p>
            </>,
            <Button
              href={communityChat || CHATS['en']}
              button="primary"
              label={
                englishLanguage || !communityChat ? __('Join the Foundation Chat') : __("Join the Community's Chat")
              }
            />
          )}

          <Card
            icon={ICONS.REMOVE}
            title={__('Skip')}
            subtitle={__("Verifying is optional. If you skip this, it just means you can't earn LBRY Credits.")}
            actions={<Button onClick={onSkip} button="primary" label={__('Continue Without Verifying')} />}
          />
        </div>
      </div>
    );
  }
}

function buildSectionItem(icon: string, title: string, subtitle: any, actions: any) {
  return (
    <>
      <Card icon={icon} title={title} subtitle={subtitle} actions={actions} />

      <div className="section__divider">
        <hr />
        <p>{__('OR')}</p>
      </div>
    </>
  );
}

export default UserVerify;

// @flow
import { SITE_HELP_EMAIL } from 'config';
import * as ICONS from 'constants/icons';
import * as React from 'react';
import Button from 'component/button';
import Card from 'component/common/card';
import CHATS from 'constants/community_chats';
import I18nMessage from 'component/i18nMessage';
import Page from 'component/page';

type Props = {
  language: string,
};

class HelpPage extends React.PureComponent<Props> {
  render() {
    const { language } = this.props;

    const englishLanguage = language === 'en';
    const communityChat = CHATS[language];

    return (
      <Page className="card-stack">
        <Card
          title={__('Read the FAQ')}
          subtitle={__('Our FAQ answers many common questions.')}
          actions={
            <div className="section__actions">
              <Button
                href="https://odysee.com/@OdyseeHelp:b/OdyseeBasics:c"
                label={__('Read Odysee Basics FAQ')}
                icon={ICONS.HELP}
                button="secondary"
              />
              <Button
                href="https://odysee.com/@OdyseeHelp:b"
                label={__('View all Odysee FAQs')}
                icon={ICONS.HELP}
                button="secondary"
              />
            </div>
          }
        />

        <Card
          title={__('Find assistance')}
          subtitle={
            <I18nMessage tokens={{ channel: <strong>#help</strong>, help_email: SITE_HELP_EMAIL }}>
              Live help is available most hours in the %channel% channel of our Discord chat room. Or you can always
              email us at %help_email%.
            </I18nMessage>
          }
          actions={
            <div className="section__actions">
              <Button
                button="secondary"
                label={
                  englishLanguage || !communityChat ? __('Join the Foundation Chat') : __("Join the Community's Chat")
                }
                icon={ICONS.CHAT}
                href={communityChat || CHATS['en']}
              />
              <Button button="secondary" label={__('Email Us')} icon={ICONS.WEB} href={`mailto:${SITE_HELP_EMAIL}`} />
            </div>
          }
        />

        <Card
          title={__('Report a bug or suggest something')}
          subtitle={__('Did you find something wrong? Think Odysee could add something useful and cool?')}
          actions={
            <div className="section__actions">
              <Button navigate="/$/report" label={__('Submit Feedback')} icon={ICONS.FEEDBACK} button="secondary" />
            </div>
          }
        />

        {/* Data that is not active at the moment for Odysee. Maybe could be useful for the future? */}
        {/* !SIMPLE_SITE && (
          <Card
            title={__('About --[About section in Help Page]--')}
            isBodyList
            body={
              <div className="table__wrapper">
                <table className="table table--stretch">
                  <tbody>
                    <tr>
                      <td>{__('App')}</td>
                      <td>
                        {this.state.uiVersion ? this.state.uiVersion + ' - ' : ''}
                        <Button
                          button="link"
                          label={__('Changelog')}
                          href="https://github.com/lbryio/lbry-desktop/blob/master/CHANGELOG.md"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>{__('Daemon (lbrynet)')}</td>
                      <td>{ver ? ver.lbrynet_version : __('Loading...')}</td>
                    </tr>
                    <tr>
                      <td>{__('Connected Email')}</td>
                      <td>
                        {user && user.primary_email ? (
                          <>
                            {user.primary_email}{' '}
                            <Button
                              button="link"
                              navigate={`/$/${PAGES.SETTINGS_NOTIFICATIONS}`}
                              label={__('Update mailing preferences')}
                            />
                          </>
                        ) : (
                          <>
                            <span className="empty">{__('none')} </span>
                            <Button button="link" onClick={() => doAuth()} label={__('set email')} />
                          </>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>{__('Reward Eligible')}</td>
                      <td>{user && user.is_reward_approved ? __('Yes') : __('No')}</td>
                    </tr>
                    <tr>
                      <td>{__('Platform')}</td>
                      <td>{platform}</td>
                    </tr>
                    <tr>
                      <td>{__('Installation ID')}</td>
                      <td>{this.state.lbryId}</td>
                    </tr>
                    <tr>
                      <td>{__('Access Token')}</td>
                      <td>
                        {this.state.accessTokenHidden && (
                          <Button button="link" label={__('View')} onClick={this.showAccessToken} />
                        )}
                        {!this.state.accessTokenHidden && accessToken && (
                          <div>
                            <p>{accessToken}</p>
                            <div className="help--warning">
                              {__('This is equivalent to a password. Do not post or share this.')}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
          />
          ) */}
      </Page>
    );
  }
}

export default HelpPage;

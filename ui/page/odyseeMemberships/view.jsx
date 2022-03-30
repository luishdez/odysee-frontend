/* eslint-disable no-console */
// @flow
import React from 'react';
import Page from 'component/page';
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import Button from 'component/button';
import { useHistory } from 'react-router';
import * as PAGES from 'constants/pages';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'component/common/tabs';
import { FormField } from 'component/common/form';
import { Lbryio } from 'lbryinc';
import { getStripeEnvironment } from 'util/stripe';

let stripeEnvironment = getStripeEnvironment();

const TAB_QUERY = 'tab';

const TABS = {
  CREATE_TIERS: 'tiers',
  PAYOUT: 'payout',
  BALANCE: 'balance',
  MY_MEMBERSHIPS: 'my_memberships',
};

const isDev = process.env.NODE_ENV !== 'production';

let log = (input) => {};
if (isDev) log = console.log;

type Props = {
  openModal: (string, {}) => void,
};

const MembershipsPage = (props: Props) => {

  const {
    openModal,
  } = props;

  const {
    location: { search },
    push,
  } = useHistory();

  (async function() {
    const response = await Lbryio.call(
      'account',
      'status',
      {
        environment: stripeEnvironment,
      },
      'post'
    );

    console.log(response);
    if (response.charges_enabled) {
      setHaveAlreadyConfirmedBankAccount(true);
    }
  })();

  const [haveAlreadyConfirmedBankAccount, setHaveAlreadyConfirmedBankAccount] = React.useState(false);

  const urlParams = new URLSearchParams(search);

  // if tiers are saved, then go to balance, otherwise go to tiers
  const currentView = urlParams.get(TAB_QUERY) || TABS.CREATE_TIERS;

  let tabIndex;
  switch (currentView) {
    case TABS.CREATE_TIERS:
      tabIndex = 0;
      break;
    case TABS.PAYOUT:
      tabIndex = 1;
      break;
    case TABS.BALANCE:
      tabIndex = 2;
      break;
    case TABS.MY_MEMBERSHIPS:
      tabIndex = 3;
      break;
    default:
      tabIndex = 0;
      break;
  }

  function onTabChange(newTabIndex) {
    let url = `/$/${PAGES.CREATOR_MEMBERSHIPS}?`;

    if (newTabIndex === 0) {
      url += `${TAB_QUERY}=${TABS.CREATE_TIERS}`;
    } else if (newTabIndex === 1) {
      url += `${TAB_QUERY}=${TABS.PAYOUT}`;
    } else if (newTabIndex === 2) {
      url += `${TAB_QUERY}=${TABS.BALANCE}`;
    } else if (newTabIndex === 3) {
      url += `${TAB_QUERY}=${TABS.MY_MEMBERSHIPS}`;
    }
    push(url);
  }

  let membershipTiers = [{
    displayName: 'Helping Hand',
    description: 'You\'re doing your part, thank you!',
    monthlyContributionInUSD: 5,
    perks: ['exclusiveAccess', 'badge'],
  }, {
    displayName: 'Big-Time Supporter',
    description: 'You are a true fan and are helping in a big way!',
    monthlyContributionInUSD: 10,
    perks: ['exclusiveAccess', 'earlyAccess', 'badge', 'emojis'],
  }, {
    displayName: 'Community MVP',
    description: 'Where would this creator be without you? You are a true legend!',
    monthlyContributionInUSD: 20,
    perks: ['exclusiveAccess', 'earlyAccess', 'badge', 'emojis', 'custom-badge'],
  }];

  const perkDescriptions = [{
    perkName: 'exclusiveAccess',
    perkDescription: 'You will exclusive access to members-only content',
  }, {
    perkName: 'earlyAccess',
    perkDescription: 'You will get early access to this creators content',
  }, {
    perkName: 'badge',
    perkDescription: 'You will get a generic badge showing you are a supporter of this creator',
  }, {
    perkName: 'emojis',
    perkDescription: 'You will get access to custom members-only emojis offered by the creator',
  }, {
    perkName: 'custom-badge',
    perkDescription: 'You can choose a custom badge showing you are an MVP supporter',
  }];

  const [isEditing, setIsEditing] = React.useState(false);

  const [creatorMemberships, setCreatorMemberships] = React.useState(membershipTiers);

  const [editTierDescription, setEditTierDescription] = React.useState('');

  const editMembership = function (e, tierIndex, tierDescription) {

    log(tierIndex)
    setEditTierDescription(tierDescription);
    setIsEditing(tierIndex);
  };

  const deleteMembership = function (tierIndex) {
    let membershipsBeforeDeletion = creatorMemberships;

    openModal(MODALS.CONFIRM_DELETE_MEMBERSHIP, {
      setCreatorMemberships,
      membershipsBeforeDeletion,
      tierIndex,
    });
  };

  const addMembership = function () {
    const newMembership = {
      displayName: 'New Membership Tier',
      description: 'Here\'s your 4th added tier. You can add one more.', // TODO: make this dynamic
      monthlyContributionInUSD: 5,
      perks: ['exclusiveAccess', 'badge'],
    };

    const membershipsBeforeAdded = creatorMemberships;

    membershipsBeforeAdded.push(newMembership);

    setCreatorMemberships(membershipsBeforeAdded);
  };

  const handleChange = (event) => {
    setEditTierDescription(event.target.value);
  };

  const cancelEditingMembership =  function () {
    setIsEditing(false);
  };

  function saveMembership(tierIndex) {
    const copyOfMemberships = creatorMemberships;

    const newTierName = document.querySelectorAll('input[name=tier_name]')[0]?.value;
    const newTierDescription = editTierDescription;
    const newTierMonthlyContribution = document.querySelectorAll('input[name=tier_contribution]')[0]?.value;

    let selectedPerks = [];

    for (const perkDescription of perkDescriptions){
      const odyseePerkSelected = document.getElementById(perkDescription.perkName).checked;
      if (odyseePerkSelected) {
        selectedPerks.push(perkDescription.perkName);
      }
    }

    const newObject = {
      displayName: newTierName,
      description: newTierDescription,
      monthlyContributionInUSD: newTierMonthlyContribution,
      perks: selectedPerks,
    };

    copyOfMemberships[tierIndex] = newObject;

    setCreatorMemberships(copyOfMemberships);

    setIsEditing(false);
  }

  function createEditTier(tier, membershipIndex) {
    const containsPerk = function(perk) {
      return tier.perks.indexOf(perk) > -1;
    };

    return (
      <div className="edit-div" style={{ marginBottom: '45px' }}>
        <FormField
          type="text"
          name="tier_name"
          label={__('Tier Name')}
          defaultValue={tier.displayName}
        />
        {/* could be cool to have markdown */}
        {/*<FormField*/}
        {/*  type="markdown"*/}
        {/*  name="tier_description"*/}
        {/*  label={__('Tier Description')}*/}
        {/*  placeholder={__('Description of your tier')}*/}
        {/*  value={tier.description}*/}
        {/*/>*/}
        <FormField
          type="textarea"
          rows="10"
          name="tier_description"
          label={__('Tier Description (You can also add custom benefits here)')}
          placeholder={__('Description of your tier')}
          value={editTierDescription}
          onChange={handleChange}
        />
        <label htmlFor="tier_name" style={{ marginTop: '15px', marginBottom: '8px' }}>Odysee Perks</label>
        {perkDescriptions.map((tierPerk, i) => (
          <>
            <FormField
              type="checkbox"
              defaultChecked={containsPerk(tierPerk.perkName)}
              // disabled={!optimizeAvail}
              // onChange={() => setUserOptimize(!userOptimize)}
              label={tierPerk.perkDescription}
              name={tierPerk.perkName}
            />
          </>
        ))}
        <FormField
          className="form-field--price-amount"
          type="number"
          name="tier_contribution"
          step="1"
          label={__('Monthly Contribution ($/Month)')}
          defaultValue={tier.monthlyContributionInUSD}
          onChange={(event) => parseFloat(event.target.value)}
        />
        <div className="section__actions">
          <Button button="primary" label={'Save Tier'} onClick={() => saveMembership(membershipIndex)} />
          <Button button="link" label={__('Cancel')} onClick={cancelEditingMembership} />
        </div>
      </div>
    );
  }

  const createTiers = (
    <div className="create-tiers-div">

      <div className="memberships-header" style={{ marginBottom: 'var(--spacing-xl)'}}>
        <h1 style={{ fontSize: '24px', marginBottom: 'var(--spacing-s)' }}>Create Your Membership Tiers</h1>
        <h2 style={{ fontSize: '18px' }}>Here you will be able to define the tiers that your viewers can subscribe to</h2>
      </div>

      {/* list through different tiers */}
      {creatorMemberships.map((membershipTier, membershipIndex) => (
        <>
          {isEditing === membershipIndex && (
            <>
              {createEditTier(membershipTier, membershipIndex)}
            </>
          )}
          {isEditing !== membershipIndex && (
            <div style={{ marginBottom: 'var(--spacing-xxl)'}}>
              <div style={{ marginBottom: 'var(--spacing-s)'}}>Tier Name: {membershipTier.displayName}</div>
              <h1 style={{ marginBottom: 'var(--spacing-s)'}}>{membershipTier.description}</h1>
              <h1 style={{ marginBottom: 'var(--spacing-s)'}}>Monthly Pledge: ${membershipTier.monthlyContributionInUSD}</h1>
              {membershipTier.perks.map((tierPerk, i) => (
                <>
                  <p>
                    {/* list all the perks */}
                    {perkDescriptions.map((globalPerk, i) => (
                      <>
                        {tierPerk === globalPerk.perkName && (
                          <>
                            <ul>
                              <li>
                                {globalPerk.perkDescription}
                              </li>
                            </ul>
                          </>
                        )}
                      </>
                    ))}
                  </p>
                </>
              ))}
              <div className="buttons-div" style={{ marginTop: '13px' }}>
                {/* cancel membership button */}
                <Button
                  button="alt"
                  onClick={(e) => editMembership(e, membershipIndex, membershipTier.description)}
                  className="edit-membership-button"
                  label={__('Edit Tier')}
                  icon={ICONS.EDIT}
                />
                {/* cancel membership button */}
                <Button
                  button="alt"
                  onClick={(e) => deleteMembership(membershipIndex)}
                  className="cancel-membership-button"
                  label={__('Delete Tier')}
                  icon={ICONS.DELETE}
                />
              </div>
            </div>
          )}
        </>
      ))}

      <Button
        button="alt"
        onClick={(e) => addMembership()}
        className="add-membership-button"
        label={__('Add Tier')}
        icon={ICONS.ADD}
      />
    </div>
  );

  return (
    <>
      <Page className="premium-wrapper">
        <Tabs onChange={onTabChange} index={tabIndex}>
          <TabList className="tabs__list--collection-edit-page">
            <Tab>{__('My Memberships')}</Tab>
            <Tab>{__('Create Tiers')}</Tab>
            <Tab>{__('My Pledges')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <h1 style={{ fontSize: '20px', marginTop: '20px' }}>Membership Page</h1>

              <h1 style={{ marginTop: '10px' }}>You can view your membership page as a viewer would, here: https://odysee.com/mychannelname/membership</h1>

              <h1 style={{ marginTop: '10px' }}>Click here to copy your membership page to your clipboard</h1>

              <div className="bank-account-information__div">
                <h1 style={{ fontSize: '20px', marginTop: '15px' }}>Bank Account Status</h1>
                <div className="bank-account-status__div" style={{ marginTop: '15px' }}>
                  {!haveAlreadyConfirmedBankAccount && (
                    <><h1>
                      Please go to this link and get a bank account
                    </h1></>
                  )}
                  {haveAlreadyConfirmedBankAccount && (
                    <><h1>
                      Congratulations, you have successfully linked your bank account and can receive tips and memberships
                    </h1></>
                  )}
                </div>
              </div>

              <h1 style={{ fontSize: '20px', marginTop: '20px' }}>Received Funds</h1>

              <h1 style={{ marginTop: '10px' }}> You currently have 0 supporters </h1>

              <h1 style={{ marginTop: '10px' }}> Your estimated monthly income is currently $0 </h1>

              <h1 style={{ marginTop: '10px' }}> You have received $0 total from your supporters</h1>

              <h1 style={{ marginTop: '10px' }}> You do not any withdrawable funds </h1>


            </TabPanel>
            <TabPanel>
              {createTiers}
            </TabPanel>
            <TabPanel>
              <h1 style={{ marginTop: '10px' }}> You are not currently supporting any creators </h1>

              <h1 style={{ marginTop: '10px' }}> You can find some creators to support on the membership page here </h1>
            </TabPanel>
            <TabPanel>
              <h1>My Memberships</h1>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Page>
    </>
  );
};

export default MembershipsPage;

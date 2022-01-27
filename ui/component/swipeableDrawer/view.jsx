// @flow
// $FlowFixMe
import { Global } from '@emotion/react';
// $FlowFixMe
import { grey } from '@mui/material/colors';
// $FlowFixMe
import Typography from '@mui/material/Typography';

import { HEADER_HEIGHT_MOBILE } from 'component/fileRenderMobile/view';
import { SwipeableDrawer as MUIDrawer } from '@mui/material';
import * as ICONS from 'constants/icons';
import * as React from 'react';
import Button from 'component/button';
import Icon from 'component/common/icon';
import Portal from '@mui/material/Portal';

const DRAWER_PULLER_HEIGHT = 42;

type Props = {
  children: Node,
  open: Boolean,
  theme: string,
  mobilePlayerDimensions?: { height: number },
  title: any,
  didInitialDisplay?: boolean,
  actions?: any,
  toggleDrawer: () => void,
};

export default function SwipeableDrawer(props: Props) {
  const { mobilePlayerDimensions, title, children, open, theme, didInitialDisplay, actions, toggleDrawer } = props;

  const [coverHeight, setCoverHeight] = React.useState();

  const videoHeight = coverHeight || (mobilePlayerDimensions ? mobilePlayerDimensions.height : 0);

  React.useEffect(() => {
    if (open && !mobilePlayerDimensions && !coverHeight) {
      const element = document.querySelector(`.file-page__video-container`);

      if (element) {
        const rect = element.getBoundingClientRect();
        setCoverHeight(rect.height);
      }
    }
  }, [coverHeight, mobilePlayerDimensions, open]);

  const DrawerGlobalStyles = () => (
    <Global
      styles={{
        '.main-wrapper__inner--filepage': {
          paddingBottom: didInitialDisplay ? `${DRAWER_PULLER_HEIGHT}px !important` : 'inherit',
          overflow: open ? 'hidden' : 'unset',
          maxHeight: open ? '100vh' : 'unset',
        },
        '.MuiDrawer-root': {
          top: `calc(${HEADER_HEIGHT_MOBILE}px + ${videoHeight}px) !important`,
        },
        '.MuiDrawer-root > .MuiPaper-root': {
          overflow: 'visible',
          color: 'var(--color-text)',
          position: 'absolute',
          height: `calc(100% - ${DRAWER_PULLER_HEIGHT}px)`,
        },
      }}
    />
  );

  const Puller = () => (
    <span className="swipeable-drawer__puller" style={{ backgroundColor: theme === 'light' ? grey[300] : grey[800] }} />
  );

  const HeaderContents = () => (
    <div className="swipeable-drawer__header-content">
      {title}

      <div className="swipeable-drawer__header-actions">
        {actions}

        <Button icon={ICONS.REMOVE} iconSize={16} onClick={toggleDrawer} />
      </div>
    </div>
  );

  return (
    <>
      <DrawerGlobalStyles />

      <MUIDrawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        hideBackdrop
        disableEnforceFocus
        disablePortal
        disableSwipeToOpen
        ModalProps={{ keepMounted: true }}
      >
        {didInitialDisplay && (
          <div className="swipeable-drawer__header" style={{ top: -DRAWER_PULLER_HEIGHT }}>
            {open ? (
              <>
                <Puller />

                <HeaderContents />
              </>
            ) : (
              <Portal>
                <div className="swipeable-drawer__expand" onClick={toggleDrawer}>
                  <Typography sx={{ p: 1.5, color: 'var(--color-text)' }}>{title}</Typography>
                  <Icon icon={ICONS.UP} />
                </div>
              </Portal>
            )}
          </div>
        )}

        {children}
      </MUIDrawer>
    </>
  );
}

// @flow
import { useIsMobile } from 'effects/use-screensize';
import * as ICONS from 'constants/icons';
import React from 'react';
import TextField from '@mui/material/TextField';
import Button from 'component/button';
import Zoom from '@mui/material/Zoom';

type Props = {
  params: any,
  messageValue: string,
  inputDefaultProps: any,
  inputRef: any,
  toggleSelectors: () => any,
  handleTip: (isLBC: boolean) => void,
  handleSubmit: () => any,
  handlePreventClick?: () => void,
};

const TextareaSuggestionsInput = (props: Props) => {
  const {
    params,
    messageValue,
    inputRef,
    inputDefaultProps,
    toggleSelectors,
    handleTip,
    handleSubmit,
    handlePreventClick,
  } = props;

  const isMobile = useIsMobile();

  const { InputProps, disabled, fullWidth, id, inputProps: autocompleteInputProps } = params;
  const inputProps = { ...autocompleteInputProps, ...inputDefaultProps };
  const autocompleteProps = { InputProps, disabled, fullWidth, id, inputProps };

  if (isMobile) {
    InputProps.startAdornment = (
      <Button
        icon={ICONS.STICKER}
        onClick={() => {
          if (handlePreventClick) handlePreventClick();
          toggleSelectors();
        }}
      />
    );
    InputProps.endAdornment = (
      <>
        <Button disabled={messageValue.length === 0} icon={ICONS.LBC} onClick={() => handleTip(true)} />
        <Button disabled={messageValue.length === 0} icon={ICONS.FINANCE} onClick={() => handleTip(false)} />

        <Zoom in={messageValue && messageValue.length > 0} mountOnEnter unmountOnExit>
          <div>
            <Button button="primary" icon={ICONS.SUBMIT} iconColor="red" onClick={() => handleSubmit()} />
          </div>
        </Zoom>
      </>
    );

    return (
      <TextField inputRef={inputRef} variant="outlined" multiline minRows={1} select={false} {...autocompleteProps} />
    );
  }

  return <TextField inputRef={inputRef} multiline select={false} {...autocompleteProps} />;
};

export default TextareaSuggestionsInput;

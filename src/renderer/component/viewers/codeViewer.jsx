// @flow

import React from 'react';
import CodeMirror from 'codemirror/lib/codemirror';
import { openSnippetMenu, stopContextMenu } from 'util/contextMenu';

// Addons
import 'codemirror/addon/selection/mark-selection';

// Syntax mode
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/xml/xml';

type Props = {
  theme: string,
  value: string,
  contentType: string,
};

class CodeViewer extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.codeMirror = null;
    this.textarea = React.createRef();
  }

  componentDidMount() {
    const { theme, contentType } = this.props;
    // Init CodeMirror
    this.codeMirror = CodeMirror.fromTextArea(this.textarea.current, {
      // Auto detect syntax with file contentType
      mode: contentType,
      // Adaptive theme
      theme: theme === 'dark' ? 'dark' : 'default',
      // Hide the cursor
      readOnly: true,
      // Styled text selection
      styleSelectedText: true,
      // Additional config opts
      dragDrop: false,
      lineNumbers: true,
      lineWrapping: true,
    });
    // Add events
    this.codeMirror.on('contextmenu', openSnippetMenu);
  }

  render() {
    const { value } = this.props;
    return (
      <div className="code-viewer" onContextMenu={stopContextMenu}>
        <textarea ref={this.textarea} disabled value={value} />
      </div>
    );
  }
}

export default CodeViewer;

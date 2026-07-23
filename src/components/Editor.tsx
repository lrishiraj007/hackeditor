/**
 * Editor — the main HACKEDITOR component.
 *
 * This is intentionally simple:
 * - useTextFormat hook handles all the formatting logic
 * - Toolbar component renders the buttons
 * - This file just wires them together
 */

import { useRef } from 'react';
import { useTextFormat } from '../hooks/useTextFormat';
import Toolbar from './Toolbar';
import './Editor.css';

function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { formatState, checkFormat, bold, italic, underline, align } = useTextFormat(editorRef);

  return (
    <div className="hackeditor-container">
      {/* Animated background grid */}
      <div className="bg-grid" />

      {/* Title */}
      <h1 className="hackeditor-title">HACKEDITOR</h1>

      {/* Formatting toolbar */}
      <Toolbar
        format={formatState}
        onBold={bold}
        onItalic={italic}
        onUnderline={underline}
        onAlign={align}
      />

      {/* Text editor area */}
      <div className="editor-wrapper">
        <div
          ref={editorRef}
          className="editor-area"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="type Something..."
          onKeyUp={checkFormat}
          onMouseUp={checkFormat}
          role="textbox"
          aria-multiline="true"
          aria-label="Text editor"
        />
      </div>

      {/* Status indicator */}
      <div className="status-bar">
        <span className="status-dot" />
        <span className="status-text">Ready</span>
      </div>
    </div>
  );
}

export default Editor;

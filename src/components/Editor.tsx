import React, { useRef, useCallback, useState, useMemo } from 'react';
import './Editor.css';

type Alignment = 'left' | 'center' | 'right';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: Alignment;
}

// ═══════════════════════════════════════════════════════════════
//  DOM Utility Functions (modern replacements for execCommand)
// ═══════════════════════════════════════════════════════════════

/**
 * Walk up from `node` looking for an ancestor whose tag is in `tags`,
 * stopping at `boundary`. Returns the match or null.
 */
function findFormatAncestor(
  node: Node | null,
  tags: string[],
  boundary: HTMLElement,
): HTMLElement | null {
  let cur = node;
  while (cur && cur !== boundary) {
    if (cur instanceof HTMLElement && tags.includes(cur.tagName)) {
      return cur;
    }
    cur = cur.parentNode;
  }
  return null;
}

/**
 * Replace an element with its own children (unwrap).
 */
function unwrapElement(el: HTMLElement): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
  parent.normalize(); // merge adjacent text nodes
}

/**
 * Toggle an inline format using the Selection & Range API.
 *
 * - If the cursor/selection is inside a matching tag → unwrap it.
 * - If nothing is selected → insert an empty wrapper so the next
 *   typed characters inherit the format.
 * - If text is selected → wrap it in the tag.
 */
function toggleInlineFormat(
  tagName: string,
  checkTags: string[],
  editorEl: HTMLElement,
): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const ancestor = findFormatAncestor(sel.anchorNode, checkTags, editorEl);

  if (ancestor) {
    // ── Remove the format ──
    unwrapElement(ancestor);
  } else if (range.collapsed) {
    // ── No selection: place cursor inside an empty format wrapper ──
    const wrapper = document.createElement(tagName);
    wrapper.textContent = '\u200B'; // zero-width space
    range.insertNode(wrapper);

    const newRange = document.createRange();
    newRange.setStart(wrapper.firstChild!, 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    // ── Wrap the selected text ──
    const wrapper = document.createElement(tagName);
    try {
      range.surroundContents(wrapper);
    } catch {
      // surroundContents throws when the range partially selects
      // a non-Text node; fall back to extract + re-insert.
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
    // Re-select the wrapped content
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);
  }
}

// ── Block-level helpers ──

const BLOCK_TAGS = new Set([
  'DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'BLOCKQUOTE', 'SECTION', 'ARTICLE',
]);

function getBlockParent(node: Node | null, boundary: HTMLElement): HTMLElement {
  let cur = node;
  while (cur && cur !== boundary) {
    if (cur instanceof HTMLElement && BLOCK_TAGS.has(cur.tagName)) {
      return cur;
    }
    cur = cur.parentNode;
  }
  return boundary;
}

function setTextAlignment(align: Alignment, editorEl: HTMLElement): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const block = getBlockParent(sel.anchorNode, editorEl);
  block.style.textAlign = align === 'left' ? '' : align;
}

// ── State detection helpers ──

function isFormatActive(tags: string[], editorEl: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.anchorNode) return false;
  return findFormatAncestor(sel.anchorNode, tags, editorEl) !== null;
}

function detectAlignment(editorEl: HTMLElement): Alignment {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'left';

  let node: Node | null = sel.anchorNode;
  while (node && node !== editorEl) {
    if (node instanceof HTMLElement) {
      const ta = window.getComputedStyle(node).textAlign;
      if (ta === 'center') return 'center';
      if (ta === 'right' || ta === 'end') return 'right';
    }
    node = node.parentNode;
  }
  return 'left';
}


// ═══════════════════════════════════════════════
//  Memoized sub-components (prevent re-renders)
// ═══════════════════════════════════════════════

const EditorArea = React.memo(
  React.forwardRef<HTMLDivElement, { onSelectionChange: () => void }>(
    ({ onSelectionChange }, ref) => (
      <div className="editor-wrapper">
        <div
          ref={ref}
          className="editor-area"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="type Something..."
          onKeyUp={onSelectionChange}
          onMouseUp={onSelectionChange}
          role="textbox"
          aria-multiline="true"
          aria-label="Text editor"
        />
      </div>
    ),
  ),
  () => true, // never re-render; contentEditable manages its own DOM
);
EditorArea.displayName = 'EditorArea';

const ToolbarButton = React.memo<{
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}>(({ isActive, onClick, title, children }) => (
  <button
    className={`toolbar-btn${isActive ? ' active' : ''}`}
    onMouseDown={(e) => {
      e.preventDefault(); // keep focus in the editor
      onClick();
    }}
    title={title}
    aria-label={title}
  >
    {children}
  </button>
));
ToolbarButton.displayName = 'ToolbarButton';


// ═══════════════════════════
//  Main Editor Component
// ═══════════════════════════

const Editor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<FormatState>({
    bold: false, italic: false, underline: false, align: 'left',
  });

  const [formatState, setFormatState] = useState<FormatState>({
    bold: false, italic: false, underline: false, align: 'left',
  });

  /** Read current format from the DOM; only setState when values change. */
  const syncFormatState = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const bold = isFormatActive(['B', 'STRONG'], el);
    const italic = isFormatActive(['I', 'EM'], el);
    const underline = isFormatActive(['U'], el);
    const align = detectAlignment(el);

    const prev = formatRef.current;
    if (
      prev.bold !== bold ||
      prev.italic !== italic ||
      prev.underline !== underline ||
      prev.align !== align
    ) {
      const next = { bold, italic, underline, align };
      formatRef.current = next;
      setFormatState(next);
    }
  }, []);

  // ── Format handlers ──

  const handleBold = useCallback(() => {
    if (!editorRef.current) return;
    toggleInlineFormat('strong', ['B', 'STRONG'], editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const handleItalic = useCallback(() => {
    if (!editorRef.current) return;
    toggleInlineFormat('em', ['I', 'EM'], editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const handleUnderline = useCallback(() => {
    if (!editorRef.current) return;
    toggleInlineFormat('u', ['U'], editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const handleAlignLeft = useCallback(() => {
    if (!editorRef.current) return;
    setTextAlignment('left', editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const handleAlignCenter = useCallback(() => {
    if (!editorRef.current) return;
    setTextAlignment('center', editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const handleAlignRight = useCallback(() => {
    if (!editorRef.current) return;
    setTextAlignment('right', editorRef.current);
    syncFormatState();
  }, [syncFormatState]);

  const onSelectionChange = useCallback(() => {
    syncFormatState();
  }, [syncFormatState]);

  // ── Static SVG icons ──

  const alignLeftIcon = useMemo(() => (
    <span className="btn-icon align-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </span>
  ), []);

  const alignCenterIcon = useMemo(() => (
    <span className="btn-icon align-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </span>
  ), []);

  const alignRightIcon = useMemo(() => (
    <span className="btn-icon align-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </span>
  ), []);

  return (
    <div className="hackeditor-container">
      <div className="bg-grid" />

      <h1 className="hackeditor-title">HACKEDITOR</h1>

      <div className="toolbar">
        <div className="toolbar-inner">
          <ToolbarButton isActive={formatState.bold} onClick={handleBold} title="Bold">
            <span className="btn-icon bold-icon">B</span>
          </ToolbarButton>

          <ToolbarButton isActive={formatState.italic} onClick={handleItalic} title="Italic">
            <span className="btn-icon italic-icon">I</span>
          </ToolbarButton>

          <ToolbarButton isActive={formatState.underline} onClick={handleUnderline} title="Underline">
            <span className="btn-icon underline-icon">U</span>
          </ToolbarButton>

          <div className="toolbar-divider" />

          <ToolbarButton isActive={formatState.align === 'left'} onClick={handleAlignLeft} title="Align Left">
            {alignLeftIcon}
          </ToolbarButton>

          <ToolbarButton isActive={formatState.align === 'center'} onClick={handleAlignCenter} title="Align Center">
            {alignCenterIcon}
          </ToolbarButton>

          <ToolbarButton isActive={formatState.align === 'right'} onClick={handleAlignRight} title="Align Right">
            {alignRightIcon}
          </ToolbarButton>
        </div>
      </div>

      <EditorArea ref={editorRef} onSelectionChange={onSelectionChange} />

      <div className="status-bar">
        <span className="status-dot" />
        <span className="status-text">Ready</span>
      </div>
    </div>
  );
};

export default Editor;

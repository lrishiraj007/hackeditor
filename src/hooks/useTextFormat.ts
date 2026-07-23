// useTextFormat — handles bold, italic, underline, alignment
// Uses the Selection/Range API (the modern way, no deprecated stuff)

import { useRef, useState, useCallback } from 'react';

export type Alignment = 'left' | 'center' | 'right';

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: Alignment;
}

export function useTextFormat(editorRef: React.RefObject<HTMLDivElement | null>) {
  const prev = useRef<FormatState>({ bold: false, italic: false, underline: false, align: 'left' });
  const [formatState, setFormatState] = useState<FormatState>(prev.current);

  // Look at the current cursor position and figure out what formats are active.
  // We only call setFormatState if something changed — that's what prevents lag.
  const checkFormat = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;

    // Walk up from cursor to see if we're inside <b>, <strong>, <em>, <i>, <u>
    const bold = isInsideTag(sel.anchorNode, ['B', 'STRONG'], editor);
    const italic = isInsideTag(sel.anchorNode, ['I', 'EM'], editor);
    const underline = isInsideTag(sel.anchorNode, ['U'], editor);
    const align = getAlignment(sel.anchorNode, editor);

    // Don't re-render if nothing changed
    const p = prev.current;
    if (p.bold === bold && p.italic === italic && p.underline === underline && p.align === align) return;

    const next = { bold, italic, underline, align };
    prev.current = next;
    setFormatState(next);
  }, [editorRef]);

  // Toggle bold / italic / underline
  const bold = useCallback(() => toggle('strong', ['B', 'STRONG']), []);
  const italic = useCallback(() => toggle('em', ['I', 'EM']), []);
  const underline = useCallback(() => toggle('u', ['U']), []);

  // Set alignment on the block that contains the cursor
  const align = useCallback((direction: Alignment) => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;

    const block = getBlockParent(sel.anchorNode, editor);
    block.style.textAlign = direction === 'left' ? '' : direction;
    checkFormat();
  }, [editorRef, checkFormat]);

  // The core toggle logic — pretty straightforward:
  // 1. Already inside that tag? → remove it
  // 2. Have text selected? → wrap it in the tag
  // 3. Just a cursor, no selection? → insert an empty tag so next typed chars get the format
  function toggle(tag: string, matchTags: string[]) {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // Check if the cursor is already inside this format
    const existingTag = findParentTag(sel.anchorNode, matchTags, editor);

    if (existingTag) {
      // Already formatted — remove the tag but keep the text
      const parent = existingTag.parentNode!;
      while (existingTag.firstChild) {
        parent.insertBefore(existingTag.firstChild, existingTag);
      }
      parent.removeChild(existingTag);
      parent.normalize(); // clean up split text nodes

    } else if (!range.collapsed) {
      // Text is selected — wrap it
      const wrapper = document.createElement(tag);
      try {
        range.surroundContents(wrapper);
      } catch {
        // This can fail if selection crosses element boundaries
        const fragment = range.extractContents();
        wrapper.appendChild(fragment);
        range.insertNode(wrapper);
      }
      // Re-select what we wrapped
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.addRange(newRange);

    } else {
      // No selection — put cursor inside an empty tag
      // so whatever the user types next will be formatted
      const wrapper = document.createElement(tag);
      wrapper.textContent = '\u200B'; // invisible character so the element isn't empty
      range.insertNode(wrapper);
      // Move cursor to the end of the wrapper
      const newRange = document.createRange();
      newRange.setStart(wrapper.firstChild!, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    checkFormat();
  }

  return { formatState, checkFormat, bold, italic, underline, align };
}


// --- Simple helper functions ---

// Check if a node is inside a tag like <strong>, <em>, etc.
// Just walks up the DOM tree until we hit the editor boundary.
function isInsideTag(node: Node | null, tags: string[], stopAt: HTMLElement): boolean {
  return findParentTag(node, tags, stopAt) !== null;
}

// Find the closest parent element matching one of the given tag names.
function findParentTag(node: Node | null, tags: string[], stopAt: HTMLElement): HTMLElement | null {
  let current = node;
  while (current && current !== stopAt) {
    if (current instanceof HTMLElement && tags.includes(current.tagName)) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

// Figure out the text alignment at the cursor by checking computed styles.
function getAlignment(node: Node | null, stopAt: HTMLElement): Alignment {
  let current = node;
  while (current && current !== stopAt) {
    if (current instanceof HTMLElement) {
      const align = window.getComputedStyle(current).textAlign;
      if (align === 'center') return 'center';
      if (align === 'right' || align === 'end') return 'right';
    }
    current = current.parentNode;
  }
  return 'left';
}

// Find the nearest block element (div, p, heading, etc.) that contains the cursor.
function getBlockParent(node: Node | null, stopAt: HTMLElement): HTMLElement {
  const blockTags = ['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
  let current = node;
  while (current && current !== stopAt) {
    if (current instanceof HTMLElement && blockTags.includes(current.tagName)) {
      return current;
    }
    current = current.parentNode;
  }
  return stopAt; // fallback: the editor div itself is a block
}

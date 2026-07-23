/**
 * Toolbar — the formatting buttons row.
 *
 * Each button uses onMouseDown + preventDefault so clicking
 * a button doesn't steal focus from the editor.
 */

import React from 'react';
import type { Alignment, FormatState } from '../hooks/useTextFormat';

// ─── SVG icons for alignment buttons ───

const AlignLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ─── Single toolbar button ───

interface ButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ active, onClick, title, children }: ButtonProps) {
  return (
    <button
      className={`toolbar-btn${active ? ' active' : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

// ─── Full toolbar ───

interface ToolbarProps {
  format: FormatState;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onAlign: (dir: Alignment) => void;
}

function Toolbar({ format, onBold, onItalic, onUnderline, onAlign }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        {/* Text style buttons */}
        <ToolbarButton active={format.bold} onClick={onBold} title="Bold">
          <span className="btn-icon bold-icon">B</span>
        </ToolbarButton>

        <ToolbarButton active={format.italic} onClick={onItalic} title="Italic">
          <span className="btn-icon italic-icon">I</span>
        </ToolbarButton>

        <ToolbarButton active={format.underline} onClick={onUnderline} title="Underline">
          <span className="btn-icon underline-icon">U</span>
        </ToolbarButton>

        <div className="toolbar-divider" />

        {/* Alignment buttons */}
        <ToolbarButton active={format.align === 'left'} onClick={() => onAlign('left')} title="Align Left">
          <span className="btn-icon align-icon"><AlignLeftIcon /></span>
        </ToolbarButton>

        <ToolbarButton active={format.align === 'center'} onClick={() => onAlign('center')} title="Align Center">
          <span className="btn-icon align-icon"><AlignCenterIcon /></span>
        </ToolbarButton>

        <ToolbarButton active={format.align === 'right'} onClick={() => onAlign('right')} title="Align Right">
          <span className="btn-icon align-icon"><AlignRightIcon /></span>
        </ToolbarButton>
      </div>
    </div>
  );
}

export default Toolbar;

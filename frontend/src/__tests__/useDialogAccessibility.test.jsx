import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

const DialogHarness = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    onClose();
    setIsOpen(false);
  };
  const dialogRef = useDialogAccessibility(isOpen, handleClose);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open dialog</button>
      {isOpen && (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex="-1">
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </div>
      )}
    </>
  );
};

describe('useDialogAccessibility', () => {
  it('moves focus into the dialog, traps Tab, closes on Escape and restores focus', () => {
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);

    const opener = screen.getByRole('button', { name: 'Open dialog' });
    opener.focus();
    fireEvent.click(opener);

    const firstAction = screen.getByRole('button', { name: 'First action' });
    const lastAction = screen.getByRole('button', { name: 'Last action' });
    expect(firstAction).toHaveFocus();

    fireEvent.keyDown(firstAction, { key: 'Tab', shiftKey: true });
    expect(lastAction).toHaveFocus();

    fireEvent.keyDown(lastAction, { key: 'Tab' });
    expect(firstAction).toHaveFocus();

    fireEvent.keyDown(firstAction, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    expect(opener).toHaveFocus();
  });
});

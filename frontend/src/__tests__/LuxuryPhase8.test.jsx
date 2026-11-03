import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Luxury Phase L8 Tests - Comprehensive Regression & Responsive Polish', () => {
  const customCssPath = path.resolve(__dirname, '../styles/custom.css');
  const tokensPath = path.resolve(__dirname, '../styles/luxury-tokens.css');
  const customCssContent = fs.readFileSync(customCssPath, 'utf-8');
  const tokensContent = fs.readFileSync(tokensPath, 'utf-8');

  it('TCL8.1 - custom.css defines responsive media queries for mobile and tablet breakpoints', () => {
    expect(customCssContent).toContain('@media (max-width: 720px)');
    expect(customCssContent).toContain('@media (min-width: 721px) and (max-width: 1100px)');
  });

  it('TCL8.2 - custom.css respects prefers-reduced-motion preferences', () => {
    expect(customCssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(customCssContent).toContain('transform: none !important');
  });

  it('TCL8.3 - custom.css defines visible focus ring for accessibility with gold accent', () => {
    expect(customCssContent).toContain('*:focus-visible');
    expect(customCssContent).toContain('var(--dp-color-accent)');
    expect(customCssContent).toContain('outline-offset');
  });

  it('TCL8.4 - Full regression verification: tokens, grounds, buttons, and rules are intact', () => {
    // Authoritative colors
    expect(tokensContent).toContain('--dp-color-ground: #f3eee4');
    expect(tokensContent).toContain('--dp-color-ground-2: #e4dbcc');
    expect(tokensContent).toContain('--dp-color-field: #262321');
    expect(tokensContent).toContain('--dp-color-accent: #b69355');
    expect(tokensContent).toContain('--dp-color-rule: #d5cab8');

    // Square corner policy
    expect(tokensContent).toContain('--dp-radius-control: 0px');

    // Shell classes
    expect(customCssContent).toContain('.luxury-navbar');
    expect(customCssContent).toContain('.luxury-footer');
    expect(customCssContent).toContain('.ruled-row');
    expect(customCssContent).toContain('.gold-underline');
  });
});


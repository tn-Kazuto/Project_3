import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Luxury Phase L1 Tests - Tokens, Fonts & Global Reset', () => {
  const tokensPath = path.resolve(__dirname, '../styles/luxury-tokens.css');
  const customCssPath = path.resolve(__dirname, '../styles/custom.css');
  const indexHtmlPath = path.resolve(__dirname, '../../index.html');

  it('TCL1.1 - index.html loads EB Garamond and Instrument Sans from Google Fonts', () => {
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
    expect(htmlContent).toContain('EB+Garamond');
    expect(htmlContent).toContain('Instrument+Sans');
  });

  it('TCL1.2 - luxury-tokens.css defines authoritative color tokens', () => {
    const tokensContent = fs.readFileSync(tokensPath, 'utf-8');
    expect(tokensContent).toContain('--dp-color-ground: #f3eee4');
    expect(tokensContent).toContain('--dp-color-ground-2: #e4dbcc');
    expect(tokensContent).toContain('--dp-color-ink: #262321');
    expect(tokensContent).toContain('--dp-color-field: #262321');
    expect(tokensContent).toContain('--dp-color-accent: #b69355');
    expect(tokensContent).toContain('--dp-color-rule: #d5cab8');
  });

  it('TCL1.3 - luxury-tokens.css defines typography and square corner tokens', () => {
    const tokensContent = fs.readFileSync(tokensPath, 'utf-8');
    expect(tokensContent).toContain('--dp-typography-serif');
    expect(tokensContent).toContain('Luxury Garamond');
    expect(tokensContent).toContain('EB Garamond');
    expect(tokensContent).toContain('--dp-typography-sans');
    expect(tokensContent).toContain('Luxury Sans');
    expect(tokensContent).toContain('Instrument Sans');
    expect(tokensContent).toContain('--dp-radius-control: 0px');
    expect(tokensContent).toContain('--dp-border-hairline: 1px');
  });

  it('TCL1.4 - custom.css imports luxury-tokens and resets controls to square corners and uppercase labels', () => {
    const customContent = fs.readFileSync(customCssPath, 'utf-8');
    expect(customContent).toContain("@import './luxury-tokens.css'");
    expect(customContent).toContain('border-radius: var(--dp-radius-control) !important');
    expect(customContent).toContain('letter-spacing: var(--dp-typography-label-tracking)');
    expect(customContent).toContain('text-transform: uppercase');
  });
});


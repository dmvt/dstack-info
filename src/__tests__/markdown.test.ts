import { describe, it, expect } from 'vitest';
import { extractHeadings, generateAnchorId } from '../utils/markdown';

describe('generateAnchorId', () => {
  it('should convert text to lowercase', () => {
    expect(generateAnchorId('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateAnchorId('Multiple Word Heading')).toBe('multiple-word-heading');
  });

  it('should remove special characters', () => {
    expect(generateAnchorId('Step 1: Configure BIOS')).toBe('step-1-configure-bios');
    expect(generateAnchorId('What is TDX?')).toBe('what-is-tdx');
    expect(generateAnchorId('Install & Configure')).toBe('install-configure');
  });

  it('should handle parentheses and brackets', () => {
    expect(generateAnchorId('Install (Optional)')).toBe('install-optional');
    expect(generateAnchorId('Step [Advanced]')).toBe('step-advanced');
  });

  it('should handle consecutive spaces', () => {
    expect(generateAnchorId('Multiple    Spaces')).toBe('multiple-spaces');
  });

  it('should remove consecutive hyphens', () => {
    expect(generateAnchorId('Word - - Word')).toBe('word-word');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateAnchorId('-Leading Hyphen')).toBe('leading-hyphen');
    expect(generateAnchorId('Trailing Hyphen-')).toBe('trailing-hyphen');
  });

  it('should handle numbers', () => {
    expect(generateAnchorId('Step 1')).toBe('step-1');
    expect(generateAnchorId('Version 2.0')).toBe('version-20');
  });

  it('should handle empty string', () => {
    expect(generateAnchorId('')).toBe('');
  });

  it('should handle underscores', () => {
    expect(generateAnchorId('snake_case_heading')).toBe('snake_case_heading');
  });
});

describe('extractHeadings', () => {
  it('should extract H2 headings', () => {
    const markdown = `
# H1 Heading
## First H2
Some content
## Second H2
More content
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(2);
    expect(headings[0]).toEqual({
      level: 2,
      text: 'First H2',
      id: 'first-h2'
    });
    expect(headings[1]).toEqual({
      level: 2,
      text: 'Second H2',
      id: 'second-h2'
    });
  });

  it('should extract H3 headings', () => {
    const markdown = `
## H2 Heading
### First H3
### Second H3
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(3);
    expect(headings[0].level).toBe(2);
    expect(headings[1].level).toBe(3);
    expect(headings[1].text).toBe('First H3');
    expect(headings[2].level).toBe(3);
    expect(headings[2].text).toBe('Second H3');
  });

  it('should ignore H1 headings', () => {
    const markdown = `
# Main Title
## Subtitle
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe('Subtitle');
  });

  it('should ignore H4+ headings', () => {
    const markdown = `
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(2);
    expect(headings[0].level).toBe(2);
    expect(headings[1].level).toBe(3);
  });

  it('should handle mixed H2 and H3 headings', () => {
    const markdown = `
## Step 1: Prerequisites
### 1.1 Hardware Requirements
### 1.2 Software Requirements
## Step 2: Installation
### 2.1 Download
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(5);
    expect(headings[0]).toEqual({
      level: 2,
      text: 'Step 1: Prerequisites',
      id: 'step-1-prerequisites'
    });
    expect(headings[1]).toEqual({
      level: 3,
      text: '1.1 Hardware Requirements',
      id: '11-hardware-requirements'
    });
    expect(headings[2].level).toBe(3);
    expect(headings[3].level).toBe(2);
    expect(headings[4].level).toBe(3);
  });

  it('should handle headings with special characters', () => {
    const markdown = `
## What is TDX?
### Why use it?
## Install & Configure
`;

    const headings = extractHeadings(markdown);

    expect(headings[0].id).toBe('what-is-tdx');
    expect(headings[1].id).toBe('why-use-it');
    expect(headings[2].id).toBe('install-configure');
  });

  it('should trim whitespace from heading text', () => {
    const markdown = `
##   Heading with spaces
###    Another heading
`;

    const headings = extractHeadings(markdown);

    expect(headings[0].text).toBe('Heading with spaces');
    expect(headings[1].text).toBe('Another heading');
  });

  it('should handle empty markdown', () => {
    const headings = extractHeadings('');
    expect(headings).toHaveLength(0);
  });

  it('should handle markdown with no headings', () => {
    const markdown = `
This is just a paragraph.
No headings here.
`;

    const headings = extractHeadings(markdown);
    expect(headings).toHaveLength(0);
  });

  it('should handle headings with inline code', () => {
    const markdown = `
## Install \`rustc\`
### Using \`cargo build\`
`;

    const headings = extractHeadings(markdown);

    expect(headings[0].text).toBe('Install `rustc`');
    expect(headings[0].id).toBe('install-rustc');
    expect(headings[1].text).toBe('Using `cargo build`');
    expect(headings[1].id).toBe('using-cargo-build');
  });

  it('should handle headings with links', () => {
    const markdown = `
## [Documentation](https://example.com)
### See [Guide](https://example.com/guide)
`;

    const headings = extractHeadings(markdown);

    expect(headings[0].text).toBe('[Documentation](https://example.com)');
    expect(headings[0].id).toBe('documentationhttpsexamplecom');
  });

  it('should preserve order of headings', () => {
    const markdown = `
## Third
## First
## Second
`;

    const headings = extractHeadings(markdown);

    expect(headings[0].text).toBe('Third');
    expect(headings[1].text).toBe('First');
    expect(headings[2].text).toBe('Second');
  });

  it('should handle real tutorial content', () => {
    const markdown = `
# TDX Hardware Verification

This tutorial covers hardware verification.

## Prerequisites

Before starting, ensure you have:

### Hardware Requirements

Your server must have:

### Software Requirements

Install the following:

## Step 1: Verify CPU Support

Run this command:

### 1.1 Check /proc/cpuinfo

Check the CPU flags:

## Step 2: Verify BIOS Settings

Access your BIOS:
`;

    const headings = extractHeadings(markdown);

    expect(headings).toHaveLength(6);
    expect(headings[0].text).toBe('Prerequisites');
    expect(headings[1].text).toBe('Hardware Requirements');
    expect(headings[2].text).toBe('Software Requirements');
    expect(headings[3].text).toBe('Step 1: Verify CPU Support');
    expect(headings[4].text).toBe('1.1 Check /proc/cpuinfo');
    expect(headings[5].text).toBe('Step 2: Verify BIOS Settings');
  });
});

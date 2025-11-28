import { describe, it, expect } from 'vitest';
import {
  capitalize,
  truncate,
  slugify,
  camelToKebab,
  kebabToCamel,
  pluralize,
  escapeHtml,
  generateId,
  isEmptyString,
  normalizeWhitespace,
} from '@/utils/string';

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('h')).toBe('H');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('only capitalizes first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World Test', 10)).toBe('Hello W...');
  });

  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('uses custom suffix', () => {
    expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world test')).toBe('hello-world-test');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify(' hello world ')).toBe('hello-world');
  });
});

describe('camelToKebab', () => {
  it('converts camelCase to kebab-case', () => {
    expect(camelToKebab('helloWorld')).toBe('hello-world');
  });

  it('handles multiple capitals', () => {
    expect(camelToKebab('helloWorldTest')).toBe('hello-world-test');
  });

  it('handles PascalCase', () => {
    expect(camelToKebab('HelloWorld')).toBe('hello-world');
  });

  it('handles already kebab-case', () => {
    expect(camelToKebab('hello-world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(camelToKebab('')).toBe('');
  });
});

describe('kebabToCamel', () => {
  it('converts kebab-case to camelCase', () => {
    expect(kebabToCamel('hello-world')).toBe('helloWorld');
  });

  it('handles multiple words', () => {
    expect(kebabToCamel('hello-world-test')).toBe('helloWorldTest');
  });

  it('handles already camelCase', () => {
    expect(kebabToCamel('helloWorld')).toBe('helloWorld');
  });

  it('handles empty string', () => {
    expect(kebabToCamel('')).toBe('');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'item', 'items')).toBe('item');
  });

  it('returns plural for count of 0', () => {
    expect(pluralize(0, 'item', 'items')).toBe('items');
  });

  it('returns plural for count > 1', () => {
    expect(pluralize(5, 'item', 'items')).toBe('items');
  });

  it('uses default plural form', () => {
    expect(pluralize(5, 'item')).toBe('items');
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#039;');
  });

  it('handles multiple characters', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    );
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('does not modify safe strings', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('generates IDs with specified length', () => {
    const id = generateId(16);
    expect(id.length).toBe(16);
  });

  it('generates IDs with default length', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates alphanumeric IDs', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

describe('isEmptyString', () => {
  it('returns true for empty string', () => {
    expect(isEmptyString('')).toBe(true);
  });

  it('returns true for whitespace only', () => {
    expect(isEmptyString('   ')).toBe(true);
    expect(isEmptyString('\t\n')).toBe(true);
  });

  it('returns false for non-empty string', () => {
    expect(isEmptyString('hello')).toBe(false);
    expect(isEmptyString(' hello ')).toBe(false);
  });

  it('handles null/undefined', () => {
    expect(isEmptyString(null as unknown as string)).toBe(true);
    expect(isEmptyString(undefined as unknown as string)).toBe(true);
  });
});

describe('normalizeWhitespace', () => {
  it('collapses multiple spaces', () => {
    expect(normalizeWhitespace('hello   world')).toBe('hello world');
  });

  it('trims leading/trailing whitespace', () => {
    expect(normalizeWhitespace('  hello world  ')).toBe('hello world');
  });

  it('normalizes tabs and newlines', () => {
    expect(normalizeWhitespace('hello\t\nworld')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(normalizeWhitespace('')).toBe('');
  });
});


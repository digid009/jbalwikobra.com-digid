import { ensureUrlProtocol } from '../utils/helpers';

describe('ensureUrlProtocol', () => {
  test('adds https:// to URL without protocol', () => {
    expect(ensureUrlProtocol('www.example.com')).toBe('https://www.example.com');
    expect(ensureUrlProtocol('example.com')).toBe('https://example.com');
    expect(ensureUrlProtocol('www.alwikobrastore.com')).toBe('https://www.alwikobrastore.com');
  });

  test('preserves existing https:// protocol', () => {
    expect(ensureUrlProtocol('https://www.example.com')).toBe('https://www.example.com');
    expect(ensureUrlProtocol('https://example.com')).toBe('https://example.com');
  });

  test('preserves existing http:// protocol', () => {
    expect(ensureUrlProtocol('http://www.example.com')).toBe('http://www.example.com');
    expect(ensureUrlProtocol('http://example.com')).toBe('http://example.com');
  });

  test('handles other protocols correctly', () => {
    expect(ensureUrlProtocol('ftp://example.com')).toBe('ftp://example.com');
    expect(ensureUrlProtocol('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  test('handles null and undefined values', () => {
    expect(ensureUrlProtocol(null)).toBe('');
    expect(ensureUrlProtocol(undefined)).toBe('');
  });

  test('handles empty string', () => {
    expect(ensureUrlProtocol('')).toBe('');
    expect(ensureUrlProtocol('   ')).toBe('');
  });

  test('trims whitespace before processing', () => {
    expect(ensureUrlProtocol('  www.example.com  ')).toBe('https://www.example.com');
    expect(ensureUrlProtocol('  https://example.com  ')).toBe('https://example.com');
  });
});

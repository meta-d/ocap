import { convertToUrlPath, replaceWhitespaceChar } from './url';

describe('convertToUrlPath', () => {
  it('should convert a title to a URL path', () => {
    const title = 'Hello World';
    const expected = 'hello-world';
    expect(convertToUrlPath(title)).toBe(expected);
  });

  it('should handle titles with special characters', () => {
    const title = 'Hello, World!';
    const expected = 'hello-world';
    expect(convertToUrlPath(title)).toBe(expected);
  });

  it('should handle titles with multiple spaces', () => {
    const title = 'Hello   World';
    const expected = 'hello-world';
    expect(convertToUrlPath(title)).toBe(expected);
  });

  it('should handle empty strings', () => {
    const title = '';
    const expected = '';
    expect(convertToUrlPath(title)).toBe(expected);
  });

  it('should handle titles with only special characters', () => {
    const title = '!@#$%^&*()';
    const expected = '';
    expect(convertToUrlPath(title)).toBe(expected);
  });
});

describe('replaceWhitespaceChar', () => {
  it('should replace spaces with underscores by default', () => {
    const value = 'Hello World';
    const expected = 'Hello_World';
    expect(replaceWhitespaceChar(value)).toBe(expected);
  });

  it('should replace spaces with a specified character', () => {
    const value = 'Hello World';
    const target = '-';
    const expected = 'Hello-World';
    expect(replaceWhitespaceChar(value, target)).toBe(expected);
  });

  it('should handle strings with multiple spaces', () => {
    const value = 'Hello   World';
    const expected = 'Hello___World';
    expect(replaceWhitespaceChar(value)).toBe(expected);
  });

  it('should handle empty strings', () => {
    const value = '';
    const expected = '';
    expect(replaceWhitespaceChar(value)).toBe(expected);
  });

  it('should handle strings with no spaces', () => {
    const value = 'HelloWorld';
    const expected = 'HelloWorld';
    expect(replaceWhitespaceChar(value)).toBe(expected);
  });
});

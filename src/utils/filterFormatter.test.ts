// @jest-environment node
import { describe, it, expect } from '@jest/globals';
import { formatFilter } from './filterFormatter';

describe('formatFilter', () => {
  it('wraps unmatched words in search: and combines with matched patterns', () => {
    expect(formatFilter('tasks that mention paint and are due this week')).toBe('7 days & search: paint');
    expect(formatFilter('urgent tasks due today')).toBe('p1 & today');
    expect(formatFilter('paint')).toBe('search: paint');
    expect(formatFilter('due tomorrow')).toBe('tomorrow');
    expect(formatFilter('paint due tomorrow')).toBe('tomorrow & search: paint');
    expect(formatFilter('high priority paint')).toBe('p1 & search: paint');
    expect(formatFilter('tasks that are due this week')).toBe('7 days');
    expect(formatFilter('mention paint')).toBe('search: paint');
  });

  it('returns Todoist syntax as-is', () => {
    expect(formatFilter('#Work & p1')).toBe('#Work & p1');
    expect(formatFilter('search: paint')).toBe('search: paint');
  });
}); 

import { describe, it, expect } from '@jest/globals';
import { formatFilter } from '../../src/utils/filterFormatter';

describe('FilterFormatter', () => {
  describe('Basic Functionality', () => {
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

  describe('Project Name Parsing', () => {
    it('should handle hardcoded project patterns', () => {
      expect(formatFilter('work project tasks')).toBe('#Work');
      expect(formatFilter('personal project urgent')).toBe('#Personal & p1');
      expect(formatFilter('inbox tasks')).toBe('#Inbox');
    });

    // These tests will initially fail - they represent our goal for dynamic project matching
    it.skip('should match actual project names from cache - Iowa MP', () => {
      // This test is skipped for now - will be implemented with dynamic project support
      expect(formatFilter('iowa mp tasks')).toBe('#🌽 Iowa MP');
      expect(formatFilter('urgent tasks in Iowa MP')).toBe('#🌽 Iowa MP & p1');
    });

    it.skip('should match actual project names from cache - Business', () => {
      // This test is skipped for now - will be implemented with dynamic project support  
      expect(formatFilter('business tasks due today')).toBe('#🤹Business & today');
      expect(formatFilter('business project high priority')).toBe('#🤹Business & p1');
    });

    it.skip('should match actual project names from cache - Household Tasks', () => {
      // This test is skipped for now - will be implemented with dynamic project support
      expect(formatFilter('household tasks')).toBe('#🪴 Household Tasks');
      expect(formatFilter('home improvement project tasks')).toBe('#🏡 Home Improvement');
    });

    it.skip('should handle project names with special characters and emojis', () => {
      // This test is skipped for now - will be implemented with dynamic project support
      expect(formatFilter('adulting project')).toBe('#👨🏻‍💼Adulting');
      expect(formatFilter('in adulting project')).toBe('#👨🏻‍💼Adulting');
    });
  });
}); 

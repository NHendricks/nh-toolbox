/**
 * Tests for PingCommand
 */

import { PingCommand } from '../commands/ping-command.js';

describe('PingCommand', () => {
  let command: PingCommand;

  beforeEach(() => {
    command = new PingCommand();
  });

  describe('execute', () => {
    it('should return pong response with timestamp', async () => {
      const result = await command.execute({});

      expect(result).toHaveProperty('result', 'Pong');
      expect(result).toHaveProperty('message', 'Pong');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include provided params in response', async () => {
      const params = { test: 'value' };
      const result = await command.execute(params);

      expect(result.params).toEqual(params);
    });

    it('should work with null params', async () => {
      const result = await command.execute(null);

      expect(result).toHaveProperty('result', 'Pong');
      expect(result.params).toBeNull();
    });

    it('should work with undefined params', async () => {
      const result = await command.execute(undefined);

      expect(result).toHaveProperty('result', 'Pong');
      expect(result.params).toBeUndefined();
    });
  });

  describe('getDescription', () => {
    it('should return a description', () => {
      const description = command.getDescription();

      expect(description).toBe(
        'Simple ping command - returns Pong with timestamp',
      );
    });
  });

  describe('getParameters', () => {
    it('should return empty parameters array', () => {
      const params = command.getParameters();

      expect(params).toEqual([]);
    });
  });
});

/**
 * Tests for CommandHandler
 */

import { CommandHandler } from '../command-handler.js';

describe('CommandHandler', () => {
  let handler: CommandHandler;

  beforeEach(() => {
    handler = new CommandHandler();
  });

  describe('execute', () => {
    it('should execute ping command', async () => {
      const result = await handler.execute('ping', {});

      expect(result).toHaveProperty('result', 'Pong');
      expect(result).toHaveProperty('timestamp');
    });

    it('should execute calculate command with add operation', async () => {
      const result = await handler.execute('calculate', {
        operation: 'add',
        a: 5,
        b: 3,
      });

      expect(result.result).toBe(8);
    });

    it('should execute command case-insensitively', async () => {
      const result = await handler.execute('PING', {});

      expect(result).toHaveProperty('result', 'Pong');
    });

    it('should throw error for unknown command', async () => {
      await expect(handler.execute('unknowncommand', {})).rejects.toThrow(
        'Unknown command: unknowncommand',
      );
    });

    it('should pass params to command', async () => {
      const params = { test: 'value', number: 42 };
      const result = await handler.execute('ping', params);

      expect(result.params).toEqual(params);
    });

    it('should handle string params', async () => {
      const result = await handler.execute(
        'calculate',
        '{"operation":"multiply","a":4,"b":5}',
      );

      expect(result.result).toBe(20);
    });

    it('should handle null params', async () => {
      const result = await handler.execute('ping', null);

      expect(result).toHaveProperty('result', 'Pong');
      expect(result.params).toBeNull();
    });
  });

  describe('listCommands', () => {
    it('should return array of command names', () => {
      const commands = handler.listCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should include default commands', () => {
      const commands = handler.listCommands();

      expect(commands).toContain('ping');
      expect(commands).toContain('calculate');
      expect(commands).toContain('help');
      expect(commands).toContain('file-operations');
    });
  });
});

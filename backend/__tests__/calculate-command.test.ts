/**
 * Tests for CalculateCommand
 */

import { CalculateCommand } from '../commands/calculate-command.js';

describe('CalculateCommand', () => {
  let command: CalculateCommand;

  beforeEach(() => {
    command = new CalculateCommand();
  });

  describe('execute - addition', () => {
    it('should add two numbers', async () => {
      const result = await command.execute({ operation: 'add', a: 5, b: 3 });

      expect(result.result).toBe(8);
      expect(result.operation).toBe('add');
      expect(result.a).toBe(5);
      expect(result.b).toBe(3);
    });

    it('should add negative numbers', async () => {
      const result = await command.execute({ operation: 'add', a: -5, b: -3 });

      expect(result.result).toBe(-8);
    });

    it('should add decimal numbers', async () => {
      const result = await command.execute({
        operation: 'add',
        a: 5.5,
        b: 3.2,
      });

      expect(result.result).toBeCloseTo(8.7);
    });
  });

  describe('execute - subtraction', () => {
    it('should subtract two numbers', async () => {
      const result = await command.execute({
        operation: 'subtract',
        a: 10,
        b: 4,
      });

      expect(result.result).toBe(6);
      expect(result.operation).toBe('subtract');
    });
  });

  describe('execute - multiplication', () => {
    it('should multiply two numbers', async () => {
      const result = await command.execute({
        operation: 'multiply',
        a: 5,
        b: 3,
      });

      expect(result.result).toBe(15);
      expect(result.operation).toBe('multiply');
    });

    it('should multiply by zero', async () => {
      const result = await command.execute({
        operation: 'multiply',
        a: 5,
        b: 0,
      });

      expect(result.result).toBe(0);
    });
  });

  describe('execute - division', () => {
    it('should divide two numbers', async () => {
      const result = await command.execute({
        operation: 'divide',
        a: 10,
        b: 2,
      });

      expect(result.result).toBe(5);
      expect(result.operation).toBe('divide');
    });

    it('should throw error on division by zero', async () => {
      await expect(
        command.execute({ operation: 'divide', a: 10, b: 0 }),
      ).rejects.toThrow('Division by zero');
    });

    it('should handle decimal division', async () => {
      const result = await command.execute({
        operation: 'divide',
        a: 10,
        b: 3,
      });

      expect(result.result).toBeCloseTo(3.333, 3);
    });
  });

  describe('execute - string number conversion', () => {
    it('should convert string numbers to numbers', async () => {
      const result = await command.execute({
        operation: 'add',
        a: '5',
        b: '3',
      });

      expect(result.result).toBe(8);
    });

    it('should throw error for invalid number strings', async () => {
      await expect(
        command.execute({ operation: 'add', a: 'abc', b: 3 }),
      ).rejects.toThrow('Parameters a and b must be valid numbers');
    });
  });

  describe('execute - JSON string parsing', () => {
    it('should parse JSON string params', async () => {
      const jsonString = '{"operation":"add","a":5,"b":3}';
      const result = await command.execute(jsonString);

      expect(result.result).toBe(8);
    });

    it('should throw error for invalid JSON', async () => {
      await expect(command.execute('invalid json')).rejects.toThrow(
        'Invalid JSON format for calculate command',
      );
    });
  });

  describe('execute - error handling', () => {
    it('should throw error for unknown operation', async () => {
      await expect(
        command.execute({ operation: 'power', a: 5, b: 3 }),
      ).rejects.toThrow('Unknown operation: power');
    });

    it('should throw error for missing params object', async () => {
      await expect(command.execute(null)).rejects.toThrow(
        'Calculate requires params as object',
      );
    });

    it('should throw error for missing a parameter', async () => {
      await expect(command.execute({ operation: 'add', b: 3 })).rejects.toThrow(
        'Parameters a and b must be valid numbers',
      );
    });

    it('should throw error for missing b parameter', async () => {
      await expect(command.execute({ operation: 'add', a: 5 })).rejects.toThrow(
        'Parameters a and b must be valid numbers',
      );
    });
  });

  describe('getDescription', () => {
    it('should return a description', () => {
      const description = command.getDescription();

      expect(description).toContain('Calculate command');
      expect(description).toContain('arithmetic');
    });
  });

  describe('getParameters', () => {
    it('should return parameter definitions', () => {
      const params = command.getParameters();

      expect(params).toHaveLength(3);
      expect(params[0].name).toBe('operation');
      expect(params[0].type).toBe('select');
      expect(params[0].options).toEqual([
        'add',
        'subtract',
        'multiply',
        'divide',
      ]);
      expect(params[1].name).toBe('a');
      expect(params[1].type).toBe('number');
      expect(params[2].name).toBe('b');
      expect(params[2].type).toBe('number');
    });
  });
});

/**
 * Tests for CommandRegistry
 */

import { ICommand } from '../commands/command-interface.js';
import { CommandRegistry } from '../commands/command-registry.js';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('constructor', () => {
    it('should register default commands', () => {
      const commands = registry.listCommands();

      expect(commands).toContain('ping');
      expect(commands).toContain('calculate');
      expect(commands).toContain('help');
      expect(commands).toContain('file-operations');
    });
  });

  describe('register', () => {
    it('should register a new command', () => {
      const mockCommand: ICommand = {
        execute: jest.fn(),
        getDescription: jest.fn().mockReturnValue('Test command'),
        getParameters: jest.fn().mockReturnValue([]),
      };

      registry.register('test', mockCommand);
      const command = registry.getCommand('test');

      expect(command).toBe(mockCommand);
    });

    it('should register commands case-insensitively', () => {
      const mockCommand: ICommand = {
        execute: jest.fn(),
        getDescription: jest.fn(),
        getParameters: jest.fn(),
      };

      registry.register('TestCommand', mockCommand);
      const command = registry.getCommand('testcommand');

      expect(command).toBe(mockCommand);
    });
  });

  describe('getCommand', () => {
    it('should retrieve ping command', () => {
      const command = registry.getCommand('ping');

      expect(command).toBeDefined();
      expect(command?.getDescription()).toContain('ping');
    });

    it('should retrieve calculate command', () => {
      const command = registry.getCommand('calculate');

      expect(command).toBeDefined();
      expect(command?.getDescription()).toContain('Calculate');
    });

    it('should return undefined for unknown command', () => {
      const command = registry.getCommand('unknown');

      expect(command).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const command1 = registry.getCommand('PING');
      const command2 = registry.getCommand('Ping');
      const command3 = registry.getCommand('ping');

      expect(command1).toBeDefined();
      expect(command2).toBeDefined();
      expect(command3).toBeDefined();
      expect(command1).toBe(command2);
      expect(command2).toBe(command3);
    });
  });

  describe('listCommands', () => {
    it('should return array of command names', () => {
      const commands = registry.listCommands();

      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should return all registered commands', () => {
      const commands = registry.listCommands();

      expect(commands).toContain('ping');
      expect(commands).toContain('calculate');
      expect(commands).toContain('help');
      expect(commands).toContain('file-operations');
    });

    it('should include custom registered commands', () => {
      const mockCommand: ICommand = {
        execute: jest.fn(),
        getDescription: jest.fn(),
        getParameters: jest.fn(),
      };

      registry.register('custom', mockCommand);
      const commands = registry.listCommands();

      expect(commands).toContain('custom');
    });
  });

  describe('getAllCommandsWithDescriptions', () => {
    it('should return object with command names and descriptions', () => {
      const commands = registry.getAllCommandsWithDescriptions();

      expect(typeof commands).toBe('object');
      expect(commands['ping']).toBeDefined();
      expect(typeof commands['ping']).toBe('string');
    });

    it('should include all default commands', () => {
      const commands = registry.getAllCommandsWithDescriptions();

      expect(commands['ping']).toContain('ping');
      expect(commands['calculate']).toContain('Calculate');
      expect(commands['help']).toContain('Help');
      expect(commands['file-operations']).toBeDefined();
    });
  });

  describe('getAllCommandsWithParameters', () => {
    it('should return object with command details', () => {
      const commands = registry.getAllCommandsWithParameters();

      expect(typeof commands).toBe('object');
      expect(commands['ping']).toBeDefined();
      expect(commands['ping'].description).toBeDefined();
      expect(commands['ping'].parameters).toBeDefined();
    });

    it('should include parameter definitions', () => {
      const commands = registry.getAllCommandsWithParameters();

      expect(Array.isArray(commands['ping'].parameters)).toBe(true);
      expect(Array.isArray(commands['calculate'].parameters)).toBe(true);
      expect(commands['calculate'].parameters.length).toBeGreaterThan(0);
    });

    it('should include description and parameters for each command', () => {
      const commands = registry.getAllCommandsWithParameters();

      for (const [name, details] of Object.entries(commands)) {
        expect(details).toHaveProperty('description');
        expect(details).toHaveProperty('parameters');
        expect(typeof details.description).toBe('string');
        expect(Array.isArray(details.parameters)).toBe(true);
      }
    });
  });
});

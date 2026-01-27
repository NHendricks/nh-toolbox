/**
 * Help Command
 * Lists all available commands with descriptions
 * Includes comprehensive documentation of file operations including ZIP support
 */

import { CommandParameter, ICommand } from './command-interface.js';
import { CommandRegistry } from './command-registry.js';

export class HelpCommand implements ICommand {
  constructor(private registry: CommandRegistry) {}

  async execute(params: any): Promise<any> {
    const commands = this.registry.getAllCommandsWithDescriptions();
    const commandsWithParams = this.registry.getAllCommandsWithParameters();

    return {
      result: commands,
      availableCommands: commands,
      commandParameters: commandsWithParams,
      usage: 'node cli.js <toolname> [params]',
      example1: 'node cli.js ping',
      example2: 'node cli.js echo "Hello World"',
      example3: 'node cli.js calculate \'{"operation":"add","a":5,"b":3}\'',
      fileOperations: this.getFileOperationsHelp(),
    };
  }

  /**
   * Get comprehensive help for all file operations including ZIP support
   */
  private getFileOperationsHelp(): any {
    return {
      description: 'File operations with ZIP archive support',
      operations: {
        list: {
          description: 'List files and directories (supports ZIP archives)',
          parameters: {
            operation: 'list',
            folderPath:
              'Path to folder or ZIP archive (e.g., "C:\\folder" or "C:\\archive.zip/internal/path")',
          },
          zipSupport: true,
          examples: [
            {
              description: 'List directory',
              folderPath: 'C:\\Users\\Documents',
            },
            { description: 'List ZIP contents', folderPath: 'C:\\archive.zip' },
            {
              description: 'List folder inside ZIP',
              folderPath: 'C:\\archive.zip/subfolder',
            },
          ],
        },
        drives: {
          description: 'List available drives (Windows)',
          parameters: {
            operation: 'drives',
          },
          zipSupport: false,
        },
        read: {
          description:
            'Read file content (supports ZIP archives, images as base64)',
          parameters: {
            operation: 'read',
            filePath:
              'Path to file (e.g., "C:\\file.txt" or "C:\\archive.zip/file.txt")',
          },
          zipSupport: true,
          examples: [
            { description: 'Read regular file', filePath: 'C:\\document.txt' },
            {
              description: 'Read from ZIP',
              filePath: 'C:\\archive.zip/document.txt',
            },
            {
              description: 'Read image (returns base64)',
              filePath: 'C:\\photo.jpg',
            },
          ],
        },
        copy: {
          description: 'Copy files/directories (supports ZIP archives)',
          parameters: {
            operation: 'copy',
            sourcePath: 'Source path',
            destinationPath: 'Destination path',
          },
          zipSupport: true,
          examples: [
            {
              description: 'Copy file',
              sourcePath: 'C:\\source.txt',
              destinationPath: 'D:\\dest.txt',
            },
            {
              description: 'Copy from ZIP',
              sourcePath: 'C:\\archive.zip/file.txt',
              destinationPath: 'D:\\file.txt',
            },
            {
              description: 'Copy to ZIP',
              sourcePath: 'C:\\file.txt',
              destinationPath: 'D:\\archive.zip/file.txt',
            },
            {
              description: 'Copy between ZIPs',
              sourcePath: 'C:\\a.zip/file.txt',
              destinationPath: 'D:\\b.zip/file.txt',
            },
          ],
        },
        move: {
          description: 'Move files or directories',
          parameters: {
            operation: 'move',
            sourcePath: 'Source path',
            destinationPath: 'Destination path',
          },
          zipSupport: false,
        },
        rename: {
          description: 'Rename files or directories',
          parameters: {
            operation: 'rename',
            sourcePath: 'Current path',
            destinationPath: 'New name (not full path)',
          },
          zipSupport: false,
        },
        delete: {
          description: 'Delete files or directories (supports ZIP archives)',
          parameters: {
            operation: 'delete',
            sourcePath: 'Path to delete',
          },
          zipSupport: true,
          examples: [
            { description: 'Delete file', sourcePath: 'C:\\file.txt' },
            { description: 'Delete directory', sourcePath: 'C:\\folder' },
            {
              description: 'Delete from ZIP',
              sourcePath: 'C:\\archive.zip/file.txt',
            },
          ],
        },
        zip: {
          description: 'Create ZIP archive from files/folders',
          parameters: {
            operation: 'zip',
            files: 'Array of file/folder paths to add',
            zipFilePath: 'Path to ZIP file to create',
          },
          zipSupport: true,
          examples: [
            {
              description: 'Create ZIP with multiple files',
              files: ['C:\\file1.txt', 'C:\\file2.txt', 'C:\\folder'],
              zipFilePath: 'C:\\output.zip',
            },
          ],
        },
        compare: {
          description: 'Compare two directories and show differences',
          parameters: {
            operation: 'compare',
            leftPath: 'First directory path',
            rightPath: 'Second directory path',
            recursive: 'true/false - compare subdirectories',
          },
          zipSupport: false,
        },
        'execute-command': {
          description: 'Execute a command in a working directory',
          parameters: {
            operation: 'execute-command',
            command: 'Command to execute',
            workingDir: 'Working directory for command',
          },
          zipSupport: false,
        },
        'execute-file': {
          description: 'Open file with default application',
          parameters: {
            operation: 'execute-file',
            filePath: 'Path to file to execute/open',
          },
          zipSupport: false,
        },
      },
      zipPathFormat: {
        description:
          'ZIP archives can be navigated using path format: "path/to/archive.zip/internal/path"',
        examples: [
          'C:\\archives\\data.zip - Access root of ZIP',
          'C:\\archives\\data.zip/folder - Access folder inside ZIP',
          'C:\\archives\\data.zip/folder/file.txt - Access file inside ZIP',
        ],
      },
    };
  }

  getDescription(): string {
    return 'Help command - lists all available commands with detailed file operations documentation';
  }

  getParameters(): CommandParameter[] {
    return []; // No parameters needed
  }
}

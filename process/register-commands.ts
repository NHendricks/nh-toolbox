import { IpcMainInvokeEvent } from 'electron';
const { app, clipboard } = require('electron');

export function registerCommands(ipcMain: any, version: string) {
  ipcMain.handle('ping', () => 'Pong');
  ipcMain.handle('getVersion', () => version);

  // Backend CLI Commands - dynamically load available commands
  ipcMain.handle('cli-getCommands', async () => {
    try {
      // Import CommandHandler directly instead of spawning process
      const path = require('path');
      const commandHandlerPath = path.join(
        __dirname,
        '../../backend/dist/command-handler.js',
      );
      const { CommandHandler } = require(commandHandlerPath);
      const handler = new CommandHandler();

      // Execute help command to get available commands
      const result = await handler.execute('help', null);

      if (result && result.availableCommands) {
        return {
          success: true,
          data: result.availableCommands,
        };
      } else {
        return { success: false, error: 'Invalid response from help command' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(
    'cli-execute',
    async (event: IpcMainInvokeEvent, toolname: string, params: any) => {
      try {
        // Import CommandHandler directly instead of spawning process
        const path = require('path');
        const commandHandlerPath = path.join(
          __dirname,
          '../../backend/dist/command-handler.js',
        );
        const { CommandHandler } = require(commandHandlerPath);
        const handler = new CommandHandler();

        // Get command instance for progress callback setup
        const command = handler.getCommand(toolname);

        // If it's a file-operations command with zip or copy operation, set up progress callback
        if (
          toolname === 'file-operations' &&
          (params.operation === 'zip' || params.operation === 'copy') &&
          command
        ) {
          const eventName =
            params.operation === 'zip' ? 'zip-progress' : 'copy-progress';

          // Set up progress callback to send events to renderer
          (command as any).setProgressCallback?.(
            (current: number, total: number, fileName: string) => {
              event.sender?.send(eventName, {
                current,
                total,
                fileName,
                percentage: Math.round((current / total) * 100),
              });
            },
          );
        }

        // Execute command directly
        const result = await handler.execute(toolname, params);

        // Clear progress callback after operation completes
        if (
          toolname === 'file-operations' &&
          (params.operation === 'zip' || params.operation === 'copy') &&
          command
        ) {
          (command as any).setProgressCallback?.(undefined);
        }

        return {
          success: true,
          data: result,
          toolname: toolname,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Clear progress callback on error
        if (
          toolname === 'file-operations' &&
          (params.operation === 'zip' || params.operation === 'copy')
        ) {
          const handler = new (require(require('path').join(
            __dirname,
            '../../backend/dist/command-handler.js',
          )).CommandHandler)();
          const command = handler.getCommand(toolname);
          if (command) {
            (command as any).setProgressCallback?.(undefined);
          }
        }

        return {
          success: false,
          error: error.message || 'Unknown error',
          toolname: toolname,
          timestamp: new Date().toISOString(),
        };
      }
    },
  );
  ipcMain.handle(
    'copy2Clipboard',
    (event: IpcMainInvokeEvent, aString: string) => {
      clipboard.writeText(aString);
    },
  );
}

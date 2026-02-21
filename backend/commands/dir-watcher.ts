import * as fs from 'fs';
import * as path from 'path';

/**
 * Watch a directory and call `onFirstFile(filePath)` when the first file
 * matching the provided extension appears. Returns the FSWatcher.
 */
export function watchDirForFirstFile(
  dir: string,
  ext: string,
  onFirstFile: (filePath: string) => void,
): fs.FSWatcher | null {
  if (!dir || !fs.existsSync(dir)) return null;

  let triggered = false;
  try {
    const watcher = fs.watch(dir, (eventType, filename) => {
      if (triggered) return;
      if (!filename) return;
      try {
        if (filename.endsWith(ext)) {
          const filePath = path.join(dir, filename);
          if (fs.existsSync(filePath)) {
            triggered = true;
            // Delay slightly to allow file to be fully written
            setTimeout(() => onFirstFile(filePath), 50);
          }
        }
      } catch (e) {
        // ignore
      }
    });
    return watcher;
  } catch (e) {
    return null;
  }
}

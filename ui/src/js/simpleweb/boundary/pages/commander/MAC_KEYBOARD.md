# macOS Keyboard Support

## Function Keys on macOS

On macOS, the function keys (F1-F12) have special system functions by default (brightness, volume, Mission Control, etc.). To use them in the Commander application, you need to press the **Fn (Function)** key along with the F-key.

### How to use shortcuts:

- **F1** (Help): Press `Fn + F1`
- **F2** (Rename): Press `Fn + F2`
- **F3** (View): Press `Fn + F3`
- **F5** (Copy): Press `Fn + F5`
- **F6** (Move): Press `Fn + F6`
- **F8** (Delete): Press `Fn + F8` or just `Delete` key
- **F9** (Create ZIP): Press `Fn + F9`
- **F10** (Settings): Press `Fn + F10`
- **Shift+F10** (Context Menu): Press `Fn + Shift + F10`
- **F12** (Compare): Press `Fn + F12`

### Alternative: Change macOS Settings

If you want to use F-keys without pressing Fn every time:

1. Open **System Settings**
2. Go to **Keyboard**
3. Click **Keyboard Shortcuts...**
4. Select **Function Keys** from the left sidebar
5. Enable **"Use F1, F2, etc. keys as standard function keys"**

After this change:

- F-keys work directly (without Fn)
- Special functions require Fn (Fn+F1 for brightness, etc.)

## Implementation Details

The KeyboardHandler uses `event.code` instead of `event.key` for function keys. This ensures that:

- Function keys are detected by their physical position
- Works consistently across different keyboard layouts
- Properly handles the Fn modifier on macOS

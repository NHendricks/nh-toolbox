/**
 * SettingsService - Handles settings export, import, and encryption
 */

const ENCRYPTION_KEY = 'nh-toolbox-settings-key'

// All localStorage keys used by the commander
const STORAGE_KEYS = [
  'commander-favorites',
  'commander-custom-apps',
  'commander-left-path',
  'commander-right-path',
  'commander-left-sort',
  'commander-right-sort',
  'ftp-connections',
] as const

export interface SettingsExport {
  version: string
  exportDate: string
  favorites: string[]
  customApplications: Record<string, Array<{ name: string; command: string }>>
  ftpConnections: Array<{
    name: string
    host: string
    port: number
    username: string
    password: string
    _encrypted?: boolean
  }>
  leftPane: {
    path: string
    sort: {
      sortBy: string
      sortDirection: string
    }
  }
  rightPane: {
    path: string
    sort: {
      sortBy: string
      sortDirection: string
    }
  }
}

export interface PaneSettings {
  currentPath: string
  sortBy: string
  sortDirection: string
}

/**
 * Simple XOR-based obfuscation for passwords in settings export
 * Not cryptographically secure, but prevents plain text passwords in JSON
 */
export function encryptPassword(password: string): string {
  let result = ''
  for (let i = 0; i < password.length; i++) {
    result += String.fromCharCode(
      password.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
    )
  }
  return btoa(result) // Base64 encode for safe JSON storage
}

/**
 * Decrypt a password that was encrypted with encryptPassword
 */
export function decryptPassword(encrypted: string): string {
  try {
    const decoded = atob(encrypted) // Base64 decode
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
      )
    }
    return result
  } catch {
    // If decryption fails, return as-is (backwards compatibility)
    return encrypted
  }
}

export class SettingsService {
  /**
   * Collect all settings into an exportable format
   */
  collectSettings(leftPane: PaneSettings, rightPane: PaneSettings): SettingsExport {
    // Safely parse custom applications
    let customApplications: Record<string, Array<{ name: string; command: string }>> = {}
    try {
      const customAppsJson = localStorage.getItem('commander-custom-apps')
      if (customAppsJson) {
        customApplications = JSON.parse(customAppsJson)
      }
    } catch (parseError) {
      console.warn('Failed to parse custom applications:', parseError)
      customApplications = {}
    }

    // Safely parse FTP connections and encrypt passwords
    let ftpConnections: SettingsExport['ftpConnections'] = []
    try {
      const ftpJson = localStorage.getItem('ftp-connections')
      if (ftpJson) {
        const connections = JSON.parse(ftpJson)
        // Encrypt passwords for export
        ftpConnections = connections.map((conn: any) => ({
          ...conn,
          password: conn.password ? encryptPassword(conn.password) : '',
          _encrypted: true, // Mark as encrypted
        }))
      }
    } catch (parseError) {
      console.warn('Failed to parse FTP connections:', parseError)
      ftpConnections = []
    }

    // Parse favorites
    let favorites: string[] = []
    try {
      const favoritesJson = localStorage.getItem('commander-favorites')
      if (favoritesJson) {
        favorites = JSON.parse(favoritesJson)
      }
    } catch (parseError) {
      console.warn('Failed to parse favorites:', parseError)
      favorites = []
    }

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      favorites,
      customApplications,
      ftpConnections,
      leftPane: {
        path: leftPane.currentPath,
        sort: {
          sortBy: leftPane.sortBy,
          sortDirection: leftPane.sortDirection,
        },
      },
      rightPane: {
        path: rightPane.currentPath,
        sort: {
          sortBy: rightPane.sortBy,
          sortDirection: rightPane.sortDirection,
        },
      },
    }
  }

  /**
   * Import settings from a parsed settings object
   * Returns true if successful
   */
  importSettings(settings: SettingsExport): { success: boolean; error?: string } {
    try {
      // Validate
      if (!settings.version) {
        return { success: false, error: 'Invalid settings file' }
      }

      // Import favorites
      if (settings.favorites) {
        localStorage.setItem('commander-favorites', JSON.stringify(settings.favorites))
      }

      // Import custom applications
      if (settings.customApplications) {
        localStorage.setItem('commander-custom-apps', JSON.stringify(settings.customApplications))
      }

      // Import pane paths
      if (settings.leftPane?.path) {
        localStorage.setItem('commander-left-path', settings.leftPane.path)
      }
      if (settings.rightPane?.path) {
        localStorage.setItem('commander-right-path', settings.rightPane.path)
      }

      // Import sort settings
      if (settings.leftPane?.sort) {
        localStorage.setItem('commander-left-sort', JSON.stringify(settings.leftPane.sort))
      }
      if (settings.rightPane?.sort) {
        localStorage.setItem('commander-right-sort', JSON.stringify(settings.rightPane.sort))
      }

      // Import FTP connections (decrypt passwords)
      if (settings.ftpConnections) {
        const decryptedConnections = settings.ftpConnections.map((conn) => ({
          ...conn,
          password: conn._encrypted ? decryptPassword(conn.password) : conn.password,
          _encrypted: undefined, // Remove the marker
        }))
        localStorage.setItem('ftp-connections', JSON.stringify(decryptedConnections))
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Clear all settings from localStorage
   */
  clearAll(): void {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  }

  /**
   * Get the default path based on platform
   */
  getDefaultPath(): string {
    // In browser context, check navigator.platform
    const isWindows =
      typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('win')
    return isWindows ? 'C:\\' : '/'
  }
}

// Singleton instance
export const settingsService = new SettingsService()

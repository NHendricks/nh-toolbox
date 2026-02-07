/**
 * Commander Module - Re-exports all components
 */

// Re-export types
export * from './commander.types.js'

// Re-export styles
export { commanderStyles } from './commander.styles.js'

// Re-export utilities from file-utils (original file)
export * from './utils/file-utils.js'

// Re-export additional path utilities (non-conflicting exports)
export {
  maskFtpPassword,
  isRootPath,
  getPathSeparator,
  getFileName,
  joinPath,
  isFtpPath,
} from './utils/PathUtils.js'

// Re-export additional format utilities (non-conflicting exports)
export { formatDate, formatShortDate, formatNumber } from './utils/FormatUtils.js'

// Re-export sort utilities (non-conflicting exports)
export { getNextSortState } from './utils/SortUtils.js'
export type { SortField, SortDirection } from './utils/SortUtils.js'

// Re-export services
export { FileService } from './services/FileService.js'
export { HistoryService } from './services/HistoryService.js'
export { PaneManager } from './services/PaneManager.js'
export { FavoritesService, favoritesService } from './services/FavoritesService.js'
export { settingsService, encryptPassword, decryptPassword } from './services/SettingsService.js'
export type { SettingsExport, PaneSettings } from './services/SettingsService.js'
export * from './services/FileOperationsHandler.js'

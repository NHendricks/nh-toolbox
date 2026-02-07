/**
 * SortUtils - Utility functions for sorting file items
 */

import type { FileItem } from '../commander.types.js'

export type SortField = 'name' | 'size' | 'modified' | 'extension'
export type SortDirection = 'asc' | 'desc'

/**
 * Sort file items by the specified field and direction
 * Directories are always sorted before files
 * Parent directory (..) is always first
 */
export function sortItems(
  items: FileItem[],
  sortBy: SortField,
  sortDirection: SortDirection,
): FileItem[] {
  return [...items].sort((a, b) => {
    // Parent directory always comes first
    if (a.name === '..') return -1
    if (b.name === '..') return 1

    // Directories come before files
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1

    // Apply sort based on field
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: 'base',
        })
        break

      case 'size':
        comparison = a.size - b.size
        break

      case 'modified':
        const aTime = a.modified instanceof Date ? a.modified.getTime() : 0
        const bTime = b.modified instanceof Date ? b.modified.getTime() : 0
        comparison = aTime - bTime
        break

      case 'extension':
        const aExt = a.isDirectory
          ? ''
          : (a.name.split('.').pop()?.toLowerCase() || '')
        const bExt = b.isDirectory
          ? ''
          : (b.name.split('.').pop()?.toLowerCase() || '')
        comparison = aExt.localeCompare(bExt)
        // If same extension, sort by name
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          })
        }
        break
    }

    // Apply direction
    return sortDirection === 'asc' ? comparison : -comparison
  })
}

/**
 * Get the next sort state when clicking a sort button
 * If already sorted by this field, toggle direction
 * Otherwise, start with ascending
 */
export function getNextSortState(
  currentSortBy: SortField,
  currentDirection: SortDirection,
  newSortBy: SortField,
): { sortBy: SortField; sortDirection: SortDirection } {
  if (currentSortBy === newSortBy) {
    // Toggle direction
    return {
      sortBy: newSortBy,
      sortDirection: currentDirection === 'asc' ? 'desc' : 'asc',
    }
  } else {
    // New field, start with ascending
    return {
      sortBy: newSortBy,
      sortDirection: 'asc',
    }
  }
}

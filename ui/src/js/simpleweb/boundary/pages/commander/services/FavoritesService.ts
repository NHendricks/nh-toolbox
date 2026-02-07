/**
 * FavoritesService - Manages favorite paths
 */

const STORAGE_KEY = 'commander-favorites'

export class FavoritesService {
  private favoritePaths: string[] = []
  private onChangeCallback?: (paths: string[]) => void

  constructor() {
    this.load()
  }

  /**
   * Set a callback to be notified when favorites change
   */
  onChange(callback: (paths: string[]) => void): void {
    this.onChangeCallback = callback
  }

  /**
   * Load favorites from localStorage
   */
  load(): string[] {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        this.favoritePaths = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        this.favoritePaths = []
      }
    }
    return this.favoritePaths
  }

  /**
   * Save favorites to localStorage
   */
  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favoritePaths))
    this.onChangeCallback?.(this.favoritePaths)
  }

  /**
   * Get all favorite paths
   */
  getAll(): string[] {
    return [...this.favoritePaths]
  }

  /**
   * Toggle a path as favorite (add if not exists, remove if exists)
   * Returns true if added, false if removed
   */
  toggle(path: string): { added: boolean; message: string } {
    const index = this.favoritePaths.indexOf(path)
    if (index >= 0) {
      // Remove from favorites
      this.favoritePaths = this.favoritePaths.filter((_, i) => i !== index)
      this.save()
      return { added: false, message: `Removed from favorites: ${path}` }
    } else {
      // Add to favorites
      this.favoritePaths = [...this.favoritePaths, path]
      this.save()
      return { added: true, message: `Added to favorites: ${path}` }
    }
  }

  /**
   * Add a path to favorites if not already present
   * Returns true if added, false if already exists
   */
  add(path: string): boolean {
    if (!this.favoritePaths.includes(path)) {
      this.favoritePaths = [...this.favoritePaths, path]
      this.save()
      return true
    }
    return false
  }

  /**
   * Remove a path from favorites
   * Returns true if removed, false if not found
   */
  remove(path: string): boolean {
    const index = this.favoritePaths.indexOf(path)
    if (index >= 0) {
      this.favoritePaths = this.favoritePaths.filter((_, i) => i !== index)
      this.save()
      return true
    }
    return false
  }

  /**
   * Check if a path is a favorite
   */
  isFavorite(path: string): boolean {
    return this.favoritePaths.includes(path)
  }

  /**
   * Clear all favorites
   */
  clear(): void {
    this.favoritePaths = []
    this.save()
  }

  /**
   * Set all favorites (used for import)
   */
  setAll(paths: string[]): void {
    this.favoritePaths = [...paths]
    this.save()
  }
}

// Singleton instance for easy access
export const favoritesService = new FavoritesService()

import { LitElement, css, html } from 'lit'
import { property } from 'lit/decorators.js'

export class SettingsDialog extends LitElement {
  @property({ type: Boolean })
  open = false

  static styles = css`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: #1e293b;
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      padding: 1.5rem;
      min-width: 500px;
      max-width: 600px;
      max-height: 80vh;
      color: white;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #334155;
      flex-shrink: 0;
    }

    .dialog-title {
      font-size: 1.1rem;
      font-weight: bold;
      flex: 1;
    }

    .dialog-content {
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      padding-top: 1rem;
    }

    .close-button {
      background: #475569;
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .close-button:hover {
      background: #64748b;
    }

    .section {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #334155;
      border-radius: 6px;
    }

    .section-title {
      font-weight: bold;
      margin-bottom: 0.75rem;
      color: #0ea5e9;
      font-size: 1rem;
    }

    .section-description {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-button {
      background: #0ea5e9;
      border: none;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .action-button:hover {
      background: #0284c7;
    }

    .action-button.danger {
      background: #dc2626;
    }

    .action-button.danger:hover {
      background: #b91c1c;
    }

    .action-button.secondary {
      background: #475569;
    }

    .action-button.secondary:hover {
      background: #64748b;
    }

    .file-input {
      display: none;
    }

    .info-box {
      background: #1e3a5f;
      border-left: 4px solid #0ea5e9;
      padding: 0.75rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .warning-box {
      background: #7c2d12;
      border-left: 4px solid #f97316;
      padding: 0.75rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #fed7aa;
    }

    .settings-list {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      font-size: 0.875rem;
      color: #cbd5e1;
    }

    .settings-list li {
      padding: 0.25rem 0;
      padding-left: 1.25rem;
      position: relative;
    }

    .settings-list li:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #0ea5e9;
      font-weight: bold;
    }
  `

  private handleClose() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  private async handleExport() {
    this.dispatchEvent(new CustomEvent('export'))
  }

  private handleImportClick() {
    const input = this.shadowRoot?.querySelector(
      '#import-file-input',
    ) as HTMLInputElement
    input?.click()
  }

  private async handleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      this.dispatchEvent(
        new CustomEvent('import', {
          detail: file,
        }),
      )
    }

    // Reset input so same file can be selected again
    input.value = ''
  }

  private handleClearAll() {
    if (
      confirm(
        'Are you sure you want to clear ALL settings? This action cannot be undone.\n\nAll favorites, custom applications, and preferences will be reset.',
      )
    ) {
      this.dispatchEvent(new CustomEvent('clear-all'))
    }
  }

  render() {
    if (!this.open) return null

    return html`
      <div class="overlay" @click=${this.handleClose}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <span class="dialog-title">⚙️ Settings Management</span>
            <button class="close-button" @click=${this.handleClose}>
              Close
            </button>
          </div>

          <div class="dialog-content">
            <!-- Export Section -->
            <div class="section">
              <div class="section-title">📤 Export Settings</div>
              <div class="section-description">
                Export all your personal settings to a JSON file. This includes:
              </div>
              <ul class="settings-list">
                <li>Favorite paths</li>
                <li>Custom application associations</li>
                <li>Pane paths and sort preferences</li>
              </ul>
              <div class="button-group">
                <button class="action-button" @click=${this.handleExport}>
                  📥 Export to File
                </button>
              </div>
              <div class="info-box">
                💡 Exported settings can be imported on another machine or used
                as a backup.
              </div>
            </div>

            <!-- Import Section -->
            <div class="section">
              <div class="section-title">📥 Import Settings</div>
              <div class="section-description">
                Import settings from a previously exported JSON file. This will
                merge with or replace your current settings.
              </div>
              <div class="button-group">
                <button
                  class="action-button secondary"
                  @click=${this.handleImportClick}
                >
                  📂 Choose File to Import
                </button>
              </div>
              <input
                type="file"
                id="import-file-input"
                class="file-input"
                accept=".json"
                @change=${this.handleFileSelected}
              />
              <div class="warning-box">
                ⚠️ Importing will overwrite existing settings. Consider
                exporting your current settings first as a backup.
              </div>
            </div>

            <!-- Clear Settings Section -->
            <div class="section">
              <div class="section-title">🗑️ Reset All Settings</div>
              <div class="section-description">
                Clear all saved settings and return to default configuration.
              </div>
              <div class="button-group">
                <button
                  class="action-button danger"
                  @click=${this.handleClearAll}
                >
                  Clear All Settings
                </button>
              </div>
              <div class="warning-box">
                ⚠️ This action cannot be undone! All favorites, custom
                applications, and preferences will be permanently deleted.
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-dialog': SettingsDialog
  }
}

customElements.define('settings-dialog', SettingsDialog)

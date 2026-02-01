import { LitElement, html, css } from 'lit'
import { property } from 'lit/decorators.js'

export class SettingsDialog extends LitElement {
  @property({ type: Boolean }) open = false

  static styles = css`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog {
      background: #1e293b;
      border-radius: 8px;
      padding: 1.5rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      color: white;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #475569;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .close-button {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .close-button:hover {
      background: #334155;
      color: white;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section {
      padding: 1rem;
      background: #0f172a;
      border-radius: 6px;
      border: 1px solid #334155;
    }

    .section-title {
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #cbd5e1;
      font-size: 0.95rem;
    }

    .section-description {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .button {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: none;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      font-weight: 500;
    }

    .button-primary {
      background: #0ea5e9;
      color: white;
    }

    .button-primary:hover {
      background: #0284c7;
    }

    .button-secondary {
      background: #475569;
      color: white;
    }

    .button-secondary:hover {
      background: #64748b;
    }

    .button-danger {
      background: #dc2626;
      color: white;
    }

    .button-danger:hover {
      background: #b91c1c;
    }

    .file-input {
      display: none;
    }

    .file-input-label {
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 2px dashed #475569;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #cbd5e1;
      background: #0f172a;
    }

    .file-input-label:hover {
      border-color: #0ea5e9;
      background: #1e293b;
      color: white;
    }

    .settings-list {
      font-size: 0.85rem;
      color: #94a3b8;
      padding-left: 1.25rem;
      margin: 0.5rem 0;
    }

    .settings-list li {
      margin: 0.25rem 0;
    }
  `

  handleExport() {
    this.dispatchEvent(new CustomEvent('export'))
  }

  handleImportClick() {
    const input = this.shadowRoot?.querySelector(
      '#import-input',
    ) as HTMLInputElement
    input?.click()
  }

  handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      this.dispatchEvent(new CustomEvent('import', { detail: file }))
      // Reset input
      input.value = ''
    }
  }

  handleClearAll() {
    if (
      confirm(
        'Möchten Sie wirklich ALLE Einstellungen löschen?\n\nDies umfasst:\n- Favoriten\n- Eigene Anwendungen\n- Pfade\n- Sortiereinstellungen\n\nDieser Vorgang kann nicht rückgängig gemacht werden!',
      )
    ) {
      this.dispatchEvent(new CustomEvent('clear-all'))
    }
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    if (!this.open) return html``

    return html`
      <div class="overlay" @click=${this.handleClose}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">⚙️ Einstellungen</div>
            <button class="close-button" @click=${this.handleClose}>×</button>
          </div>

          <div class="dialog-content">
            <!-- Export Section -->
            <div class="section">
              <div class="section-title">📤 export</div>
              <div class="section-description"></div>
              <button class="button button-primary" @click=${this.handleExport}>
                export
              </button>
            </div>

            <!-- Import Section -->
            <div class="section">
              <div class="section-title">📥 import</div>
              <input
                type="file"
                id="import-input"
                class="file-input"
                accept=".json"
                @change=${this.handleFileSelected}
              />
              <label
                for="import-input"
                class="file-input-label"
                @click=${this.handleImportClick}
              >
                📁 import
              </label>
            </div>

            <!-- Clear All Section -->
            <div class="section">
              <div class="section-title">🗑️ remove all private settings</div>
              <button
                class="button button-danger"
                @click=${this.handleClearAll}
              >
                back to default
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('settings-dialog', SettingsDialog)

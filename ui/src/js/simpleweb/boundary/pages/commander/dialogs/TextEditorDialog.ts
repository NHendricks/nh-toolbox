import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '../../../components/SimpleDialog'

@customElement('text-editor-dialog')
export class TextEditorDialog extends LitElement {
  static styles = css`
    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0.5rem;
    }
    .editor-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #0f172a;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }
    .file-path {
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .modified-indicator {
      color: #f59e0b;
      font-weight: bold;
      margin-left: 1rem;
    }
    .editor-textarea {
      flex: 1;
      width: 100%;
      min-height: 400px;
      background: #0f172a;
      border: 2px solid #475569;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      padding: 1rem;
      border-radius: 4px;
      resize: vertical;
      box-sizing: border-box;
    }
    .editor-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .dialog-buttons {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      justify-content: flex-end;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .btn-save {
      background: #059669;
      color: #fff;
    }
    .btn-save:hover {
      background: #047857;
    }
    .btn-save:disabled {
      background: #475569;
      cursor: not-allowed;
    }
    .btn-cancel {
      background: #475569;
      color: #fff;
    }
    .btn-cancel:hover {
      background: #64748b;
    }
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #475569;
      border-top-color: #0ea5e9;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .loading-text {
      color: #cbd5e1;
    }
    .error-message {
      color: #ef4444;
      padding: 1rem;
      background: #1e293b;
      border: 1px solid #ef4444;
      border-radius: 4px;
      margin: 1rem;
    }
  `

  @property({ type: String }) filePath = ''
  @property({ type: String }) fileName = ''
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean }) saving = false
  @property({ type: String }) error = ''
  @property({ type: String }) content = ''

  @state() private editedContent = ''
  @state() private isModified = false

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('content')) {
      this.editedContent = this.content
      this.isModified = false
    }
  }

  private handleContentChange(e: Event) {
    const textarea = e.target as HTMLTextAreaElement
    this.editedContent = textarea.value
    this.isModified = this.editedContent !== this.content
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      if (this.isModified && !this.saving) {
        this.save()
      }
    }
    // ESC to close (only if not modified, otherwise ask)
    if (e.key === 'Escape') {
      e.preventDefault()
      this.close()
    }
    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      textarea.value = value.substring(0, start) + '  ' + value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
      this.editedContent = textarea.value
      this.isModified = this.editedContent !== this.content
    }
  }

  private save() {
    this.dispatchEvent(
      new CustomEvent('save', {
        detail: { content: this.editedContent },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private close() {
    if (this.isModified) {
      if (
        confirm('You have unsaved changes. Are you sure you want to close?')
      ) {
        this.dispatchEvent(new CustomEvent('close'))
      }
    } else {
      this.dispatchEvent(new CustomEvent('close'))
    }
  }

  render() {
    return html`
      <simple-dialog
        .open=${true}
        .title=${'Edit: ' + this.fileName}
        .width=${'90%'}
        .maxHeight=${'90vh'}
        @dialog-close=${this.close}
      >
        <div class="editor-container" style="position: relative;">
          ${this.loading || this.saving
            ? html`
                <div class="loading-overlay">
                  <div class="spinner"></div>
                  <div class="loading-text">
                    ${this.loading ? 'Loading file...' : 'Saving file...'}
                  </div>
                </div>
              `
            : ''}
          ${this.error
            ? html`<div class="error-message">${this.error}</div>`
            : ''}

          <div class="editor-info">
            <span class="file-path" title="${this.filePath}"
              >${this.filePath}</span
            >
            ${this.isModified
              ? html`<span class="modified-indicator">Modified</span>`
              : ''}
          </div>

          <textarea
            class="editor-textarea"
            .value=${this.editedContent}
            @input=${this.handleContentChange}
            @keydown=${this.handleKeyDown}
            ?disabled=${this.loading || this.saving}
            spellcheck="false"
          ></textarea>
        </div>

        <div slot="footer" class="dialog-buttons">
          <button class="btn btn-cancel" @click=${this.close}>
            Cancel (ESC)
          </button>
          <button
            class="btn btn-save"
            @click=${this.save}
            ?disabled=${!this.isModified || this.saving}
          >
            Save (Ctrl+S)
          </button>
        </div>
      </simple-dialog>
    `
  }
}

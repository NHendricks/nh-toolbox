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
      gap: 0.5rem;
      position: relative;
    }

    .editor-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
    }

    .search-bar {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      align-items: center;
    }

    .search-bar input {
      flex: 1;
      background: #0f172a;
      border: 1px solid #475569;
      color: #e2e8f0;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      font-family: inherit;
    }

    .search-bar button {
      background: #334155;
      border: none;
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      min-width: 60px;
    }

    .search-bar button:hover {
      background: #475569;
    }

    .search-bar button.active {
      background: #0ea5e9;
    }

    .search-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .search-info {
      color: #94a3b8;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .editor-wrapper {
      position: relative;
      flex: 1;
      min-height: 0;
    }

    .highlight-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 1rem;
      border: 2px solid transparent;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow: hidden;
      pointer-events: none;
      color: transparent;
      box-sizing: border-box;
    }

    .highlight-layer mark {
      background: #facc15;
      color: transparent;
      border-radius: 2px;
    }

    .highlight-layer mark.current {
      background: #f97316;
    }

    .editor-textarea {
      position: relative;
      width: 100%;
      height: 100%;
      background: transparent;
      border: 2px solid #475569;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      padding: 1rem;
      border-radius: 4px;
      resize: none;
      box-sizing: border-box;
    }

    .editor-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
    }

    .dialog-buttons {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .btn-save {
      background: #059669;
      color: #fff;
    }

    .btn-save:disabled {
      background: #475569;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #475569;
      color: #fff;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 10;
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

    .error-message {
      color: #ef4444;
      padding: 0.5rem;
      background: #1e293b;
      border: 1px solid #ef4444;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
  `

  @property() filePath = ''
  @property() fileName = ''
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean }) saving = false
  @property() error = ''
  @property() content = ''

  @state() private editedContent = ''
  @state() private isModified = false
  @state() private showSearch = false
  @state() private searchQuery = ''
  @state() private replaceQuery = ''
  @state() private useRegex = false
  @state() private caseSensitive = false
  @state() private searchMatches = 0
  @state() private currentMatchIndex = -1

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('keydown', this.handleWindowKeyDown)
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this.handleWindowKeyDown)
    super.disconnectedCallback()
  }

  private handleWindowKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close()
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      if (this.isModified) this.save()
    }
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault()
      this.showSearch = true
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('content')) {
      this.editedContent = this.content
      this.isModified = false
    }
  }

  private updateSearchMatches() {
    if (!this.searchQuery) {
      this.searchMatches = 0
      this.currentMatchIndex = -1
      this.requestUpdate()
      return
    }

    try {
      const flags = this.caseSensitive ? 'g' : 'gi'
      const regex = this.useRegex
        ? new RegExp(this.searchQuery, flags)
        : new RegExp(
            this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            flags,
          )

      const matches = this.editedContent.match(regex)
      this.searchMatches = matches ? matches.length : 0
      this.currentMatchIndex = this.searchMatches > 0 ? 0 : -1
      this.requestUpdate()
    } catch (e) {
      this.searchMatches = 0
      this.currentMatchIndex = -1
      this.requestUpdate()
    }
  }

  private getHighlightedContent(): string {
    if (!this.searchQuery) return this.escapeHtml(this.editedContent)

    try {
      const flags = this.caseSensitive ? 'g' : 'gi'
      const regex = this.useRegex
        ? new RegExp(this.searchQuery, flags)
        : new RegExp(
            this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            flags,
          )

      let matchIndex = 0
      const highlighted = this.editedContent.replace(regex, (match) => {
        const className = matchIndex === this.currentMatchIndex ? 'current' : ''
        matchIndex++
        return `<mark class="${className}">${this.escapeHtml(match)}</mark>`
      })

      return highlighted
    } catch (e) {
      return this.escapeHtml(this.editedContent)
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  private syncScroll(e: Event) {
    const textarea = e.target as HTMLTextAreaElement
    const highlightLayer = this.shadowRoot?.querySelector(
      '.highlight-layer',
    ) as HTMLElement
    if (highlightLayer) {
      highlightLayer.scrollTop = textarea.scrollTop
      highlightLayer.scrollLeft = textarea.scrollLeft
    }
  }

  private findNext() {
    if (!this.searchQuery || this.searchMatches === 0) return

    const textarea = this.shadowRoot?.querySelector(
      '.editor-textarea',
    ) as HTMLTextAreaElement
    if (!textarea) return

    const flags = this.caseSensitive ? 'g' : 'gi'
    const regex = this.useRegex
      ? new RegExp(this.searchQuery, flags)
      : new RegExp(
          this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          flags,
        )

    const matches = [...this.editedContent.matchAll(regex)]
    if (matches.length === 0) return

    this.currentMatchIndex = (this.currentMatchIndex + 1) % matches.length
    this.requestUpdate()

    const match = matches[this.currentMatchIndex]

    if (match.index !== undefined) {
      textarea.focus()
      textarea.setSelectionRange(match.index, match.index + match[0].length)

      // Scroll to match
      const lineHeight = 1.5 * 0.9 // line-height * font-size in rem
      const linesBeforeMatch = this.editedContent
        .substring(0, match.index)
        .split('\n').length
      const scrollPosition = (linesBeforeMatch - 5) * lineHeight * 16 // Convert rem to px
      textarea.scrollTop = Math.max(0, scrollPosition)

      // Sync highlight layer
      this.syncScroll({ target: textarea } as any)
    }
  }

  private findPrevious() {
    if (!this.searchQuery || this.searchMatches === 0) return

    const textarea = this.shadowRoot?.querySelector(
      '.editor-textarea',
    ) as HTMLTextAreaElement
    if (!textarea) return

    const flags = this.caseSensitive ? 'g' : 'gi'
    const regex = this.useRegex
      ? new RegExp(this.searchQuery, flags)
      : new RegExp(
          this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          flags,
        )

    const matches = [...this.editedContent.matchAll(regex)]
    if (matches.length === 0) return

    this.currentMatchIndex =
      (this.currentMatchIndex - 1 + matches.length) % matches.length
    this.requestUpdate()

    const match = matches[this.currentMatchIndex]

    if (match.index !== undefined) {
      textarea.focus()
      textarea.setSelectionRange(match.index, match.index + match[0].length)

      // Scroll to match
      const lineHeight = 1.5 * 0.9
      const linesBeforeMatch = this.editedContent
        .substring(0, match.index)
        .split('\n').length
      const scrollPosition = (linesBeforeMatch - 5) * lineHeight * 16
      textarea.scrollTop = Math.max(0, scrollPosition)

      // Sync highlight layer
      this.syncScroll({ target: textarea } as any)
    }
  }

  private replaceNext() {
    if (!this.searchQuery || this.searchMatches === 0) return

    const textarea = this.shadowRoot?.querySelector(
      '.editor-textarea',
    ) as HTMLTextAreaElement
    if (!textarea) return

    const flags = this.caseSensitive ? 'g' : 'gi'
    const regex = this.useRegex
      ? new RegExp(this.searchQuery, flags)
      : new RegExp(
          this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          flags,
        )

    const matches = [...this.editedContent.matchAll(regex)]
    if (matches.length === 0 || this.currentMatchIndex < 0) return

    const match = matches[this.currentMatchIndex]
    if (match.index !== undefined) {
      this.editedContent =
        this.editedContent.substring(0, match.index) +
        this.replaceQuery +
        this.editedContent.substring(match.index + match[0].length)
      this.isModified = true
      this.updateSearchMatches()
      this.requestUpdate()
    }
  }

  private replaceAll() {
    if (!this.searchQuery || this.searchMatches === 0) return

    try {
      const flags = this.caseSensitive ? 'g' : 'gi'
      const regex = this.useRegex
        ? new RegExp(this.searchQuery, flags)
        : new RegExp(
            this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            flags,
          )

      this.editedContent = this.editedContent.replace(regex, this.replaceQuery)
      this.isModified = true
      this.updateSearchMatches()
      this.requestUpdate()
    } catch (e) {
      console.error('Replace all error:', e)
    }
  }

  private handleSearchInput(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value
    this.updateSearchMatches()
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
    if (this.isModified && !confirm('Discard unsaved changes?')) return
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`
      <simple-dialog
        .open=${true}
        .title=${'Edit: ' + this.fileName}
        .width=${'90%'}
        .height=${'90vh'}
        @dialog-close=${this.close}
      >
        <div class="editor-container">
          ${this.loading || this.saving
            ? html`
                <div class="loading-overlay">
                  <div class="spinner"></div>
                </div>
              `
            : null}
          ${this.error
            ? html`<div class="error-message">${this.error}</div>`
            : null}

          <div class="editor-info">
            <span class="file-path">${this.filePath}</span>
            <button
              class="btn"
              @click=${() => (this.showSearch = !this.showSearch)}
            >
              🔍 Find & Replace
            </button>
            ${this.isModified
              ? html`<span class="modified-indicator">Modified</span>`
              : null}
          </div>

          ${this.showSearch
            ? html`
                <div class="search-bar">
                  <input
                    placeholder="Find"
                    .value=${this.searchQuery}
                    @input=${this.handleSearchInput}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        e.shiftKey ? this.findPrevious() : this.findNext()
                      }
                    }}
                  />
                  <input
                    placeholder="Replace"
                    .value=${this.replaceQuery}
                    @input=${(e: Event) =>
                      (this.replaceQuery = (
                        e.target as HTMLInputElement
                      ).value)}
                    @keydown=${(e: KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        this.replaceNext()
                      }
                    }}
                  />
                  <div class="search-controls">
                    <span class="search-info">
                      ${this.searchMatches > 0
                        ? `${this.currentMatchIndex + 1}/${this.searchMatches}`
                        : this.searchQuery
                          ? '0 matches'
                          : ''}
                    </span>
                    <button
                      @click=${this.findPrevious}
                      title="Previous (Shift+Enter)"
                    >
                      ↑
                    </button>
                    <button @click=${this.findNext} title="Next (Enter)">
                      ↓
                    </button>
                    <button
                      class=${this.useRegex ? 'active' : ''}
                      @click=${() => {
                        this.useRegex = !this.useRegex
                        this.updateSearchMatches()
                      }}
                      title="Use Regular Expression"
                    >
                      .*
                    </button>
                    <button
                      class=${this.caseSensitive ? 'active' : ''}
                      @click=${() => {
                        this.caseSensitive = !this.caseSensitive
                        this.updateSearchMatches()
                      }}
                      title="Case Sensitive"
                    >
                      Aa
                    </button>
                    <button @click=${this.replaceNext} title="Replace">
                      Replace
                    </button>
                    <button @click=${this.replaceAll} title="Replace All">
                      All
                    </button>
                  </div>
                </div>
              `
            : null}

          <div class="editor-wrapper">
            <div
              class="highlight-layer"
              .innerHTML=${this.getHighlightedContent()}
            ></div>
            <textarea
              class="editor-textarea"
              .value=${this.editedContent}
              @input=${(e: Event) => {
                this.editedContent = (e.target as HTMLTextAreaElement).value
                this.isModified = true
                if (this.searchQuery) {
                  this.updateSearchMatches()
                }
              }}
              @scroll=${this.syncScroll}
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div slot="footer" class="dialog-buttons">
          <button class="btn btn-cancel" @click=${this.close}>
            Cancel (ESC)
          </button>
          <button
            class="btn btn-save"
            ?disabled=${!this.isModified || this.saving}
            @click=${this.save}
          >
            Save (Ctrl+S)
          </button>
        </div>
      </simple-dialog>
    `
  }
}

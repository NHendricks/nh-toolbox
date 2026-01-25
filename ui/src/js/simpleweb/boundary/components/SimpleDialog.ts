import { LitElement, css, html } from 'lit'
import { property } from 'lit/decorators.js'

export class SimpleDialog extends LitElement {
  static styles = css`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: #1e293b;
      border: 2px solid #0ea5e9;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dialog-header {
      background: #0ea5e9;
      padding: 1rem;
      font-weight: bold;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-title {
      font-size: 1.1rem;
    }

    .dialog-close {
      background: #dc2626;
      border: none;
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .dialog-close:hover {
      background: #b91c1c;
    }

    .dialog-content {
      flex: 1;
      overflow: auto;
      padding: 1rem;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'Courier New', monospace;
    }

    .dialog-footer {
      background: #334155;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      color: #94a3b8;
    }
  `

  @property({ type: Boolean })
  open = false

  @property({ type: String })
  title = ''

  @property({ type: String })
  width = '600px'

  @property({ type: String })
  height = 'auto'

  @property({ type: String })
  maxHeight = '80vh'

  @property({ type: Boolean })
  showCloseButton = true

  handleOverlayClick(e: Event) {
    if (e.target === e.currentTarget) {
      this.close()
    }
  }

  close() {
    this.dispatchEvent(new CustomEvent('dialog-close'))
  }

  render() {
    if (!this.open) return null

    return html`
      <div class="dialog-overlay" @click=${this.handleOverlayClick}>
        <div
          class="dialog"
          style="width: ${this.width}; height: ${this
            .height}; max-height: ${this.maxHeight};"
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="dialog-header">
            <span class="dialog-title">${this.title}</span>
            ${this.showCloseButton
              ? html`
                  <button class="dialog-close" @click=${this.close}>
                    ESC - Schließen
                  </button>
                `
              : ''}
            <slot name="header-actions"></slot>
          </div>
          <div class="dialog-content">
            <slot></slot>
          </div>
          ${this.hasFooterSlot()
            ? html`
                <div class="dialog-footer">
                  <slot name="footer"></slot>
                </div>
              `
            : ''}
        </div>
      </div>
    `
  }

  private hasFooterSlot(): boolean {
    const slot = this.querySelector('[slot="footer"]')
    return slot !== null
  }
}

customElements.define('simple-dialog', SimpleDialog)

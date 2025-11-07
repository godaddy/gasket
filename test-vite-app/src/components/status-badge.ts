/**
 * Custom Web Component - Status Badge
 * 
 * This is a vanilla Web Component (no framework needed)
 * Works in any environment: React, Vue, plain HTML, etc.
 */

class StatusBadge extends HTMLElement {
  static get observedAttributes() {
    return ['status', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const status = this.getAttribute('status') || 'unknown';
    const label = this.getAttribute('label') || 'Status';

    const colors: Record<string, { bg: string; border: string; text: string }> = {
      success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
      warning: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
      error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
      info: { bg: '#f0f9ff', border: '#3b82f6', text: '#1e40af' },
      unknown: { bg: '#f3f4f6', border: '#d1d5db', text: '#374151' }
    };

    const color = colors[status] || colors.unknown;

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: ${color.bg};
          border: 2px solid ${color.border};
          border-radius: 8px;
          color: ${color.text};
          font-family: system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
        }
        
        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${color.border};
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
      
      <div class="badge">
        <span class="indicator"></span>
        <span>${label}: ${status}</span>
      </div>
    `;
  }
}

// Register the custom element
if (!customElements.get('status-badge')) {
  customElements.define('status-badge', StatusBadge);
}

export default StatusBadge;


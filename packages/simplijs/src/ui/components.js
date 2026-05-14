import { component } from '../component.js';
import { html } from '../renderer.js';
import { reactive, watch } from '../reactive.js';

/**
 * Official SimpliJS UI Component Kit
 * Lightweight, unstyled but functional components
 */
export const registerUI = () => {
  // s-button
  component('s-button', (el, props) => {
    return {
      render: () => html`<button type="${props.type || 'button'}" class="s-btn s-btn-${props.variant || 'primary'}">
        <slot></slot>
      </button>`
    };
  });

  // s-modal
  component('s-modal', (el, props) => {
    const state = reactive({ open: props.open === 'true' || !!props.open });
    
    // Sync prop changes back to internal state
    watch(() => props.open, (val) => {
      state.open = val === 'true' || !!val;
    });

    return {
      open: state.open,
      render: () => html`
        <div class="s-modal-overlay" s-show="open" @click="open = false" 
             style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
           <div class="s-modal-content" @click.stop="" 
                style="background:white; padding:20px; border-radius:8px; min-width:300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <header style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; margin-bottom:10px; padding-bottom:10px;">
                <h3 style="margin:0;">${props.title || ''}</h3>
                <button @click="open = false" style="border:none; background:none; cursor:pointer; font-size:1.5rem;">&times;</button>
              </header>
              <article><slot></slot></article>
           </div>
        </div>
      `
    };
  });

  // s-table
  component('s-table', (el, props) => {
    return {
      render: () => {
        const items = props.items || [];
        const columns = props.columns || [];
        return html`
          <table class="s-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #eee;">
                ${columns.map(col => html`<th style="padding:10px; text-align:left;">${col.label || col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${items.map(item => html`
                <tr style="border-bottom:1px solid #eee;">
                  ${columns.map(col => html`<td style="padding:10px;">${item[col.key || col]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    };
  });
};

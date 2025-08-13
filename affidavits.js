// Affidavits Manager (EnteAkshaya)
// Renders affidavit cards from GAS Web App: GET ?type=affidavits
// Uses same card/grid styles as your Services section.
function toDirectDownload(url) {
  if (!url) return '';
  const cleaned = String(url).trim();
  try {
    const u = new URL(cleaned);

    // Only rewrite Google Drive links
    if (/drive\.google\.com/i.test(u.hostname)) {
      // Case 1: /file/d/FILE_ID/view
      const m1 = u.pathname.match(/\/file\/d\/([^/]+)/i);
      if (m1 && m1[1]) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;

      // Case 2: ?id=FILE_ID (open?id=... or uc?id=...)
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
    return cleaned;
  } catch {
    // If new URL() fails, still return trimmed string
    return cleaned;
  }
}

function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

class AffidavitsManager {
  constructor({ apiUrl }) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    // Elements
    this.gridEl = document.querySelector('#affidavitsGrid');
    this.searchEl = document.querySelector('#affidavitSearch');
    this.catWrap = document.querySelector('#affidavitTabs'); // optional tabs container

    if (!this.gridEl) return; // not on page
    // Data state
    this.data = [];
    this.filtered = [];
    this.activeCategory = 'all';

    this.init();
  }

  async init() {
    await this.load();
    this.buildCategories();
    this.bindUI();
    this.render();
  }

  async load() {
    try {
      const res = await fetch(`${this.apiUrl}?type=affidavits`, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json() || [];
      this.filtered = [...this.data];
    } catch (e) {
      console.error('Affidavits load failed', e);
      this.data = [];
      this.filtered = [];
    }
  }

  buildCategories() {
    if (!this.catWrap) return;
    const cats = Array.from(new Set(this.data.map(x => (x.Category || 'Others'))));
    const frag = document.createDocumentFragment();

    // "All" tab
    frag.appendChild(this.makeTab_('all', 'All', true));

    // Category tabs
    cats.sort().forEach(c => frag.appendChild(this.makeTab_(c.toLowerCase(), c)));

    this.catWrap.innerHTML = '';
    this.catWrap.appendChild(frag);
  }

  makeTab_(value, label, active = false) {
    const btn = document.createElement('button');
    btn.className = `services-tab${active ? ' active' : ''}`;
    btn.type = 'button';
    btn.dataset.value = value;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      this.activeCategory = value;
      Array.from(this.catWrap.children).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.applyFilters();
    });
    return btn;
  }

  bindUI() {
    if (this.searchEl) {
      this.searchEl.addEventListener('input', () => this.applyFilters());
    }
  }

  applyFilters() {
    const q = (this.searchEl?.value || '').toLowerCase().trim();
    const cat = this.activeCategory;

    this.filtered = this.data.filter(item => {
      const inCat =
        cat === 'all' ||
        (item.Category && item.Category.toLowerCase() === cat);
      const blob = `${item.Title} ${item.Description} ${item.Tags}`.toLowerCase();
      const inSearch = !q || blob.includes(q);
      return inCat && inSearch;
    });

    this.render();
  }

  render() {
    if (!this.gridEl) return;

    if (!this.filtered.length) {
      this.gridEl.innerHTML = `<div class="empty-state">No affidavits found.</div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    this.filtered.forEach(item => frag.appendChild(this.card_(item)));
    this.gridEl.innerHTML = '';
    this.gridEl.appendChild(frag);
  }


  card_(item) {
    const card = document.createElement('div');
    card.className = 'service-card affidavit-card';

    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.innerHTML = `<i class="${(item.Icon || 'fas fa-file-pdf').trim()}"></i>`;

    const title = document.createElement('h3');
    title.className = 'service-title';
    title.textContent = item.Title || 'Affidavit';

    const desc = document.createElement('p');
    desc.className = 'service-short-description';
    desc.textContent = item.Description || '';

    const meta = document.createElement('div');
    meta.className = 'service-meta';
    meta.innerHTML = item.Category ? `<span class="badge">${escapeHtml_(item.Category)}</span>` : '';

    // Normalize URL (also handles Drive links)
    const rawUrl = (item.FileURL || '').trim();
    const fileUrl = toDirectDownload(rawUrl);
    const hasLink = /^https?:\/\//i.test(fileUrl);   // simpler, more tolerant

    // Debug once in console so you can verify mapping
    console.debug('[Affidavit link]', item.Title, { rawUrl, fileUrl, hasLink });

    const waText = `Hi EnteAkshaya, I need the affidavit: ${item.Title || ''}`;
    const waHref = `https://wa.me/919946280727?text=${encodeURIComponent(waText)}`;

    const actions = document.createElement('div');
    actions.className = 'service-actions';

    if (hasLink) {
        const a = document.createElement('a');
        a.className = 'btn btn-download';
        a.href = fileUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        // optional; ignored cross-origin but harmless
        a.setAttribute('download', '');
        a.setAttribute('aria-label', `Download ${item.Title || 'affidavit'}`);
        a.innerHTML = `<i class="fas fa-download"></i> Download`;
        actions.appendChild(a);
    } else {
        const a = document.createElement('a');
        a.className = 'btn btn-download is-disabled';  // style as fallback
        a.href = waHref;
        a.target = '_blank';
        a.rel = 'noopener';
        a.innerHTML = `<i class="fas fa-info-circle"></i> Request File`;
        actions.appendChild(a);
    }

    const w = document.createElement('a');
    w.className = 'btn btn-whatsapp';
    w.href = waHref;
    w.target = '_blank';
    w.rel = 'noopener';
    w.innerHTML = `<i class="fab fa-whatsapp"></i> Ask on WhatsApp`;
    actions.appendChild(w);

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(meta);
    card.appendChild(actions);
    return card;
    }

}

// Safe init (runs whether the script loads before/after DOMContentLoaded)
(function initAffidavits() {
  const start = () => {
    // Replace with your Web App URL (no trailing slash)
    const API = 'https://script.google.com/macros/s/AKfycbx3BRtrM6u6YbHVkl-MxnDLWrMvcteAX3U2pgRmj12cHRkCblzCpEM0h0h2Dg2XuNmrQA/exec';
    new AffidavitsManager({ apiUrl: API });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

// Small helper to escape badges safely
function escapeHtml_(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

AlphaOS.I18N = {
    current: 'it',
    setLanguage: function(lang) { this.current = lang; AlphaOS.I18N.updateSystemPrompt(); },
    updateSystemPrompt: function() {
        AlphaOS.systemPrompt = 'Sei "Alpha", un consulente strategico geniale. Parla in ' + (this.current === 'it' ? 'Italiano' : 'English') + '. Sii diretto e costruttivo. Business: ' + AlphaOS.businessContext + ' a ' + AlphaOS.locationContext + '.';
    }
};

AlphaOS.UI = {
    modalCallback: null,
    init: function() {
        document.querySelectorAll('.nav-item[data-target]').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.switchView(e.currentTarget.getAttribute('data-target'));
            });
        });
        this.initRippleEffect();
        this.initMobileMoreMenu();
        this.initBottomNavLongPress();
    },

    initRippleEffect: function() {
        document.querySelectorAll('button, .nav-item, .history-card, .module-card, .market-card').forEach(el => {
            el.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }, { passive: true });
        });
    },

    initMobileMoreMenu: function() {
        const moreBtn = document.getElementById('bn-more');
        if (!moreBtn) return;
        const extraViews = [
            { target: 'timeline', icon: '\U0001f4c8', label: 'Trend' },
            { target: 'curriculum', icon: '\U0001f464', label: 'CV' },
            { target: 'technical-report', icon: '\U0001f4c4', label: 'Report' },
            { target: 'history', icon: '\U0001f4cb', label: 'Storico' },
            { target: 'intro', icon: '\U0001f3ac', label: 'Storia' },
            { target: 'settings', icon: '\u2699\ufe0f', label: 'Impostazioni' },
            { target: 'qr', icon: '\U0001f4f1', label: 'QR Code' }
        ];
        let isOpen = false;
        const menu = document.createElement('div');
        menu.id = 'bn-more-menu';
        menu.style.cssText = 'display:none;position:fixed;bottom:max(70px, env(safe-area-inset-bottom, 70px));left:50%;transform:translateX(-50%);background:rgba(10,12,15,0.98);backdrop-filter:blur(20px);border:1px solid var(--border-strong);border-radius:var(--radius-lg);padding:8px;z-index:9999;box-shadow:0 10px 40px rgba(0,0,0,0.8);min-width:200px;';
        extraViews.forEach(v => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--radius-sm);cursor:pointer;color:var(--text-secondary);font-size:0.9rem;font-weight:500;transition:background 0.2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;';
            item.innerHTML = '<span>' + v.icon + '</span><span>' + v.label + '</span>';
            item.addEventListener('click', () => {
                AlphaOS.UI.switchView(v.target);
                menu.style.display = 'none';
                isOpen = false;
            });
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen = !isOpen;
            menu.style.display = isOpen ? 'block' : 'none';
        });
        document.addEventListener('click', (e) => {
            if (isOpen && !menu.contains(e.target) && e.target !== moreBtn) {
                menu.style.display = 'none';
                isOpen = false;
            }
        });
    },

    initBottomNavLongPress: function() {
        const items = document.querySelectorAll('.bn-item[data-target]');
        let pressTimer = null;
        items.forEach(item => {
            item.addEventListener('touchstart', function() {
                pressTimer = setTimeout(() => {
                    AlphaOS.UI.switchView(this.getAttribute('data-target'));
                }, 300);
            }, { passive: true });
            item.addEventListener('touchend', function() {
                if (pressTimer) clearTimeout(pressTimer);
                pressTimer = null;
            }, { passive: true });
        });
    },
    switchView: function(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
        if (viewId === 'elite-radar') AlphaOS.EliteRadar.init();
        if (viewId === 'timeline') AlphaOS.TrendAnalysis.init();
        if (viewId === 'advisor' || viewId === 'engine') AlphaOS.NeuralNet.activate();
        if (viewId === 'about') { const v = document.getElementById('pitch-video'); if (v) { v.currentTime = 0; v.play().catch(() => {}); } }
        if (viewId === 'technical-report') AlphaOS.PDFViewer.init();
        if (viewId === 'qr') { this.openQRModal(); return; }
        document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
        const matched = document.querySelector('.bn-item[data-target="' + viewId + '"]');
        if (matched) matched.classList.add('active');
        this.closeMobileMenu();
        const moreMenu = document.getElementById('bn-more-menu');
        if (moreMenu) moreMenu.style.display = 'none';
        const title = document.querySelector('.topbar-title');
        if (title) {
            const activeNav = document.querySelector('.nav-item[data-target="' + viewId + '"]');
            title.textContent = activeNav ? activeNav.textContent.trim() : 'Predictive Analytics';
        }
    },
    toggleMobileMenu: function() {
        const sidebar = document.querySelector('aside.sidebar');
        const overlay = document.getElementById('menu-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        }
    },
    closeMobileMenu: function() {
        const sidebar = document.querySelector('aside.sidebar');
        const overlay = document.getElementById('menu-overlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    },
    openModal: function(callback) {
        const modal = document.getElementById('custom-modal');
        if (!modal) return;
        document.getElementById('modal-input-business').value = '';
        document.getElementById('modal-input-location').value = '';
        modal.style.display = 'flex';
        this.modalCallback = callback;
        setTimeout(() => { const inp = document.getElementById('modal-input-business'); if (inp) inp.focus(); }, 100);
    },
    closeModal: function() { const modal = document.getElementById('custom-modal'); if (modal) modal.style.display = 'none'; this.modalCallback = null; },
    submitModal: function() {
        const busEl = document.getElementById('modal-input-business'), locEl = document.getElementById('modal-input-location');
        if (!busEl || !locEl) return;
        const bus = busEl.value.trim(), loc = locEl.value.trim();
        if (this.modalCallback && bus && loc) { this.modalCallback({ business: bus, location: loc }); this.closeModal(); }
    },
    closeLocationPopup: function() {
        const popup = document.getElementById('location-popup');
        if (popup) { popup.style.animation = 'slideOutHUD 0.5s forwards'; setTimeout(() => { popup.style.display = 'none'; popup.style.animation = ''; }, 500); }
        const overlay = document.getElementById('location-popup-overlay'); if (overlay) overlay.style.display = 'none';
        const reticle = document.getElementById('globe-reticle'); if (reticle) reticle.style.display = 'none';
        const wrapper = document.getElementById('main-globe-wrapper'); if (wrapper) wrapper.classList.remove('zoomed');
        const earth = document.getElementById('main-earth'); if (earth) earth.classList.remove('locked');
    },
    openQRModal: function() {
        const overlay = document.getElementById('qr-modal-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        const url = 'https://predictive-analytics-kappa.vercel.app';
        document.getElementById('qr-url-text').textContent = url;
        const container = document.getElementById('qr-code-container');
        container.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, { text: url, width: 200, height: 200, colorDark: '#000000', colorLight: '#ffffff' });
        } else {
            container.innerHTML = '<p style="color:#333;padding:20px;font-family:monospace;">QR Code library loading...</p>';
        }
        AlphaOS.Toast.info('QR Code', 'Scansiona per accedere da mobile');
    },
    closeQRModal: function() { const overlay = document.getElementById('qr-modal-overlay'); if (overlay) overlay.style.display = 'none'; },
    animateValue: function(id, end) {
        let start = 0; const el = document.getElementById(id); if (!el) return;
        const duration = 1000, stepTime = 20, steps = duration / stepTime, increment = end / steps;
        const timer = setInterval(() => { start += increment; if (start >= end) { el.innerText = end + "%"; clearInterval(timer); } else { el.innerText = Math.floor(start) + "%"; } }, stepTime);
    }
};
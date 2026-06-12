window.AlphaOS = {};
AlphaOS = {
    apiKey: "", apiKeyOpenAI: "", apiKeyAnthropic: "", businessContext: "business/attivita", locationContext: "globale",
    escapeHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    initMobileNav: function() {
        document.querySelectorAll('.bn-item[data-target]').forEach(item => {
            item.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                AlphaOS.UI.switchView(target);
            });
        });
        document.getElementById('bn-more')?.addEventListener('click', function() {
            AlphaOS.UI.toggleMobileMenu();
        });
    },
    kpiKeys: { risk: "RISCHIO", profit: "PROFITTO", valid: "FATTIBILITA" },
    systemPrompt: "", chatContext: [],

    AI: {
        sendMessage: async function() {
            const inputEl = document.getElementById('chat-input'); if (!inputEl) return;
            const text = inputEl.value.trim(); if (!text) return;
            this.appendMessage('user', text); inputEl.value = '';
            AlphaOS.NeuralNet.activate();
            const loadingId = this.appendMessage('ai', 'Elaborazione in corso...');
            try {
                const enabled = AlphaOS.API.getEnabledProviders();
                if (enabled.length === 0) {
                    this.updateMessage(loadingId, '\u26a0\ufe0f Nessuna chiave API configurata. Vai in Impostazioni e aggiungi almeno una chiave (Gemini, OpenAI o Anthropic).');
                    AlphaOS.Toast.warning('API mancante', 'Configura almeno una chiave API');
                    return;
                }
                const prompt = (AlphaOS.systemPrompt || 'Sei un consulente strategico esperto.') +
                    '\n\nDomanda utente: ' + text + '\n\nRispondi in modo diretto, professionale e utile. Massimo 300 parole.';
                const results = await AlphaOS.API.callEnsemble(prompt);
                const ok = results.filter(r => r.text && r.text.trim());
                if (ok.length === 0) {
                    this.updateMessage(loadingId, '\u274c Tutti i provider AI hanno fallito. Verifica le chiavi API in Impostazioni.');
                    AlphaOS.Toast.error('AI Error', 'Tutti i provider hanno fallito');
                    return;
                }
                const best = ok[0];
                this.updateMessage(loadingId, best.text);
                AlphaOS.Toast.success('AI', 'Risposta da ' + best.name);
            } catch (e) {
                this.updateMessage(loadingId, '\u274c Errore: ' + (e.message || 'sconosciuto'));
                AlphaOS.Toast.error('Errore AI', e.message || 'Errore sconosciuto');
            }
        },
        appendMessage: function(role, text) {
            const historyEl = document.getElementById('chat-history'); if (!historyEl) return null;
            const id = 'msg-' + Date.now(); const div = document.createElement('div');
            div.id = id; div.className = 'msg-bubble msg-' + role; div.innerHTML = text.replace(/\n/g, '<br>');
            historyEl.appendChild(div); historyEl.scrollTop = historyEl.scrollHeight; return id;
        },
        updateMessage: function(id, text) { if (!id) return; const el = document.getElementById(id); if (el) { el.innerHTML = text.replace(/\n/g, '<br>'); const h = document.getElementById('chat-history'); if (h) h.scrollTop = h.scrollHeight; } }
    },

    Theme: {
        current: 'dark',
        init: function() {
            try { this.current = localStorage.getItem('alphaos-theme') || 'dark'; } catch(e) { this.current = 'dark'; }
            this.apply(this.current);
        },
        toggle: function() {
            this.current = this.current === 'dark' ? 'light' : 'dark';
            this.apply(this.current);
            try { localStorage.setItem('alphaos-theme', this.current); } catch(e) {}
        },
        apply: function(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const btn = document.getElementById('btn-theme');
            if (btn) btn.textContent = theme === 'dark' ? '\u2600\ufe0f' : '\U0001f319';
            AlphaOS.Toast.success('Tema', theme === 'dark' ? 'Dark mode attivato' : 'Light mode attivato');
        }
    },

    Graphics: {
        pointsMaterial: null,
        initThreeJSGlobe: function() {
            try {
                if (typeof THREE === 'undefined') { setTimeout(() => AlphaOS.Graphics.initThreeJSGlobe(), 2000); return; }
                const container = document.getElementById('three-globe'); if (!container) return;
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
                camera.position.z = 250;
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(container.clientWidth, container.clientHeight);
                container.appendChild(renderer.domElement);
                const group = new THREE.Group(); scene.add(group);
                const geo = new THREE.BufferGeometry();
                const count = 250, pos = new Float32Array(count * 3);
                for (let i = 0; i < count; i++) {
                    const r = 115 + Math.random() * 30, theta = Math.random() * 2 * Math.PI, phi = Math.acos(Math.random() * 2 - 1);
                    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); pos[i * 3 + 2] = r * Math.cos(phi);
                }
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                this.pointsMaterial = new THREE.PointsMaterial({ size: 2.5, color: new THREE.Color('#0ea5e9'), transparent: true, opacity: 0.9 });
                const points = new THREE.Points(geo, this.pointsMaterial); group.add(points);
                let globeActive = true;
                if ('IntersectionObserver' in window) {
                    const go = new IntersectionObserver((entries) => { globeActive = entries[0].isIntersecting; }, { threshold: 0 });
                    go.observe(container);
                }
                function animate() { if (!globeActive || document.hidden) { return; } group.rotation.y += 0.002; group.rotation.z += 0.001; renderer.render(scene, camera); requestAnimationFrame(animate); }
                animate();
                window.addEventListener('resize', () => { if (container.clientWidth > 0) { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); } });
            } catch (e) { }
        },
        updateGlobeColor: function(hexColor) { try { if (this.pointsMaterial && this.pointsMaterial.color) this.pointsMaterial.color.set(hexColor); } catch (e) { } }
    },

    start: function() {
        try {
            this.apiKey = localStorage.getItem('alphaos-apikey') || '';
            this.apiKeyOpenAI = localStorage.getItem('alphaos-apikey-openai') || '';
            this.apiKeyAnthropic = localStorage.getItem('alphaos-apikey-anthropic') || '';
        } catch(e) {}
        try { const g = document.getElementById('api-key-input'); if (g) { g.value = this.apiKey; g.addEventListener('input', function(){ AlphaOS.apiKey = this.value; try{localStorage.setItem('alphaos-apikey',this.value)}catch(e){} }); } } catch(e) {}
        try { const o = document.getElementById('api-key-openai'); if (o) { o.value = this.apiKeyOpenAI; o.addEventListener('input', function(){ AlphaOS.apiKeyOpenAI = this.value; try{localStorage.setItem('alphaos-apikey-openai',this.value)}catch(e){} }); } } catch(e) {}
        try { const a = document.getElementById('api-key-anthropic'); if (a) { a.value = this.apiKeyAnthropic; a.addEventListener('input', function(){ AlphaOS.apiKeyAnthropic = this.value; try{localStorage.setItem('alphaos-apikey-anthropic',this.value)}catch(e){} }); } } catch(e) {}
        try { this.I18N.setLanguage('it'); } catch(e) {}
        try { this.CommandPalette.init(); } catch(e) {}
        try { this.UI.init(); } catch(e) {}
        try { this.initMobileNav(); } catch(e) {}
        try { this.NeuralNet.init(); } catch(e) {}
        try { this.Particles.init(); } catch(e) {}
        try { this.Voice.init(); } catch(e) {}
        try { this.Theme.init(); } catch(e) {}
        try { this.History.init(); } catch(e) {}
        try { this.Market.initTicker(); } catch(e) {}
        setTimeout(() => {
            const bootGateway = document.getElementById('boot-gateway');
            if (bootGateway) bootGateway.style.opacity = '0';
            setTimeout(() => {
                if (bootGateway) bootGateway.style.display = 'none';
                const appLayout = document.getElementById('app-layout');
                if (appLayout) appLayout.classList.add('visible');
                this.Graphics.initThreeJSGlobe();
                AlphaOS.Toast.success('Sistema', 'Predictive Analytics avviato con successo');
            }, 600);
        }, 1500);
        setTimeout(function(){
            var bg = document.getElementById('boot-gateway');
            if (bg && bg.style.display !== 'none') {
                bg.style.opacity = '0';
                setTimeout(function(){
                    bg.style.display = 'none';
                    var app = document.getElementById('app-layout');
                    if (app) app.classList.add('visible');
                }, 600);
            }
        }, 3000);
    }
};

document.addEventListener('visibilitychange', function() { if (document.hidden) { try { AlphaOS.NeuralNet.deactivate(); } catch(e) {} } });
window.AlphaOS = AlphaOS;
AlphaOS.supabaseUrl = 'https://kbwaolqwdhswgkicbzmx.supabase.co';
AlphaOS.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtid2FvbHF3ZGhzd2draWNiem14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgwNjcxMywiZXhwIjoyMDkwMzgyNzEzfQ.M5A2UL9jSsWsKaKe2SrQnOnBVfZX57C7GxixEepxhAQ';
document.addEventListener('DOMContentLoaded', () => { AlphaOS.start(); });
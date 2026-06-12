AlphaOS.Toast = {
    show: function(type, title, message, duration) {
        if (duration === undefined) duration = 4000;
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        const icons = { success: '\u2713', warning: '\u26a0', error: '\u2715', info: '\u2139' };
        toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '\u2139') + '</span><div class="toast-content"><div class="toast-title">' + title + '</div><div class="toast-message">' + message + '</div></div><button class="toast-close" onclick="this.parentElement.classList.add(\'toast-out\'); setTimeout(() => this.parentElement.remove(), 300);">\u2715</button>';
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentElement) { toast.classList.add('toast-out'); setTimeout(() => toast.remove(), 300); } }, duration);
    },
    success: function(t, m) { this.show('success', t, m); },
    warning: function(t, m) { this.show('warning', t, m); },
    error: function(t, m) { this.show('error', t, m); },
    info: function(t, m) { this.show('info', t, m); }
};

AlphaOS.Voice = {
    recognition: null, isListening: false,
    init: function() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'it-IT';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            document.getElementById('voice-status').textContent = 'Hai detto: "' + transcript + '"';
            setTimeout(() => this.process(transcript), 500);
        };
        this.recognition.onend = () => { this.isListening = false; document.getElementById('voice-indicator').classList.remove('active'); };
        this.recognition.onerror = () => { this.isListening = false; document.getElementById('voice-indicator').classList.remove('active'); AlphaOS.Toast.error('Voice', 'Errore di riconoscimento vocale'); };
    },
    toggle: function() {
        if (!this.recognition) { AlphaOS.Toast.warning('Voice', 'Speech API non supportata in questo browser'); return; }
        if (this.isListening) { this.recognition.stop(); this.isListening = false; document.getElementById('voice-indicator').classList.remove('active'); }
        else { this.recognition.start(); this.isListening = true; document.getElementById('voice-indicator').classList.add('active'); document.getElementById('voice-status').textContent = 'Ascolto...'; AlphaOS.Toast.info('Voice', 'Comando vocale attivo'); }
    },
    process: function(transcript) {
        const lower = transcript.toLowerCase();
        if (lower.includes('dashboard') || lower.includes('panoramica')) AlphaOS.UI.switchView('dashboard');
        else if (lower.includes('analisi') || lower.includes('progetto')) AlphaOS.UI.switchView('engine');
        else if (lower.includes('mercato') || lower.includes('market')) AlphaOS.UI.switchView('live-market');
        else if (lower.includes('consulente') || lower.includes('advisor')) AlphaOS.UI.switchView('advisor');
        else if (lower.includes('curriculum') || lower.includes('cv')) AlphaOS.UI.switchView('curriculum');
        else if (lower.includes('impostazioni') || lower.includes('settings')) AlphaOS.UI.switchView('settings');
        else if (lower.includes('aggiorna') || lower.includes('refresh')) AlphaOS.Market.fetchData();
        else if (lower.includes('pdf') || lower.includes('esporta')) AlphaOS.PDF.exportReport();
        else if (lower.includes('qr') || lower.includes('code')) AlphaOS.UI.openQRModal();
        else { AlphaOS.UI.switchView('advisor'); const input = document.getElementById('chat-input'); if (input) { input.value = transcript; AlphaOS.AI.sendMessage(); } }
    }
};

AlphaOS.Legal = {
    generateGDPR: async function() {
        const outputBox = document.getElementById('gdpr-output'); if (!outputBox) return;
        outputBox.style.display = 'block'; outputBox.innerText = 'Generazione bozza...'; outputBox.classList.add('show');
        setTimeout(() => {
            outputBox.innerHTML = 'BOZZA CONSENSO GDPR\n\nTitolare del Trattamento: [Nome Azienda]\nFinalita: Gestione rapporto contrattuale e marketing\n\nCONSENSO ESPlicito:\n[ ] Acconsento al trattamento dei miei dati personali per finalita contrattuali\n[ ] Acconsento alla condivisione dei miei dati con partner terzi selezionati al termine del rapporto contrattuale (in caso di mancato rinnovo)\n[ ] Acconsento alla ricezione di comunicazioni marketing\n\nBase Giuridica: Art. 6.1.a GDPR (Consenso)\nDiritti dell\'interessato: Art. 15-22 GDPR\nPeriodo di conservazione: 24 mesi dalla scadenza del contratto\n\nFirma: _______________ Data: _______________';
            AlphaOS.Toast.success('GDPR', 'Bozza consensi generata');
        }, 1000);
    }
};

AlphaOS.CommandPalette = {
    isOpen: false,
    tools: [
        { i: '\U0001f30d', n: 'Geopolitica & Elite', p: 'Analizza i trend geopolitici attuali e dimmi come lo spostamento dei capitali impatta il mio business.' },
        { i: '\U0001f4af', n: 'Calcolo Successo', p: 'Analizza la mia idea e dammi la probabilit\u00e0 di successo da 0 a 100%.' },
        { i: '\U0001f6e1\ufe0f', n: 'Mitigazione Rischi', p: 'Piano d\'emergenza per i 3 rischi maggiori. Sovrastima i costi per risolverli.' }
    ],
    init: function() {
        const listEl = document.getElementById('palette-list'); if (!listEl) return;
        let html = '';
        this.tools.forEach((t, index) => { html += '<div class="palette-item" onclick="AlphaOS.CommandPalette.execute(' + index + ')"><span>' + t.i + '</span><span>' + t.n + '</span></div>'; });
        listEl.innerHTML = html;
    },
    toggle: function() { const pal = document.getElementById('ai-command-palette'); if (!pal) return; this.isOpen = !this.isOpen; pal.style.display = this.isOpen ? 'flex' : 'none'; },
    execute: function(index) { const tool = this.tools[index]; this.executeCustom('Esegui: "' + tool.n + '". ' + tool.p); },
    executeCustom: function(promptText) { this.toggle(); AlphaOS.UI.switchView('advisor'); const inputEl = document.getElementById('chat-input'); if (inputEl) { inputEl.value = promptText; AlphaOS.AI.sendMessage(); } }
};

AlphaOS.History = {
    init: function() { this.render(); this.syncFromCloud(); },
    supabaseHeaders: function() {
        return { 'apikey': AlphaOS.supabaseKey, 'Authorization': 'Bearer ' + AlphaOS.supabaseKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    },
    syncFromCloud: async function() {
        try {
            const res = await fetch(AlphaOS.supabaseUrl + '/rest/v1/analyses?order=id.desc&limit=50', { headers: this.supabaseHeaders() });
            if (res.ok) {
                const cloud = await res.json();
                if (cloud.length > 0) {
                    try { localStorage.setItem('alphaos-history', JSON.stringify(cloud)); } catch(e) {}
                    this.render();
                }
            }
        } catch(e) { }
    },
    save: function(data) {
        let history = [];
        try { history = JSON.parse(localStorage.getItem('alphaos-history') || '[]'); } catch(e) { history = []; }
        const entry = { id: Date.now(), date: new Date().toLocaleString('it-IT') };
        entry.title = data.title; entry.risk = data.risk; entry.profit = data.profit; entry.valid = data.valid; entry.pros = data.pros; entry.cons = data.cons;
        history.unshift(entry);
        try { localStorage.setItem('alphaos-history', JSON.stringify(history.slice(0, 50))); } catch(e) {}
        fetch(AlphaOS.supabaseUrl + '/rest/v1/analyses', {
            method: 'POST', headers: this.supabaseHeaders(),
            body: JSON.stringify({ title: data.title, risk: data.risk, profit: data.profit, valid: data.valid, pros: JSON.stringify(data.pros || []), cons: JSON.stringify(data.cons || []), date: entry.date })
        }).catch(() => {});
        AlphaOS.Toast.success('Salvato', 'Analisi salvata nella cronologia');
    },
    render: function() {
        const container = document.getElementById('history-list');
        if (!container) return;
        let history = [];
        try { history = JSON.parse(localStorage.getItem('alphaos-history') || '[]'); } catch(e) { history = []; }
        if (history.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-tertiary);font-family:\'Fira Code\',monospace;">Nessuna analisi salvata.<br>Esegui un\'analisi per vederla qui.</div>';
            return;
        }
        container.innerHTML = history.map(function(h) {
            return '<div class="history-card" onclick="AlphaOS.History.detail(' + h.id + ')"><div class="history-card-header"><span class="history-card-date">' + h.date + '</span><span style="font-family:\'Fira Code\',monospace;font-size:0.85rem;color:' + (h.risk > 50 ? 'var(--semantic-danger)' : 'var(--semantic-success)') + ';">Rischio: ' + h.risk + '%</span></div><div class="history-card-title">' + AlphaOS.escapeHtml(h.title || '') + '</div><div class="history-card-stats"><span>\U0001f4c8 Profitto: ' + h.profit + '%</span><span>\u2705 Validita: ' + h.valid + '%</span></div></div>';
        }).join('');
    },
    detail: function(id) {
        let history = [];
        try { history = JSON.parse(localStorage.getItem('alphaos-history') || '[]'); } catch(e) { history = []; }
        const item = history.find(function(h) { return h.id === id; });
        if (!item) return;
        AlphaOS.UI.switchView('engine');
        document.getElementById('engine-input').value = item.title;
        setTimeout(function() {
            AlphaOS.Engine.updateRadar(item.risk, item.profit, item.valid);
            document.getElementById('list-pros').innerHTML = item.pros.map(function(p) { return '<li>' + AlphaOS.escapeHtml(p) + '</li>'; }).join('');
            document.getElementById('list-cons').innerHTML = item.cons.map(function(c) { return '<li>' + AlphaOS.escapeHtml(c) + '</li>'; }).join('');
            document.getElementById('analysis-results').classList.add('visible');
            AlphaOS.Toast.info('Cronologia', 'Analisi caricata dalla cronologia');
        }, 300);
    },
    clear: function() {
        if (confirm('Cancellare tutta la cronologia delle analisi?')) {
            try { localStorage.removeItem('alphaos-history'); } catch(e) {}
            fetch(AlphaOS.supabaseUrl + '/rest/v1/analyses', {
                method: 'DELETE', headers: this.supabaseHeaders()
            }).catch(function() {});
            this.render();
            AlphaOS.Toast.info('Cronologia', 'Cronologia cancellata');
        }
    }
};

AlphaOS.MonteCarlo = {
    run: function(idea, params) {
        const output = document.getElementById('monte-carlo-output');
        if (!output) return;
        output.style.display = 'block'; output.innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-family:\'Fira Code\',monospace;color:var(--brand-accent);">Esecuzione simulazione Monte Carlo...</div></div>'; output.classList.add('visible');
        setTimeout(function() {
            const N = 1000;
            const baseMean = params ? (params.valid + params.profit) / 2 : 50;
            const volatility = params ? 15 + (100 - params.risk) * 0.15 : 20;
            const results = [];
            for (let i = 0; i < N; i++) {
                const noise = (Math.random() - 0.5) * volatility * 2;
                results.push(Math.max(0, Math.min(100, baseMean + noise)));
            }
            results.sort(function(a, b) { return a - b; });
            const mean = results.reduce(function(a, b) { return a + b; }, 0) / N;
            const median = results[Math.floor(N / 2)];
            const p5 = results[Math.floor(N * 0.05)], p95 = results[Math.floor(N * 0.95)];
            const std = Math.sqrt(results.reduce(function(s, v) { return s + Math.pow((v - mean), 2); }, 0) / N);
            const bins = 15; const binSize = 100 / bins; const histogram = new Array(bins).fill(0);
            results.forEach(function(v) { const idx = Math.min(bins - 1, Math.floor(v / binSize)); histogram[idx]++; });
            const maxCount = Math.max.apply(null, histogram);
            let bars = histogram.map(function(c, i) {
                return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;"><span style="font-family:\'Fira Code\',monospace;font-size:0.7rem;color:var(--text-tertiary);width:35px;text-align:right;">' + (i * binSize).toFixed(0) + '</span><div style="height:18px;width:' + ((c / maxCount) * 100) + '%;background:linear-gradient(90deg,var(--brand-accent),#8b5cf6);border-radius:3px;transition:width 0.5s;"></div><span style="font-family:\'Fira Code\',monospace;font-size:0.65rem;color:var(--text-tertiary);">' + c + '</span></div>';
            }).join('');
            const isFavorable = mean > 50;
            output.innerHTML = '<div style="margin-bottom:16px;"><strong>Risultati Monte Carlo (' + N.toLocaleString() + ' scenari)</strong></div><div style="margin-bottom:12px;padding:10px;background:rgba(14,165,233,0.1);border:1px solid var(--brand-accent);border-radius:8px;font-size:0.85rem;color:var(--text-secondary);">Parametri base: Media <strong>' + baseMean.toFixed(1) + '%</strong> \u00b7 Volatilit\u00e0 <strong>' + volatility.toFixed(1) + '</strong>' + (params ? ' \u00b7 Rischio AI: ' + params.risk + '%' : '') + (params && params.providers ? ' \u00b7 AI: ' + params.providers.join(', ') : '') + '</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;"><div style="background:var(--bg-surface);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Media</div><div style="font-family:\'Fira Code\',monospace;font-size:1.2rem;font-weight:700;color:var(--text-primary);">' + mean.toFixed(1) + '%</div></div><div style="background:var(--bg-surface);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Mediana</div><div style="font-family:\'Fira Code\',monospace;font-size:1.2rem;font-weight:700;color:var(--text-primary);">' + median.toFixed(1) + '%</div></div><div style="background:var(--bg-surface);padding:12px;border-radius:8px;text-align:center;"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Dev. Std</div><div style="font-family:\'Fira Code\',monospace;font-size:1.2rem;font-weight:700;color:var(--text-primary);">' + std.toFixed(1) + '</div></div></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;"><div style="background:rgba(239,68,68,0.1);padding:12px;border-radius:8px;text-align:center;border:1px solid var(--semantic-danger);"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Pessimo (5\u00b0)</div><div style="font-family:\'Fira Code\',monospace;font-size:1.4rem;font-weight:700;color:var(--semantic-danger);">' + p5.toFixed(1) + '%</div></div><div style="background:rgba(16,185,129,0.1);padding:12px;border-radius:8px;text-align:center;border:1px solid var(--semantic-success);"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Ottimo (95\u00b0)</div><div style="font-family:\'Fira Code\',monospace;font-size:1.4rem;font-weight:700;color:var(--semantic-success);">' + p95.toFixed(1) + '%</div></div></div><div style="font-size:0.85rem;margin-bottom:12px;color:var(--text-primary);font-weight:600;">Distribuzione degli scenari:</div><div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:8px;">' + bars + '</div><div style="margin-top:16px;padding:12px;border-radius:8px;background:' + (isFavorable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') + ';border:1px solid ' + (isFavorable ? 'var(--semantic-success)' : 'var(--semantic-danger)') + ';text-align:center;"><span style="font-weight:700;color:' + (isFavorable ? 'var(--semantic-success)' : 'var(--semantic-danger)') + ';">' + (isFavorable ? 'Scenario favorevole' : 'Scenario sfavorevole') + '</span><span style="color:var(--text-tertiary);font-size:0.85rem;"> - ' + (results.filter(function(v) { return v > 50; }).length / N * 100).toFixed(1) + '% degli scenari ha esito positivo</span></div>';
            AlphaOS.Toast.success('Monte Carlo', 'Simulazione completata: media ' + mean.toFixed(1) + '%');
        }, 800);
    }
};

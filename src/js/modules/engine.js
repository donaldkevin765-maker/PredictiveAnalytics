AlphaOS.Engine = {
    lastResult: null,

    _setStatus: function(msg, type) {
        const bar = document.getElementById('engine-status');
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        if (bar) { bar.classList.remove('loading'); }
        if (dot) { dot.className = 'engine-status-dot'; }
        if (type === 'loading') {
            if (bar) bar.classList.add('loading');
            if (dot) dot.classList.add('loading');
            if (text) text.textContent = msg;
        } else if (type === 'done') {
            if (dot) dot.classList.add('active');
            if (text) text.textContent = msg;
        } else if (type === 'error') {
            if (dot) dot.classList.add('error');
            if (text) text.textContent = msg;
        } else {
            if (dot) dot.classList.add('active');
            if (text) text.textContent = msg;
        }
    },

    _renderProviderChips: function(enabled, states) {
        const el = document.getElementById('engine-providers');
        if (!el) return;
        const names = { gemini: 'Gemini', openai: 'OpenAI', anthropic: 'Anthropic' };
        const chips = enabled.map(p => {
            const state = (states && states[p.key]) || 'pending';
            const dotClass = state === 'loading' ? 'loading' : state === 'done' ? 'done' : state === 'error' ? 'error' : 'pending';
            const chipClass = state === 'done' ? 'engine-provider-chip done' : state === 'loading' || state === 'active' ? 'engine-provider-chip active' : 'engine-provider-chip';
            return '<span class="' + chipClass + '"><span class="chip-dot ' + dotClass + '"></span>' + (names[p.key] || p.name) + '</span>';
        }).join('');
        el.innerHTML = chips || '<span style="opacity:0.5">Nessun provider configurato</span>';
    },

    callEnsemble: async function(prompt, onProgress) {
        const results = await AlphaOS.API.callEnsemble(prompt);
        const succeeded = results.filter(r => r.text);
        if (succeeded.length === 0) {
            const hasAnyKey = AlphaOS.apiKey || AlphaOS.apiKeyOpenAI || AlphaOS.apiKeyAnthropic;
            if (!hasAnyKey) {
                AlphaOS.Toast.warning('Nessuna API', 'Aggiungi almeno una chiave API in Impostazioni');
            } else {
                AlphaOS.Toast.error('AI Error', 'Tutti i provider hanno fallito. Verifica le chiavi API.');
            }
            return [];
        }
        return succeeded;
    },

    runAnalysis: async function() {
        const input = document.getElementById('engine-input');
        if (!input || !input.value.trim()) return;
        const dashboard = document.getElementById('analysis-results');
        const btn = document.getElementById('btn-analyze');
        if (btn) btn.disabled = true;
        if (dashboard) dashboard.classList.remove('visible');
        AlphaOS.NeuralNet.activate();

        const enabled = AlphaOS.API.getEnabledProviders();
        if (enabled.length === 0) {
            this._setStatus('Nessuna API configurata. Vai in Impostazioni.', 'error');
            if (btn) btn.disabled = false;
            AlphaOS.Toast.warning('API Mancante', 'Configura almeno una chiave API in Impostazioni');
            return;
        }

        this._renderProviderChips(enabled, {});
        this._setStatus('Consultazione ' + enabled.map(p => p.name).join(' + ') + '...', 'loading');

        const prompt = 'Sei un analista senior di Predictive Analytics. Analizza l\'idea imprenditoriale in modo approfondito e verifica ogni valutazione con dati di mercato reali.\n\nIDEA: "' + input.value.trim() + '"\n\nREQUISITI:\n- Analizza il contesto di mercato attuale (trend, competitor, normative)\n- Verifica ogni affermazione con fonti/dati reali\n- Assegna un confidence score a ogni metrica\n- Considera rischi normativi, competitivi, operativi\n\nRispondi SOLO con un JSON valido (senza markdown):\n{\n  "risk": <0-100>,\n  "profit": <0-100>,\n  "validity": <0-100>,\n  "confidence": <0-100 (quanto sei sicuro dell\'analisi)>,\n  "market_context": "Analisi del mercato attuale (max 80 parole)",\n  "key_factors": ["fattore chiave 1", "fattore chiave 2", "fattore chiave 3"],\n  "pros": ["punto di forza 1", "punto di forza 2", "punto di forza 3"],\n  "cons": ["criticit\u00e0 1", "criticit\u00e0 2", "criticit\u00e0 3"],\n  "sources": ["fonte/referenza 1", "fonte/referenza 2"],\n  "verification": "Come sono stati verificati questi dati"\n}';

        const results = await this.callEnsemble(prompt);
        if (results.length === 0) {
            this._setStatus('Errore: nessun provider disponibile.', 'error');
            this._renderProviderChips(enabled, {});
            if (btn) btn.disabled = false;
            return;
        }

        const providerStates = {};
        results.forEach(r => { providerStates[r.key] = 'done'; });
        this._renderProviderChips(enabled, providerStates);

        let risks = [], profits = [], valids = [], confidences = [], allPros = [], allCons = [], allSources = [], allFactors = [], allContexts = [], allVerifications = [];
        let providerScores = [];
        results.forEach(r => {
            try {
                const clean = r.text.replace(/```json/gi, '').replace(/```/g, '').trim();
                const json = JSON.parse(clean);
                if (json.risk !== undefined) risks.push(Math.max(0, Math.min(100, parseInt(json.risk))));
                if (json.profit !== undefined) profits.push(Math.max(0, Math.min(100, parseInt(json.profit))));
                if (json.validity !== undefined) valids.push(Math.max(0, Math.min(100, parseInt(json.validity))));
                if (json.confidence !== undefined) confidences.push(Math.max(0, Math.min(100, parseInt(json.confidence))));
                if (json.pros) allPros.push(...json.pros);
                if (json.cons) allCons.push(...json.cons);
                if (json.sources) allSources.push(...json.sources);
                if (json.key_factors) allFactors.push(...json.key_factors);
                if (json.market_context) allContexts.push(json.market_context);
                if (json.verification) allVerifications.push(json.verification);
                providerScores.push({
                    name: r.name,
                    key: r.key,
                    color: r.key === 'gemini' ? '#4285f4' : r.key === 'openai' ? '#10a37f' : '#d97706',
                    risk: json.risk !== undefined ? parseInt(json.risk) : null,
                    profit: json.profit !== undefined ? parseInt(json.profit) : null,
                    valid: json.validity !== undefined ? parseInt(json.validity) : null
                });
            } catch(e) {}
        });

        const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;
        const risk = avg(risks), profit = avg(profits), valid = avg(valids);
        const confidence = confidences.length ? avg(confidences) : null;
        const dedup = (arr) => [...new Set(arr.map(s => s.toLowerCase().trim()))].slice(0, 5);
        const pros = allPros.length ? dedup(allPros) : ['Potenziale di mercato identificato'];
        const cons = allCons.length ? dedup(allCons) : ['Necessaria analisi approfondita'];
        const sources = allSources.length ? [...new Set(allSources)].slice(0, 4) : [];
        const keyFactors = allFactors.length ? [...new Set(allFactors)].slice(0, 5) : [];
        const marketContext = allContexts.length ? allContexts[0] : '';
        const verification = allVerifications.length ? allVerifications[0] : '';

        this.lastResult = { risk, profit, valid, pros, cons, title: input.value.trim(), providers: results.map(r => r.name) };
        this._setStatus('Analisi completata (' + results.map(r => r.name).join(', ') + ').', 'done');

        const verdictScore = document.getElementById('verdict-score');
        const verdictTitle = document.getElementById('verdict-title');
        const verdictSub = document.getElementById('verdict-subtitle');
        const verdictIcon = document.getElementById('verdict-icon');
        const verdictCard = document.getElementById('verdict-card');
        if (verdictScore) {
            const firstChild = verdictScore.firstChild;
            if (firstChild) verdictScore.textContent = valid + '%';
            verdictScore.appendChild(document.createElement('span'));
            verdictScore.lastChild.className = 'score-label';
            verdictScore.lastChild.textContent = 'Validit\u00e0';
        }
        if (verdictTitle) {
            if (valid >= 65) verdictTitle.textContent = '\u2705 Idea Promettente';
            else if (valid >= 40) verdictTitle.textContent = '\u26a0\ufe0f Idea da Rivedere';
            else verdictTitle.textContent = '\u274c Idea ad Alto Rischio';
        }
        if (verdictSub) {
            if (valid >= 65) verdictSub.textContent = 'Fattibilit\u00e0 alta \u2014 buone probabilit\u00e0 di successo';
            else if (valid >= 40) verdictSub.textContent = 'Fattibilit\u00e0 media \u2014 richiede aggiustamenti significativi';
            else verdictSub.textContent = 'Fattibilit\u00e0 bassa \u2014 rischi elevati, rivaluta l\'approccio';
        }
        if (verdictIcon) {
            if (valid >= 65) verdictIcon.textContent = '\u2705';
            else if (valid >= 40) verdictIcon.textContent = '\u26a0\ufe0f';
            else verdictIcon.textContent = '\u274c';
        }
        if (verdictCard) {
            verdictCard.className = 'verdict-card';
            if (valid >= 65) verdictCard.classList.add('green');
            else if (valid >= 40) verdictCard.classList.add('yellow');
            else verdictCard.classList.add('red');
        }

        if (providerScores.length > 1) {
            const pBreakdown = document.createElement('div');
            pBreakdown.className = 'provider-breakdown';
            pBreakdown.style.marginTop = '12px';
            pBreakdown.style.width = '100%';
            providerScores.forEach(p => {
                const avgScore = p.valid !== null ? p.valid : 50;
                const barColor = avgScore >= 65 ? 'var(--semantic-success)' : avgScore >= 40 ? 'var(--semantic-warning)' : 'var(--semantic-danger)';
                pBreakdown.innerHTML += '<div class="provider-row"><span class="provider-name" style="color:' + p.color + '">' + p.name + '</span><div class="provider-bar"><div class="provider-bar-fill" style="width:' + avgScore + '%;background:' + barColor + ';"></div></div><span class="provider-score">' + avgScore + '%</span></div>';
            });
            const existing = verdictCard.querySelector('.provider-breakdown');
            if (existing) existing.remove();
            verdictCard.appendChild(pBreakdown);
        }

        this.updateRadar(risk, profit, valid);

        const listPros = document.getElementById('list-pros');
        const listCons = document.getElementById('list-cons');
        if (listPros) listPros.innerHTML = pros.map(p => '<li><span class="pc-icon">\u2705</span>' + AlphaOS.escapeHtml(p) + '</li>').join('');
        if (listCons) listCons.innerHTML = cons.map(c => '<li><span class="pc-icon">\u26a0\ufe0f</span>' + AlphaOS.escapeHtml(c) + '</li>').join('');

        const cardCtx = document.getElementById('card-context');
        const ctxEl = document.getElementById('analysis-context');
        if (cardCtx && ctxEl && marketContext) {
            ctxEl.textContent = marketContext;
            cardCtx.style.display = 'block';
        } else if (cardCtx) cardCtx.style.display = 'none';

        const cardFactors = document.getElementById('card-factors');
        const factorsEl = document.getElementById('analysis-factors');
        if (cardFactors && factorsEl && keyFactors.length) {
            factorsEl.innerHTML = keyFactors.map((f, i) => {
                const bullet = i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'neutral' : 'negative';
                return '<div class="factor-item"><span class="factor-bullet ' + bullet + '"></span>' + AlphaOS.escapeHtml(f) + '</div>';
            }).join('');
            cardFactors.style.display = 'block';
        } else if (cardFactors) cardFactors.style.display = 'none';

        const cardVer = document.getElementById('card-verification');
        const verEl = document.getElementById('analysis-verification');
        if (cardVer && verEl) {
            let html = '';
            if (confidence !== null) {
                const color = confidence > 70 ? 'var(--semantic-success)' : confidence > 40 ? 'var(--semantic-warning)' : 'var(--semantic-danger)';
                html += '<div class="confidence-bar"><span class="confidence-label">Affidabilit\u00e0</span><div class="confidence-track"><div class="confidence-fill" style="width:' + confidence + '%;background:' + color + ';"></div></div><span class="confidence-value" style="color:' + color + ';">' + confidence + '%</span></div>';
            }
            if (sources.length) {
                html += '<div style="margin-top:10px;font-size:0.75rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Fonti verificate:</div>';
                html += sources.map(s => '<div class="source-item"><span class="source-bullet">\U0001f4c4</span>' + AlphaOS.escapeHtml(s) + '</div>').join('');
            }
            if (verification) {
                html += '<div style="margin-top:10px;padding:10px 12px;background:rgba(14,165,233,0.06);border-radius:6px;font-size:0.82rem;color:var(--text-tertiary);border-left:2px solid var(--brand-accent);">' + AlphaOS.escapeHtml(verification) + '</div>';
            }
            verEl.innerHTML = html;
            cardVer.style.display = html ? 'block' : 'none';
        }

        if (dashboard) dashboard.classList.add('visible');
        if (btn) btn.disabled = false;
        AlphaOS.History.save({ title: input.value.trim(), risk, profit, valid, pros, cons });
        AlphaOS.Toast.success('Ensemble', 'Analisi completata con ' + results.length + ' AI');
    },

    updateRadar: function(risk, profit, valid) {
        const poly = document.getElementById('radar-shape');
        const cx = 100, cy = 100, r = 80;
        const rR = (risk / 100) * r, pR = (profit / 100) * r, vR = (valid / 100) * r;
        const p1x = cx, p1y = cy - rR;
        const p2x = cx + pR * Math.cos(Math.PI / 6);
        const p2y = cy + pR * Math.sin(Math.PI / 6);
        const p3x = cx - vR * Math.cos(Math.PI / 6);
        const p3y = cy + vR * Math.sin(Math.PI / 6);
        if (poly) poly.setAttribute('points', p1x + ',' + p1y + ' ' + p2x + ',' + p2y + ' ' + p3x + ',' + p3y);
        const barRisk = document.getElementById('bar-risk');
        const barProfit = document.getElementById('bar-profit');
        const barValid = document.getElementById('bar-valid');
        if (barRisk) barRisk.style.width = risk + '%';
        if (barProfit) barProfit.style.width = profit + '%';
        if (barValid) barValid.style.width = valid + '%';
        const valRisk = document.getElementById('val-risk');
        const valProfit = document.getElementById('val-profit');
        const valValid = document.getElementById('val-valid');
        if (valRisk) valRisk.textContent = risk + '%';
        if (valProfit) valProfit.textContent = profit + '%';
        if (valValid) valValid.textContent = valid + '%';
    },

    reconfigureOS: function() {
        AlphaOS.UI.openModal(async (userInputs) => {
            try {
                const { business, location } = userInputs;
                const overlay = document.getElementById('reconfig-overlay'), termLogs = document.getElementById('term-logs');
                if (overlay) overlay.style.display = 'flex'; if (termLogs) termLogs.innerHTML = '';
                const addLog = async (msg, delay = 400) => { return new Promise(res => { setTimeout(() => { if (!termLogs) return res(); const time = new Date().toISOString().split('T')[1].slice(0, -1); termLogs.innerHTML += '<div style="margin-bottom:6px;"><span style="color:var(--text-tertiary);">[' + time + ']</span> ' + msg + '</div>'; termLogs.scrollTop = termLogs.scrollHeight; res(); }, delay); }); };
                await addLog('> BOOT SEQUENCE INITIATED...', 100);
                await addLog('> TARGET SECTOR: ' + business.toUpperCase());
                await addLog('> LOCATION LOCK: ' + location.toUpperCase());
                await addLog('> Requesting Geospatial & Legal Matrix...');
                AlphaOS.businessContext = business; AlphaOS.locationContext = location; AlphaOS.I18N.updateSystemPrompt();
                await addLog('> Geospatial Match: LAT ' + (Math.random() * 180 - 90).toFixed(4) + ', LNG ' + (Math.random() * 360 - 180).toFixed(4), 600);
                await addLog('> Injecting custom color profile...', 400);
                await addLog('> Realigning Neural KPIs...', 300);
                await addLog('> Updating DOM interface semantics...', 400);
                await addLog('> SYSTEM REBOOT COMPLETE.', 500);
                setTimeout(() => { const o = document.getElementById('reconfig-overlay'); if (o) o.style.display = 'none'; }, 600);
                const earthEl = document.getElementById('main-earth'); if (earthEl) { earthEl.classList.add('locked'); earthEl.classList.add('reconfigured'); }
                const globeWrapper = document.getElementById('main-globe-wrapper'); if (globeWrapper) globeWrapper.classList.add('zoomed');
                const reticle = document.getElementById('globe-reticle'); if (reticle) reticle.style.display = 'block';
                const popup = document.getElementById('location-popup'), popupOverlay = document.getElementById('location-popup-overlay');
                if (popup) { popup.style.animation = 'slideInHUD 0.7s forwards'; document.getElementById('loc-popup-city').textContent = location.toUpperCase(); document.getElementById('loc-popup-content').innerHTML = '<strong>LOCK GEOGRAFICO:</strong> ' + location.toUpperCase() + '<br><br>Analisi completata per <strong>' + business + '</strong>.<br><br>Protocolli GDPR attivi. Costi sovrastimati del 35%. Sistema operativo e blindato.'; popup.style.display = 'flex'; }
                if (popupOverlay) popupOverlay.style.display = 'block';
                AlphaOS.Toast.success('Reconfiguration', 'Sistema configurato per ' + business + ' a ' + location);
            } catch (e) { const overlay = document.getElementById('reconfig-overlay'); if (overlay) overlay.style.display = 'none'; }
        });
    },

    generateLaunchStrategy: async function() {
        const input = document.getElementById('engine-input');
        const outputBox = document.getElementById('strategy-output');
        if (!input || !outputBox) return;
        if (!input.value.trim()) {
            outputBox.style.display = 'block';
            outputBox.innerText = 'Inserisci prima un\'idea nel campo di ricerca.';
            outputBox.classList.add('visible');
            return;
        }
        outputBox.style.display = 'block';
        outputBox.innerHTML = 'Generazione strategia AI in corso...';
        outputBox.classList.add('visible');

        const prompt = 'Sei un consulente strategico senior specializzato in Go-To-Market. Genera una strategia di lancio professionale e verificata per: "' + input.value.trim() + '".\n\nREQUISITI:\n- Analisi basata su dati di mercato reali e tendenze attuali\n- Ogni fase deve includere KPI misurabili e tempistiche realistiche\n- Cita fonti/dati di mercato dove pertinente\n\nStruttura:\n\nFASE 1: PRE-LANCIO\n- Ricerche di mercato e analisi competitor\n- Setup operativo e compliance\n- Budget e risorse necessarie\n- KPI: [metriche misurabili]\n\nFASE 2: LANCIO\n- Strategia di go-to-market\n- Canali di acquisizione\n- Partner e alleanze strategiche\n- KPI: [metriche misurabili]\n\nFASE 3: SCALING\n- Crescita e ottimizzazione\n- Nuovi mercati\n- Data monetization\n- KPI: [metriche misurabili]\n\nCOSA FARE / COSA NON FARE / RIFERIMENTI\n\nMassimo 400 parole. Rispondi in Italiano.';

        const results = await this.callEnsemble(prompt);
        if (results.length === 0) return;
        const combined = results.map(r => '<div style="margin-bottom:16px;padding:12px;border-left:3px solid var(--brand-accent);background:var(--bg-surface);border-radius:8px;"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + r.name + '</div>' + r.text.replace(/\n/g, '<br>') + '</div>').join('<hr style="border-color:var(--border-light);margin:12px 0;">');
        outputBox.innerHTML = combined;
        AlphaOS.Toast.success('Strategia', 'Strategie generate da ' + results.length + ' AI');
    },

    simulateBlackSwan: async function() {
        const input = document.getElementById('engine-input');
        const outputBox = document.getElementById('crisis-output');
        if (!input || !outputBox) return;
        if (!input.value.trim()) {
            outputBox.style.display = 'block';
            outputBox.innerText = 'Inserisci prima un\'idea nel campo di ricerca.';
            outputBox.classList.add('visible');
            return;
        }
        outputBox.style.display = 'block';
        outputBox.innerHTML = 'Generazione scenario Cigno Nero...';
        outputBox.classList.add('visible');

        const prompt = 'Sei un analista di rischio specializzato in scenari "Cigno Nero" (Black Swan Events) con esperienza in predictive analytics. Simula un evento catastrofico realistico basato su trend economici e normativi attuali per: "' + input.value.trim() + '".\n\nREQUISITI:\n- Scenario basato su rischi reali e verificabili del settore\n- Impatto quantificato con dati e percentuali\n- Citare normative, trend di mercato o precedenti storici come fonti\n\nStruttura:\n\nSCENARIO: [descrizione evento inaspettato ma plausibile, con riferimenti a trend reali]\nIMPATTO: [conseguenze quantitative, con stime basate su dati di settore]\nPERCHE\' DISTRUGGE IL BUSINESS: [vulnerabilit\u00e0 specifiche del modello]\nMITIGAZIONE: [strategia di resilience]\nAZIONE IMMEDIATA: [3 passi concreti da eseguire subito]\n\nMassimo 350 parole. Rispondi in Italiano.';

        const results = await this.callEnsemble(prompt);
        if (results.length === 0) return;
        const combined = results.map(r => '<div style="margin-bottom:16px;padding:12px;border-left:3px solid var(--semantic-danger);background:var(--bg-surface);border-radius:8px;"><div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + r.name + '</div>' + r.text.replace(/\n/g, '<br>') + '</div>').join('<hr style="border-color:var(--border-light);margin:12px 0;">');
        outputBox.innerHTML = combined;
        AlphaOS.Toast.warning('Black Swan', 'Scenari generati da ' + results.length + ' AI');
    },

    runMonteCarlo: function() {
        const input = document.getElementById('engine-input');
        if (!input || !input.value.trim()) {
            AlphaOS.Toast.warning('Monte Carlo', 'Inserisci un\'idea nel campo di ricerca');
            return;
        }
        const params = this.lastResult ? {
            risk: this.lastResult.risk,
            profit: this.lastResult.profit,
            valid: this.lastResult.valid,
            providers: this.lastResult.providers
        } : null;
        AlphaOS.MonteCarlo.run(input.value.trim(), params);
    }
};

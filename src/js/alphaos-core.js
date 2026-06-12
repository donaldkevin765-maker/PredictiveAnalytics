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
                const prompt = (AlphaOS.systemPrompt || 'Sei un consulente strategico esperto.') +
                    '\n\nDomanda utente: ' + text + '\n\nRispondi in modo diretto, professionale e utile. Massimo 300 parole.';
                let reply = null;
                if (enabled.length > 0) {
                    const results = await AlphaOS.API.callEnsemble(prompt);
                    const ok = results.filter(r => r.text && r.text.trim());
                    if (ok.length > 0) {
                        const best = ok[0];
                        reply = best.text;
                        AlphaOS.Toast.success('AI', 'Risposta da ' + best.name);
                    }
                }
                if (!reply) {
                    reply = this._localFallback(text);
                    AlphaOS.Toast.info('AI Locale', 'Generata in modalità offline');
                }
                this.updateMessage(loadingId, reply);
            } catch (e) {
                this.updateMessage(loadingId, this._localFallback(text));
                AlphaOS.Toast.info('AI Locale', 'Generata in modalità offline (errore API)');
            }
        },
        _localFallback: function(question) {
            const q = question.toLowerCase();
            const words = q.split(/\s+/).filter(w => w.length > 2);
            if (words.length < 2) return 'Chiedimi qualcosa di più specifico per ricevere una consulenza mirata.';

            const hasMarket = /(mercato|market|business|vendita|clienti|concorrenti|trend|settore|domanda|offerta)/.test(q);
            const hasStrategy = /(strategia|strategico|piano|plan|go-to-market|gtm|lancio|crescita|scaling)/.test(q);
            const hasFinance = /(finanza|budget|costo|investimento|revenue|profitto|margine|prezzo|funding|capitale)/.test(q);
            const hasRisk = /(rischio|rischi|pericolo|criticità|problema|critico|debolezza)/.test(q);
            const hasTech = /(tech|tecnologia|software|app|digitale|piattaforma|sviluppo|programmazione|dati|ai|ia)/.test(q);
            const hasIdea = /(idea|idea imprenditoriale|startup|business plan|progetto|innovazione)/.test(q);
            const hasAdvice = /(consiglio|consigli|aiuto|suggerimento|opinione|parere|sconsigli|raccomanda)/.test(q);
            const hasAnalysis = /(analisi|analizza|valuta|valutazione|dimmi|spiega|cos'è|che cos)/.test(q);
            const hasTeam = /(team|persone|assunzioni|ruoli|organico|talent|founder|socio)/.test(q);
            const hasTime = /(tempo|quanto|quando|deadline|durata|cronoprogramma|timeline)/.test(q);

            let response = '';

            if (hasIdea || (hasMarket && hasStrategy)) {
                response += '📊 **Analisi Idea Imprenditoriale**\n\n';
                response += 'Per valutare la tua idea, considera questi fattori chiave:\n\n';
                response += '1. **Problema-Soluzione Fit**: Il tuo prodotto risolve un problema reale? Verificalo con interviste ai potenziali clienti (problema-solution fit).\n\n';
                response += '2. **TAM/SAM/SOM**: Stima il mercato totale (TAM), quello indirizzabile (SAM) e quello ottenibile (SOM). Per una startup early-stage, conquistare anche solo l\'1-2% del SAM è un traguardo realistico.\n\n';
                response += '3. **Vantaggio Competitivo**: Cosa ti differenzia? Prezzo, tecnologia, rete distributiva, brand? Identifica il tuo "difendibile".\n\n';
                response += '4. **Modello di Business**: Come generi revenue? SaaS, marketplace, commissioni, pubblicità? Assicurati che i margini siano sostenibili.\n\n';
                response += '5. **Traction Metrics**: Definisci KPI chiari: CAC (costo acquisizione cliente), LTV (valore lifetime), tasso di conversione, churn rate.\n\n';
                if (hasFinance) {
                    response += '💡 **Suggerimento Finanziario**: Per una startup pre-seed, un budget di 12-18 mesi di runway è lo standard. Cerca angel investor o programmi di accelerazione per il primo round.\n\n';
                }
                response += '🔍 _Consiglio_: Fai un Lean Canvas per chiarire tutti gli aspetti critici del tuo business in una pagina.';
            } else if (hasMarket && hasStrategy) {
                response += '📈 **Strategia Go-To-Market**\n\n';
                response += 'Una strategia GTM efficace si articola in 3 fasi:\n\n';
                response += '**FASE 1: PRE-LANCIO (1-3 mesi)**\n';
                response += '- Definisci ICP (Ideal Customer Profile) con dati demografici, comportamentali e psicografici\n';
                response += '- Crea una landing page con waitlist per validare la domanda\n';
                response += '- Identifica 3-5 canali di acquisizione da testare (es. LinkedIn Ads, Content Marketing, Partnership)\n';
                response += '- KPI: 500+ lead qualificati prima del lancio\n\n';
                response += '**FASE 2: LANCIO (1 mese)**\n';
                response += '- Strategia di product-led growth o sales-led a seconda del segmento\n';
                response += '- Attiva ambassador e early adopters con programma referral\n';
                response += '- KPI: 100+ clienti paganti nel primo mese\n\n';
                response += '**FASE 3: SCALING (3-6 mesi)**\n';
                response += '- Ottimizza i canali con miglior ROAS (ritorno spesa pubblicitaria)\n';
                response += '- Espandi a nuovi segmenti/mercati\n';
                response += '- KPI: crescita mese su mese del 20%+';
            } else if (hasFinance) {
                response += '💰 **Analisi Finanziaria**\n\n';
                response += 'Ecco i punti chiave da considerare:\n\n';
                response += '- **CAC (Costo Acquisizione Cliente)**: Per SaaS B2B, un CAC di €500-2000 è normale. Per B2C, €10-50.\n';
                response += '- **LTV (Lifetime Value)**: Il rapporto LTV:CAC dovrebbe essere almeno 3:1 per un business sostenibile.\n';
                response += '- **Burn Rate**: Calcola il tuo consumo mensile di cassa e assicurati di avere 12-18 mesi di runway.\n';
                response += '- **Margini Lordi**: Per SaaS, margini del 70-85% sono standard. Per e-commerce, 40-60%.\n';
                response += '- **Break-even Point**: Quando raggiungerai il pareggio? Calcola: costi fissi / (prezzo medio - costo variabile per unità).\n\n';
                response += '💡 _Suggerimento_: Usa un modello finanziario a 3 statement (Conto Economico, Stato Patrimoniale, Cash Flow) per previsioni accurate.';
            } else if (hasRisk) {
                response += '⚠️ **Analisi dei Rischi**\n\n';
                response += 'Ecco i principali rischi da considerare e come mitigarli:\n\n';
                response += '1. **Rischio di Mercato**: La domanda potrebbe essere insufficiente. Mitigazione: convalida con MVP e pre-ordini prima di sviluppare.\n\n';
                response += '2. **Rischio Competitivo**: Grandi player o nuovi entranti. Mitigazione: trova un vantaggio competitivo difendibile (tecnologia proprietaria, network effect, costi).\n\n';
                response += '3. **Rischio Esecutivo**: Il team potrebbe non riuscire a eseguire il piano. Mitigazione: assumi gradualmente, focus su priorità.\n\n';
                response += '4. **Rischio Normativo**: Regolamenti in evoluzione (privacy, AI Act, settoriali). Mitigazione: consulenza legale preventiva.\n\n';
                response += '5. **Rischio Finanziario**: Capitale insufficiente. Mitigazione: fundraising tempestivo, revenue generation early.\n\n';
                response += '🛡️ _Strategia di Mitigazione_: Crea un Risk Register con probabilità e impatto per ogni rischio, e un piano di contingenza.';
            } else if (hasTech) {
                response += '⚙️ **Consulenza Tecnologica**\n\n';
                response += 'Considerazioni tecniche per il tuo progetto:\n\n';
                response += '- **Architettura**: Scegli stack moderno e scalabile. Preferisci soluzioni serverless per iniziare (riducono costi fissi).\n';
                response += '- **Time-to-Market**: Usa framework e piattaforme esistenti. Non reinventare la ruota.\n';
                response += '- **Mobile-First**: Oltre il 60% del traffico web è mobile. Assicurati UX responsive.\n';
                response += '- **Data Strategy**: Pianifica raccolta dati fin dal giorno 1. I dati sono il tuo vantaggio competitivo futuro.\n';
                response += '- **Security**: Implementa sicurezza by design, specialmente con dati utente (GDPR compliance).\n\n';
                response += '💡 _Stack Raccomandato_: Next.js/React per frontend, Node.js/Python per backend, PostgreSQL per dati, Vercel/AWS per hosting.';
            } else if (hasTeam) {
                response += '👥 **Consulenza Team & Organizzazione**\n\n';
                response += 'Costruire il team giusto è cruciale:\n\n';
                response += '- **Founder Fit**: Le startup di successo hanno fondatori con competenze complementari (es. tecnico + commerciale).\n';
                response += '- **Early Hires**: Assumi per attitudine prima che per esperienza. Le prime 5-10 persone definiscono la cultura.\n';
                response += '- **Equity Pool**: Riserva il 10-20% delle quote per i primi dipendenti chiave. Vesting a 4 anni con cliff di 1 anno.\n';
                response += '- **Remote vs Office**: Il modello ibrido è oggi lo standard. Definisci processi asincroni chiari.\n\n';
                response += '💡 _Suggerimento_: Cerca co-founder in eventi di startup, piattaforme come Founder2be o community come Indie Hackers.';
            } else if (hasTime) {
                response += '⏱️ **Tempistiche e Pianificazione**\n\n';
                response += 'Una timeline tipica per una startup:\n\n';
                response += '- **Mese 1-2**: Validazione idea, customer discovery, lean canvas\n';
                response += '- **Mese 3-4**: MVP development, test con utenti early\n';
                response += '- **Mese 5-6**: Beta launch, prime revenue, raccolta feedback\n';
                response += '- **Mese 7-9**: Product-market fit, iterazione basata su dati\n';
                response += '- **Mese 10-12**: Scaling, fundraising seed round\n\n';
                response += '⚠️ _Nota_: Queste sono stime indicative. La maggior parte delle startup impiega 12-18 mesi per trovare product-market fit.';
            } else if (hasAdvice) {
                response += '💡 **Consulenza Strategica**\n\n';
                response += 'Ecco i miei consigli chiave per il tuo percorso imprenditoriale:\n\n';
                response += '1. **Fail Fast**: Testa le tue ipotesi il prima possibile con il minimo sforzo. Un fallimento rapido è un apprendimento economico.\n\n';
                response += '2. **Customer Obsession**: Parla con 20+ potenziali clienti PRIMA di scrivere una riga di codice. Le migliori idee nascono dai problemi reali.\n\n';
                response += '3. **Focus su una cosa**: Fai una cosa eccezionalmente bene invece di 10 cose mediamente. Il focus è il superpotere delle startup.\n\n';
                response += '4. **Metriche > Opinion**: Basa ogni decisione su dati reali. Imposta un dashboard con le metriche chiave dal giorno 1.\n\n';
                response += '5. **Network**: Costruisci relazioni nel tuo ecosistema. I migliori deal, partnership e talenti arrivano dal networking autentico.\n\n';
                response += '6. **Resilienza**: Il percorso imprenditoriale è un rollercoaster. Prenditi cura di te stesso e celebra le piccole vittorie.\n\n';
                response += '🚀 _Se hai una domanda più specifica, chiedimi pure!_';
            } else if (hasAnalysis) {
                response += '🔍 **Analisi su Richiesta**\n\n';
                response += 'Ecco un framework per analizzare qualsiasi scenario imprenditoriale:\n\n';
                response += '1. **Contesto**: Inquadra il problema nel suo contesto di mercato e temporale\n';
                response += '2. **Dati**: Identifica i dati rilevanti e le fonti per validare le ipotesi\n';
                response += '3. **Opzioni**: Elenca almeno 3 opzioni/strategie con i loro trade-off\n';
                response += '4. **Raccomandazione**: Scegli l\'opzione migliore con motivazioni chiare\n';
                response += '5. **Action Plan**: Definisci i prossimi 3 passi concreti\n\n';
                response += '💡 _Per un\'analisi dettagliata, fornisci più contesto specifico sulla tua situazione._';
            } else {
                response += '🤖 **Consulente Strategico AI**\n\n';
                response += 'Ciao! Sono Alpha, il tuo consulente strategico personale. Posso aiutarti con:\n\n';
                response += '📊 Analisi di idee imprenditoriali e business plan\n';
                response += '📈 Strategie Go-To-Market e crescita\n';
                response += '💰 Pianificazione finanziaria e fundraising\n';
                response += '⚠️ Analisi dei rischi e mitigazione\n';
                response += '⚙️ Consulenza tecnologica e stack\n';
                response += '👥 Team building e organizzazione\n';
                response += '⏱️ Timeline e pianificazione progetto\n\n';
                response += 'Cosa vuoi approfondire oggi? Fammi una domanda specifica! 🚀';
            }

            return response;
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
            const gk = localStorage.getItem('alphaos-apikey'); if (gk) this.apiKey = gk;
            const ok = localStorage.getItem('alphaos-apikey-openai'); if (ok) this.apiKeyOpenAI = ok;
            const ak = localStorage.getItem('alphaos-apikey-anthropic'); if (ak) this.apiKeyAnthropic = ak;
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
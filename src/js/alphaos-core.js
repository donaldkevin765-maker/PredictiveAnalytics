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
        _history: [],
        _maxHistory: 10,
        sendMessage: async function() {
            const inputEl = document.getElementById('chat-input'); if (!inputEl) return;
            const text = inputEl.value.trim(); if (!text) return;
            this.appendMessage('user', text); inputEl.value = '';
            AlphaOS.NeuralNet.activate();
            const loadingId = this.appendMessage('ai', 'Elaborazione in corso...');
            try {
                this._history.push({ role: 'user', text: text });
                const enabled = AlphaOS.API.getEnabledProviders();
                let reply = null;
                if (enabled.length > 0) {
                    const context = this._history.slice(-6).map(m => (m.role === 'user' ? 'Utente' : 'AI') + ': ' + m.text).join('\n');
                    const prompt = (AlphaOS.systemPrompt || 'Sei un consulente strategico esperto.') +
                        '\n\nStorico conversazione:\n' + context +
                        '\n\nRispondi all\'ultima domanda in modo diretto, professionale e utile. Massimo 300 parole.';
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
                this._history.push({ role: 'ai', text: reply });
                if (this._history.length > this._maxHistory) this._history = this._history.slice(-this._maxHistory);
                this.updateMessage(loadingId, reply);
            } catch (e) {
                const fallback = this._localFallback(text);
                this._history.push({ role: 'ai', text: fallback });
                this.updateMessage(loadingId, fallback);
                AlphaOS.Toast.info('AI Locale', 'Generata in modalità offline (errore API)');
            }
        },
        clearHistory: function() {
            this._history = [];
            const el = document.getElementById('chat-history');
            if (el) el.innerHTML = '';
        },
        _localFallback: function(question) {
            const q = question.toLowerCase();
            const words = q.split(/\s+/).filter(w => w.length > 2);

            const isFollowUp = /(dimmi di più|approfondisci|spiegami meglio|continua|esempio|esempi|puoi|fammi un|ad esempio|cioè|in pratica|come|perché|perche|quale|quali|ancora|altro)/.test(q) && words.length < 8;
            const isGreeting = /(ciao|salve|buongiorno|buonasera|hey|hello|hi|saluti)/.test(q);
            const hasMarket = /(mercato|market|business|vendita|clienti|concorrenti|trend|settore|domanda|offerta)/.test(q);
            const hasStrategy = /(strategia|piano|go-to-market|gtm|lancio|crescita|scaling|espansione)/.test(q);
            const hasFinance = /(finanza|budget|costo|investimento|revenue|profitto|margine|prezzo|funding|capitale|economico)/.test(q);
            const hasRisk = /(rischio|rischi|pericolo|criticità|problema|debolezza|minaccia|critico)/.test(q);
            const hasTech = /(tech|tecnologia|software|app|digitale|piattaforma|sviluppo|dati|ai|ia|algoritmo)/.test(q);
            const hasIdea = /(idea|startup|business plan|progetto|innovazione|imprenditoriale)/.test(q);
            const hasAdvice = /(consiglio|consigli|aiuto|suggerimento|opinione|parere|sconsigli|raccomanda)/.test(q);
            const hasAnalysis = /(analisi|analizza|valuta|valutazione|dimmi|spiega|cos'è|che cos)/.test(q);
            const hasTeam = /(team|persone|assunzioni|ruoli|talent|founder|socio|organico)/.test(q);
            const hasTime = /(tempo|quanto|quando|deadline|durata|cronoprogramma|timeline|scadenza)/.test(q);
            const hasDeepDive = /(esempio|pratico|concreto|caso|casi|numeri|dati|statistiche|referenze)/.test(q);

            const lastAiMsg = this._history.slice().reverse().find(m => m.role === 'ai');
            const lastTopic = lastAiMsg ? this._detectTopic(lastAiMsg.text) : null;

            if (isGreeting) {
                return '🤖 **Ciao!** Sono Alpha, il tuo consulente strategico.\n\nCome posso aiutarti oggi? Ecco cosa so fare:\n\n📊 **Validazione idee** — Analizzo il potenziale della tua business idea\n📈 **Strategia GTM** — Progetto il go-to-market perfetto\n💰 **Finanza** — Budget, CAC, LTV, fundraising\n⚠️ **Rischi** — Identifico e mitigo le criticità\n⚙️ **Tecnologia** — Scelgo lo stack giusto per te\n👥 **Team** — Organizzazione e talenti\n\nChiedimi pure qualsiasi cosa! 🚀';
            }

            if (isFollowUp && lastTopic) {
                return this._expandTopic(lastTopic, hasDeepDive);
            }

            const topics = [];
            if (hasIdea || (hasMarket && hasStrategy)) topics.push('idea');
            if (hasFinance) topics.push('finance');
            if (hasRisk) topics.push('risk');
            if (hasTech) topics.push('tech');
            if (hasTeam) topics.push('team');
            if (hasTime) topics.push('time');
            if (hasAdvice) topics.push('advice');
            if (hasAnalysis && topics.length === 0) topics.push('analysis');

            if (topics.length > 0) {
                return this._generateResponse(topics[0], q);
            }

            if (words.length < 2) {
                return '🤖 **Non ho capito bene la tua richiesta.**\n\nPuoi chiedermi:\n- "Analizza questa idea: ..."\n- "Fammi una strategia GTM per ..."\n- "Quali sono i rischi di ..."\n- "Che budget serve per ..."\n- "Consigliami su ..."\n\nO scegli uno dei temi sopra!';
            }

            return this._generateResponse('general', q);
        },

        _detectTopic: function(text) {
            const t = text.toLowerCase();
            if (t.includes('idea') || t.includes('business plan') || t.includes('startup')) return 'idea';
            if (t.includes('go-to-market') || t.includes('lancio') || t.includes('gtm') || t.includes('crescita')) return 'strategy';
            if (t.includes('cac') || t.includes('ltv') || t.includes('budget') || t.includes('revenue') || t.includes('margine') || t.includes('break-even')) return 'finance';
            if (t.includes('rischio') || t.includes('mitigazione') || t.includes('risk')) return 'risk';
            if (t.includes('stack') || t.includes('tecnologia') || t.includes('architettura') || t.includes('serverless')) return 'tech';
            if (t.includes('team') || t.includes('founder') || t.includes('equity')) return 'team';
            if (t.includes('temp') || t.includes('cronoprogramma') || t.includes('timeline')) return 'time';
            return null;
        },

        _expandTopic: function(topic, detailed) {
            const expansions = {
                idea: detailed
                    ? '📊 **Esempio Pratico — Validazione Idea**\n\nPrendiamo un\'idea concreta: un\'app per la prenotazione di servizi di bellezza a domicilio.\n\n**Problema-Soluzione Fit**:\n- 78% delle donne trova scomodo andare dal parrucchiere (fonte NPD Group)\n- Soluzione: matching professionista + cliente in 30 minuti\n\n**TAM**: €4.2B (mercato bellezza Italia) | **SAM**: €800M (servizi a domicilio) | **SOM**: €40M (5% realistico anno 3)\n\n**Modello**: Commissione 20% per transazione. CAC medio €12, LTV €180 (rapporto 15:1, eccellente)\n\n**Competitor**: Tratt bene (solo parrucchieri), MyHome (solo massaggi). Differenziazione: multi-servizio con AI matching.\n\n💡 _Hai un\'idea specifica? Descrivimela e la analizzo!_'
                    : '📊 **Approfondimento — Validazione Idea**\n\nOltre ai 5 punti chiave che ti ho menzionato, ci sono altri aspetti critici:\n\n**Product-Market Fit Score**: Usa il sondaggio di Sean Ellis — se il 40%+ degli utenti sarebbe "molto deluso" senza il tuo prodotto, hai trovato il PMF.\n\n**Lean Canvas**: Invece del business plan tradizionale, usa il Lean Canvas (1 pagina). Copre: problema, soluzione, metriche chiave, vantaggio competitivo.\n\n**Validation Board**: Crea 3 ipotesi critiche e testale con esperimenti minimi (interviste, landing page, MVP).\n\n**Costo Validazione**: Con €500-2000 puoi validare un\'idea in 4-6 settimane.\n\n🔍 _Vuoi che ti faccia un esempio pratico di validazione?_',
                strategy: detailed
                    ? '📈 **Esempio GTM — App Fitness Coaching**\n\n**FASE 1: PRE-LANCIO**\n- ICP: Donne 25-40, urbano, reddito medio-alto, già abbonate in palestra\n- Canali testati: Instagram Ads (CPA €3.50), Influencer micro (€500/post), Referral (30% conversione)\n- Budget: €5.000 per 8 settimane di test\n- KPI raggiunto: 1.200 lead qualificati, 8% tasso conversione waitlist\n\n**FASE 2: LANCIO**\n- Product-led growth: 7 giorni free trial, poi €14.99/mese\n- Ambassador: 50 early users con codice referral sconto 20%\n- PR: 3 articoli su testate fitness (Hustle, WellWhere, FitPulse)\n- KPI: 340 clienti paganti al mese 1 (€5.100 MRR)\n\n**FASE 3: SCALING**\n- Canale vincente: Instagram (ROAS 4.2x) → moltiplicato budget x3\n- Nuovo segmento: uomo 30-50, running/triathlon\n- KPI: €25.000 MRR al mese 6, CAC sceso a €8\n\n💡 _Che settore ti interessa? Ti faccio un esempio personalizzato._'
                    : '📈 **Approfondimento — Go-To-Market**\n\nEcco dettagli operativi sulle 3 fasi:\n\n**Pre-lancio — Ricerca Competitor**: NON limitarti a chi fa la stessa cosa. I tuoi competitor sono anche tutte le alternative che il cliente ha per risolvere lo stesso problema (compreso "non fare nulla").\n\n**Canali di Acquisizione**: Non disperderti su 10 canali. Scegli i 2 canali con miglior product-channel fit. Per SaaS B2B: LinkedIn + Email outreach. Per D2C: Instagram/TikTok + Referral.\n\n**Pricing**: Prova 3 modelli: subscription, usage-based, freemium. Il prezzo ottimale è quando chiedi "Cosa pagheresti?" e il 30% dice "Di più" e il 30% dice "Troppo".\n\n💰 _Vuoi un esempio concreto di GTM con numeri reali?_',
                finance: detailed
                    ? '💰 **Esempio — Modello Finanziario SaaS**\n\n**Ipotesi**: SaaS B2B, €49/mese, team 3 persone\n\n**Costi Mensili**:\n- Stipendi: €12.000 (3 persone)\n- Cloud/Infra: €800 (AWS starter)\n- Marketing: €3.000 (ADS + content)\n- Strumenti: €500 (Notion, Slack, CRM)\n- TOT: €16.300/mese\n\n**Unità Economica**:\n- CAC: €1.200 (ADS €600 + Sales €400 + Content €200)\n- LTV: €3.528 (€49 x 72 mesi retention media SaaS = 3.528)\n- Rapporto LTV/CAC: 2.94 (soglia salute: 3+)\n- Payback period: 24.5 mesi (deve essere < 18)\n\n**Azioni Correttive**:\n1. Ridurre CAC a €1.000 (ottimizzando ADS)\n2. Aumentare prezzo a €69/mese (con piano premium)\n3. Ridurre churn dal 5% al 3%/mese\n\n**Risultato**: Nuovo LTV €6.900, rapporto 6.9:1, payback 10 mesi.\n\n📊 _Vuoi che calcoli il modello per la tua idea? Dammi i numeri chiave._'
                    : '💰 **Approfondimento — Metriche Finanziarie**\n\nEcco come calcolare e interpretare ogni metrica:\n\n**CAC (Costo Acquisizione Cliente)**\nFormula: (Spese Marketing + Spese Sales) / Nuovi Clienti\nEsempio: Spendi €10.000/mese, acquisisci 50 clienti → CAC = €200\n\n**LTV (Lifetime Value)**\nFormula: Valore Medio Ordine × Frequenza × Durata (mesi)\nEsempio: €49/mese × 24 mesi = €1.176\n\n**Rapporto LTV:CAC**\n- < 1: stai perdendo soldi su ogni cliente\n- 1-3: buono, ma ottimizza\n- 3+: eccellente, investi di più in acquisizione\n\n**Break-even**\nCostiFissi / (Prezzo - CostoVariabile) = unità per pareggiare\n\n*Vuoi che ti faccia un esempio finanziario completo con numeri reali?*',
                risk: detailed
                    ? '⚠️ **Esempio — Risk Assessment App Fintech**\n\n**Rischio #1: Regolamentazione**\n- Probabilità: Alta (80%)\n- Impatto: Critico\n- Azione: Consulente compliance da subito, budget €15K\n- Back-up: Modello B2B (vendi API a banche) se B2C bloccato\n\n**Rischio #2: Competizione Big Tech**\n- Probabilità: Media (40%)\n- Impatto: Alto\n- Azione: Focus su nicchia (underbanked, giovani 18-25) prima che arrivino\n- Back-up: Partnership strategica con banca incumbent\n\n**Rischio #3: Cybersecurity**\n- Probabilità: Media (30%)\n- Impatto: Critico\n- Azione: Penetration test trimestrale, bug bounty program\n- Back-up: Assicurazione cyber (€5K/anno premium)\n\n**Risk Register**: Crea una matrice 5×5 e aggiornala ogni mese.\n\n🛡️ _Hai un progetto specifico? Valutiamo i rischi insieme._'
                    : '⚠️ **Approfondimento — Risk Mitigation**\n\nStrategie pratiche per ogni categoria:\n\n**Rischio di Mercato**:\n- Crea un MVP in 2-4 settimane (non di più!)\n- Pre-vendi prima di sviluppare: se 20 persone pagano, hai validazione\n- Landing page + Google Ads per testare domanda (€500 bastano)\n\n**Rischio Competitivo**:\n- Trova il tuo "Blue Ocean": dove nessuno sta giocando\n- Network effect: più utenti hai, più vale il tuo prodotto (es. Uber, Airbnb)\n- Dati proprietari: accumula dati che i competitor non hanno\n\n**Rischio Esecutivo**:\n- OKR settimanali: focus su 3-5 obiettivi chiave\n- Retrospettive ogni 2 settimane: cosa funziona/cosa no\n- Pianifica 2x il budget: tutto costa il doppio e prende il triplo del tempo\n\n*Hai un rischio specifico che ti preoccupa? Ne parliamo.*',
                tech: detailed
                    ? '⚙️ **Esempio — Stack per Marketplace**\n\n**Scenario**: Marketplace per servizi professionali freelance\n\n**Frontend**:\n- Next.js (SSR per SEO, ISR per pagine dinamiche)\n- TailwindCSS + Shadcn UI\n- Costo: gratuito (open source)\n\n**Backend**:\n- Node.js + Express (API REST)\n- PostgreSQL (dati strutturati) + Redis (cache/sessioni)\n- Costo: ~$50/mese su AWS/Azure\n\n**AI Features**:\n- Matching freelance-cliente: Python + scikit-learn\n- Recommendation engine: TensorFlow\n- Costo: ~$200/mese per training + inference\n\n**Infrastruttura**:\n- Vercel (frontend, gratis fino a 100K richieste)\n- Supabase (DB + auth, gratis fino a 500MB)\n- AWS Lambda (backend serverless, ~$1/mese per 1M richieste)\n\n**Costo Totale Mese 1-6**: ~$80/mese\n**Scalato a 10K utenti**: ~$400/mese\n\n💻 _La tua idea ha requisiti tecnici specifici? Raccontami._'
                    : '⚙️ **Approfondimento — Scelte Tecniche**\n\nEcco considerazioni pratiche per ogni fase:\n\n**Fase 0 — Prototipo (Mesi 1-2)**\n- No-code: Bubble, Adalo o Webflow per validare velocemente\n- Costo: €0-30/mese\n- Tempo: 1-2 settimane per MVP funzionante\n\n**Fase 1 — Early (Mesi 3-12)**\n- Stack leggero: Next.js + Supabase + Vercel\n- Costo: €50-200/mese\n- Se hai bisogno di AI: APIs (OpenAI, Gemini) o modelli open source\n\n**Fase 2 — Growth (Anno 2+)**\n- Architettura event-driven: microservizi se team > 5\n- Database scalabile: read replicas, sharding\n- Costo: €500-2000/mese\n\n**Regola d\'oro**: Scegli la tecnologia che il TUO team conosce meglio. La tech debt si paga dopo. La velocità di execution è l\'unico vero vantaggio competitivo.\n\n*Quale stack preferisci per il tuo progetto?*',
                team: detailed
                    ? '👥 **Esempio — Team Startup AI**\n\n**Fase Seed (Team 3 persone)**:\n- CEO: Product vision, fundraising, business dev\n- CTO: Architettura, sviluppo core, AI/ML\n- COO: Operations, customer success, finance\n- Equity split: 40/35/25 con vesting 4 anni, cliff 1 anno\n\n**Fase Series A (Team 12 persone)**:\n- Aggiungi: 2 dev, 1 designer, 1 marketing, 1 sales, 1 customer support\n- Opzioni pool: 15% per nuovi assunti\n- Cash comp: 60-80% del mercato + equity\n\n**Cultura Aziendale**:\n- Remote-first: riunioni asincrone, documentazione scritta\n- OKR trimestrali: 3-5 obiettivi con 2-4 KPI ciascuno\n- Feedback culture: retrospettive settimanali\n\n**Pitfall Comune**: Non assumere il "founder simile". Cerca diversità di skill e prospettive. I migliori team hanno competenze complementari, non sovrapposte.\n\n*Che composizione di team hai in mente?*'
                    : '👥 **Approfondimento — Team Building**\n\nPunti chiave per costruire il team iniziale:\n\n**Founder Match**: Il 65% delle startup fallisce per conflitti tra founder. Prima di iniziare:\n- Fate un "trial period" di 1 mese su un progetto\n- Definite chiari ruoli e responsabilità\n- Firmate un Founders Agreement con vesting\n\n**Prime Assunzioni**:\n- Hiring #1: Full-stack developer (se sei technical founder) o CTO\n- Hiring #2: Sales/Marketing (se sei technical) o dev (se sei business)\n- Regola: assumi T-shaped people (specialisti con skill trasversali)\n\n**Remote Setup**:\n- Tool stack: Slack (comunicazione), Linear (task), Notion (docs), Loom (video async)\n- Meeting: max 30 min con agenda scritta\n- Cultura: documenta tutto, anche quello che sembra ovvio\n\n*Cerchi un co-founder? Raccontami il tuo progetto.*',
                time: detailed
                    ? '⏱️ **Esempio — Timeline Marketplace**\n\n**Mese 1-2: Discovery & Validazione**\n- Settimana 1-2: Problem validation (15 interviste clienti + 10 interviste professionisti)\n- Settimana 3-4: Soluzione design, prototipo Figma\n- Settimana 5-6: Landing page + waitlist, test ADS €500\n- Settimana 7-8: Iterazione su feedback, definizione MVP scope\n\n**Mese 3-4: MVP Development**\n- Settimana 9-10: Auth + Profili utente\n- Settimana 11-12: Sistema di matching base\n- Settimana 13-14: Pagamenti + Booking\n- Settimana 15-16: Test interni + bug fixing\n\n**Mese 5: Beta Privata**\n- 50 utenti invitati, feedback giornaliero\n- KPI: completamento transazioni, NPS, bug report\n\n**Mese 6: Lancio Pubblico**\n- Soft launch su una città\n- PR locali, influencer micro, ADS\n\n**Mese 7-12: Scaling**\n- Espansione a 3 città\n- Ottimizzazione prodotto su dati reali\n\n💡 _Su che timeline stai lavorando? Qual è la tua deadline?_'
                    : '⏱️ **Approfondimento — Tempistiche Startup**\n\nFattori che influenzano i tempi:\n\n**Complessità Prodotto**:\n- Semplice (landing page + form): 1-2 settimane\n- Medio (app con auth + DB): 1-2 mesi\n- Complesso (marketplace/AI): 3-6 mesi\n\n**Team**:\n- Founder singolo: 2x i tempi\n- 2 co-founder tecnici: tempi standard\n- Team di 3+: 0.7x i tempi\n\n**Budget**:\n- Bootstrap: tempi più lunghi (si lavora quando si può)\n- Pre-seed: full-time, tempi standard\n- Seed: puoi assumere, tempi compressi\n\n**Regola Empirica**: Prendi la tua stima migliore → moltiplica per 2 e aggiungi il 50%. Esempio: "3 mesi" → 3×2+1.5 = 7.5 mesi. Realistico.\n\n*Qual è la tua scadenza ideale? Lavoriamo a ritroso.*',
                advice: detailed
                    ? '💡 **Esempio — Strategia per App Educativa**\n\n**Scenario**: Vuoi lanciare un\'app per imparare inglese con AI conversation\n\n**Strategia**:\n1. **Differenziazione**: Invece di competere con Duolingo/Babbel, focus su spoken English per business (nicchia B2B)\n2. **GTM**: Partnership con HR aziende per employee training. Canale: LinkedIn + referral HR manager\n3. **Pricing**: €29/mese utente singolo, €19/utente per team aziende\n4. **Viral Loop**: Ogni sessione genera un report "miglioramenti" che l\'utente condivide su LinkedIn → traffico organico\n\n**KPI Mese 1-6**:\n- 200 utenti paganti (B2C)\n- 5 aziende clienti (50+ utenti totali)\n- MRR: €5.000\n\n**Raccomandazione**: Inizia con un canale solo (LinkedIn), ottimizza al massimo, poi espandi. Meglio 1 canale che rende €10K che 5 canali che rendono €2K ciascuno.\n\n*Ti serve una strategia su misura per la tua idea?*'
                    : '💡 **Approfondimento — Principi Strategici**\n\nEcco come applicare i 6 consigli nella pratica:\n\n**Fail Fast — Framework Sperimentale**:\nFormatta ogni ipotesi come: "Credo che [azione] produrrà [risultato]. Lo verificherò con [esperimento] in [tempo]. Il successo è [metrica]."\n\n**Customer Obsession — Tecnica MOM**:\nPrima di sviluppare, fai "Moments of Misery" map: elenca 20 momenti di frustrazione del tuo target. Il tuo prodotto eliminerà il peggiore.\n\n**Focus — Regola 80/20**:\nIdentifica il 20% delle feature che produrranno l\'80% del valore. Taglia tutto il resto. Se non è essenziale per il lancio, non lo è.\n\n**Metriche — North Star Metric**:\nTrova LA metrica che correla col successo a lungo termine. Per Airbnb: notti prenotate. Per Slack: messaggi inviati. Per te?\n\n*Quale principio vuoi approfondire?*',
                analysis: detailed
                    ? '🔍 **Analisi — Framework Completo**\n\n**Strumento: Business Model Canvas**\n\n| Componente | Domande Chiave |\n|------------|----------------|\n| Problema | Qual è il problema? Come lo risolvono ora? |\n| Proposta Valore | Cosa rende unico il tuo prodotto? |\n| Segmento Clienti | Chi paga? Chi usa? Chi decide? |\n| Canali | Come raggiungi i clienti? |\n| Revenue | Cosa pagano? Ogni quanto? |\n| Risorse Chiave | Di cosa hai bisogno per funzionare? |\n| Attività Chiave | Cosa devi fare ogni giorno? |\n| Partner | Chi ti aiuta a scalare? |\n| Costi | Dove vanno i soldi? |\n\n**Esercizio**: Compila il canvas e condividilo con me. Lo analizzo insieme a te.\n\n*Hai già un\'idea da mettere nel canvas?*'
                    : null
            };
            return expansions[topic] || '🤖 **Su questo argomento posso darti molte più informazioni!**\n\nFammi una domanda specifica su:\n- Validazione idea\n- Business model\n- Metriche finanziarie\n- Risk assessment\n- Stack tecnologico\n- Team building\n- Timeline realistica\n\nCosa vuoi approfondire? 🚀';
        },

        _generateResponse: function(topic, q) {
            const hasDeepDive = /(esempio|pratico|concreto|numeri|dati|quanto|quale|come|perché)/.test(q.toLowerCase());

            const responses = {
                idea: '📊 **Analisi Idea Imprenditoriale**\n\nPer valutare la tua idea, considera questi fattori chiave:\n\n**1. Problema-Soluzione Fit**\nIl tuo prodotto risolve un problema reale? Verificalo con interviste ai potenziali clienti.\n\n**2. TAM/SAM/SOM**\n- TAM (mercato totale): quanto vale il settore?\n- SAM (indirizzabile): che parte puoi raggiungere?\n- SOM (ottenibile): che % puoi realisticamente conquistare?\n\n**3. Vantaggio Competitivo**\nCosa ti differenzia? Prezzo, tecnologia, rete, brand?\n\n**4. Modello di Business**\nCome generi revenue? SaaS, marketplace, commissioni?\n\n**5. Traction Metrics**\nCAC, LTV, tasso conversione, churn rate.\n\n🔍 _Vuoi che approfondisca uno di questi punti o che ti faccia un esempio concreto?_',

                strategy: '📈 **Strategia Go-To-Market**\n\nUna strategia GTM si articola in 3 fasi:\n\n**FASE 1: PRE-LANCIO (1-3 mesi)**\n- Definisci ICP (profilo cliente ideale)\n- Crea landing page + waitlist per validare domanda\n- Testa 3-5 canali di acquisizione\n- KPI: 500+ lead qualificati\n\n**FASE 2: LANCIO (1 mese)**\n- Product-led growth o sales-led?\n- Attiva ambassador con referral program\n- KPI: 100+ clienti paganti\n\n**FASE 3: SCALING (3-6 mesi)**\n- Ottimizza canali con miglior ROAS\n- Espandi a nuovi segmenti/mercati\n- KPI: crescita mensile 20%+\n\n💡 _Vuoi un esempio GTM con numeri reali per il tuo settore?_',

                finance: '💰 **Metriche Finanziarie Chiave**\n\n**CAC (Costo Acquisizione Cliente)**\n- SaaS B2B: €500-2000 | B2C: €10-50\n\n**LTV (Lifetime Value)**\n- Rapporto LTV:CAC deve essere 3:1+\n\n**Burn Rate**\n- Consumo mensile di cassa\n- Assicurati 12-18 mesi di runway\n\n**Margini Lordi**\n- SaaS: 70-85% | E-commerce: 40-60%\n\n**Break-even**\ncosti fissi / (prezzo medio - costo variabile)\n\n📊 _Vuoi un\'analisi finanziaria dettagliata con il tuo modello di business?_',

                risk: '⚠️ **Analisi dei Rischi**\n\nI 5 rischi principali per una startup:\n\n**1. Mercato** — Domanda insufficiente\nMitigazione: MVP + pre-ordini prima di sviluppare\n\n**2. Competitivo** — Grandi player o nuovi entranti\nMitigazione: vantaggio difendibile (tech, network, costi)\n\n**3. Esecutivo** — Team non riesce a eseguire\nMitigazione: assunzioni graduali, priorità chiare\n\n**4. Normativo** — Regolamenti in evoluzione\nMitigazione: consulenza legale preventiva\n\n**5. Finanziario** — Capitale insufficiente\nMitigazione: fundraising tempestivo, revenue early\n\n🛡️ _Hai rischi specifici? Ne parliamo._',

                tech: '⚙️ **Consulenza Tecnologica**\n\nRaccomandazioni tecniche:\n\n**Architettura**: Stack moderno e scalabile. Serverless per iniziare.\n\n**Time-to-Market**: Framework esistenti, non reinventare la ruota.\n\n**Mobile-First**: 60%+ del traffico è mobile. UX responsive è obbligatoria.\n\n**Data Strategy**: Raccogli dati dal giorno 1. Sono il tuo vantaggio futuro.\n\n**Security**: By design, soprattutto con dati utente (GDPR).\n\n💻 _Stack Raccomandato_: Next.js/React, Node.js/Python, PostgreSQL, Vercel/AWS.\n\n*Che tipo di prodotto vuoi sviluppare? Ti aiuto con lo stack.*',

                team: '👥 **Team & Organizzazione**\n\nCostruire il team giusto:\n\n**Founder Fit**: Competenze complementari (es. tecnico + commerciale).\n\n**Early Hires**: Assumi per attitudine, non solo esperienza.\n\n**Equity Pool**: 10-20% per primi dipendenti. Vesting 4 anni, cliff 1 anno.\n\n**Modello**: Ibrido/remote è lo standard. Processi asincroni chiari.\n\n💡 _Cerca co-founder su community startup o eventi di settore._\n\n*Che skill cerchi nel tuo team? Ti consiglio il profilo ideale.*',

                time: '⏱️ **Timeline Tipica Startup**\n\n**Mese 1-2**: Validazione idea, customer discovery, lean canvas\n\n**Mese 3-4**: MVP dev, test con utenti early\n\n**Mese 5-6**: Beta launch, prime revenue, feedback loop\n\n**Mese 7-9**: Product-market fit, iterazione su dati\n\n**Mese 10-12**: Scaling, fundraising seed\n\n⚠️ _Molte startup impiegano 12-18 mesi per trovare PMF._\n\n*Qual è la tua deadline? Lavoriamo a ritroso per pianificare.*',

                advice: '💡 **Consulenza Strategica**\n\nI principi chiave:\n\n1. **Fail Fast** — Testa le ipotesi al minimo sforzo.\n2. **Customer Obsession** — 20+ interviste PRIMA del codice.\n3. **Focus** — Una cosa fatta bene > 10 cose mediocri.\n4. **Metriche > Opinioni** — Dashboard dal giorno 1.\n5. **Network** — Partnership e talenti dal networking.\n6. **Resilienza** — Celebra le piccole vittorie.\n\n🚀 _Che aspetto vuoi approfondire? Ti do un esempio pratico._',

                analysis: '🔍 **Framework di Analisi**\n\nPer analizzare qualsiasi scenario imprenditoriale:\n\n1. **Contesto**: Inquadra problema e mercato\n2. **Dati**: Fonti per validare ipotesi\n3. **Opzioni**: 3+ strategie con trade-off\n4. **Raccomandazione**: La migliore con motivazioni\n5. **Action Plan**: Prossimi 3 passi concreti\n\n💡 _Fornisci più contesto per un\'analisi specifica._',

                general: '🤖 **Consulente Strategico AI**\n\nCiao! Sono Alpha, il tuo consulente strategico personale. Posso aiutarti con:\n\n📊 Validazione idee imprenditoriali\n📈 Strategie Go-To-Market\n💰 Pianificazione finanziaria\n⚠️ Analisi rischi e mitigazione\n⚙️ Consulenza tecnologica\n👥 Team building\n⏱️ Timeline e project planning\n\nCosa vuoi approfondire oggi? Fammi una domanda specifica! 🚀'
            };

            return responses[topic] || responses.general;
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
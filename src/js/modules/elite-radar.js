AlphaOS.EliteRadar = {
    initialized: false, realNews: [], top50Assets: ["Infrastrutture AI", "Acqua Potabile (USA)", "Terre Rare (Africa)", "Cybersecurity Avanzata", "Real Estate (UAE)", "Biotecnologie Longeve", "Difesa Aereospaziale", "Data Centers Autonomi", "Oro Fisico & Riserve", "Privacy Tech", "Agricoltura Verticale", "Robotica Industriale", "Quantum Computing", "Microchip Sub-2nm", "Energie Rinnovabili", "Logistica Marittima"],
    assetData: [], currentAsset: null, currentChartData: [], currentPredictionData: [], currentChartColor: '', chartType: 'line', currentTimeframe: '1m', liveChartInterval: null,
    init: async function() {
        if (this.initialized) return; this.initialized = true;
        const timeEl = document.getElementById('radar-time'), feedEl = document.getElementById('radar-feed');
        let radarVisible = true;
        this._radarSectionVisible = true;
        const radarSection = document.getElementById('elite-radar');
        if (radarSection && 'IntersectionObserver' in window) {
            const ro = new IntersectionObserver((entries) => { radarVisible = entries[0].isIntersecting; this._radarSectionVisible = entries[0].isIntersecting; }, { threshold: 0 });
            ro.observe(radarSection);
        }
        if (timeEl) { this._clockTimer = setInterval(() => { if (!this._radarSectionVisible) return; const now = new Date(); timeEl.innerText = now.toISOString().replace('T', ' ').substring(0, 19) + " UTC"; }, 1000); }
        if (feedEl) {
            feedEl.innerHTML = '<div style="color:var(--text-tertiary); font-family:\'Fira Code\', monospace; font-size:0.85rem; padding: 20px 0;">> Inizializzazione stream...<br>> Acquisizione feed RSS...</div>';
            await this.fetchRealNews(); this.calibrateMarketWithRealNews(); feedEl.innerHTML = '';
            let index = 0;
            const addFeed = () => {
                if (this.realNews.length === 0) return;
                if (!this._radarSectionVisible) { this._feedTimer = setTimeout(addFeed, 2000); return; }
                const item = document.createElement('div'); item.style.padding = "20px 0"; item.style.borderBottom = "1px dashed var(--border-light)"; item.style.animation = "fadeIn 0.6s ease forwards";
                const news = this.realNews[index % this.realNews.length];
                let titleLow = news.title.toLowerCase(), icon = "\U0001f535", statusColor = "#3b82f6", tagText = "BLU - RUMORE";
                if (titleLow.match(/(sanzion|guerra|embargo|tassi|default|attacco|crollo|emergenza|crisi)/)) { icon = "\U0001f534"; statusColor = "var(--semantic-danger)"; tagText = "ROSSO - DIRETTO"; }
                else if (titleLow.match(/(negoziat|elezion|incert|dazi|tension|annunci)/)) { icon = "\U0001f7e1"; statusColor = "#eab308"; tagText = "GIALLO - PROBABILE"; }
                else if (titleLow.match(/(report|analis|strategi|sviluppo|biotech|ricerc)/)) { icon = "\U0001f7e2"; statusColor = "var(--semantic-success)"; tagText = "VERDE - STRATEGICO"; }
                item.innerHTML = '<div style="display: flex; gap: 15px; align-items: flex-start;"><div style="display: flex; flex-direction: column; gap: 6px; width: 130px; flex-shrink: 0;"><div style="font-family: \'Fira Code\', monospace; font-size: 0.65rem; color: ' + statusColor + '; font-weight: 700; text-transform: uppercase;">' + icon + ' ' + tagText + '</div><div style="font-family: \'Fira Code\', monospace; font-size: 0.6rem; color: var(--text-tertiary); text-transform: uppercase;">' + news.source.substring(0, 15) + '</div></div><a href="' + news.link + '" target="_blank" style="color: var(--text-primary); text-decoration: none; font-size: 0.95rem; line-height: 1.5;">' + news.title + '</a></div>';
                feedEl.prepend(item); if (feedEl.children.length > 20) feedEl.removeChild(feedEl.lastChild); index++;
                this._feedTimer = setTimeout(addFeed, 4000 + Math.random() * 3000);
            };
            addFeed();
        }
        for (let i = 0; i < 30; i++) {
            let name = this.top50Assets[i % this.top50Assets.length];
            if (i >= this.top50Assets.length) name += " (Derivati)";
            this.assetData.push({ id: i + 1, name: name, volume: Math.floor(Math.random() * 800) + 50, trend: Math.random() > 0.5 ? 'up' : 'down', baseTrend: Math.random() > 0.5 ? 'up' : 'down' });
        }
        this.renderTop50(); this.start3HourSyncSimulation();
    },
    fetchRealNews: async function() {
        const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=geopolitica+investimenti+economia+mercati&hl=it&gl=IT&ceid=IT:it');
        const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + rssUrl;
        try { const response = await fetch(apiUrl); const data = await response.json(); if (data.status === 'ok' && data.items.length > 0) { this.realNews = data.items.map(item => { let parts = item.title.split(' - '); let source = parts.length > 1 ? parts.pop() : 'MKT GLOBAL'; return { title: parts.join(' - '), source: source, link: item.link }; }); this.realNews.sort(() => Math.random() - 0.5); } else throw new Error("Dati vuoti"); }
        catch (e) { this.realNews = [{ title: "Verifica della latenza del network globale in corso...", source: "SYS.NET", link: "#" }, { title: "Firewall di sicurezza attivato: ritardo nel recupero feed.", source: "SYS.SEC", link: "#" }]; }
    },
    calibrateMarketWithRealNews: function() {
        if (this.realNews.length === 0) return;
        let textCorpus = this.realNews.map(n => n.title.toLowerCase()).join(" ");
        const techKeywords = /(ai|tecnologia|chip|cyber|hacker|dati|cloud|innovazione)/g;
        const techMatches = (textCorpus.match(techKeywords) || []).length;
        this.top50Assets.forEach(name => {
            let lowerName = name.toLowerCase(), score = 0;
            if (lowerName.match(/(ai|cyber|data|quantum|microchip|tech)/)) score = techMatches > 1 ? 1 : -1;
            else score = Math.random() > 0.5 ? 1 : -1;
            let assetIndex = this.assetData.findIndex(a => a.name === name);
            let finalTrend = score >= 0 ? 'up' : 'down';
            if (assetIndex !== -1) this.assetData[assetIndex].baseTrend = finalTrend;
        });
    },
    renderTop50: function() {
        const listEl = document.getElementById('top50-list'); if (!listEl) return;
        this.assetData.sort((a, b) => b.volume - a.volume);
        let html = '';
        this.assetData.forEach((asset, i) => {
            const trendColor = asset.trend === 'up' ? 'var(--semantic-success)' : 'var(--semantic-danger)';
            const trendIcon = asset.trend === 'up' ? '\u2197' : '\u2198';
            html += '<li onclick="AlphaOS.EliteRadar.openAssetDetail(\'' + asset.name + '\', ' + asset.volume + ', \'' + asset.trend + '\')" style="display: flex; justify-content: space-between; align-items: baseline; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; border-radius: 6px;" onmouseover="this.style.background=\'var(--bg-surface-hover)\'" onmouseout="this.style.background=\'transparent\'"><div style="display: flex; gap: 15px; align-items: baseline;"><span style="color: var(--text-tertiary); font-family: \'Fira Code\', monospace; font-size: 0.75rem; width: 20px;">' + (i + 1).toString().padStart(2, '0') + '</span><span style="font-weight: 400; color: var(--text-primary); font-size: 0.95rem;">' + asset.name + '</span></div><div style="font-family: \'Fira Code\', monospace; color: ' + trendColor + '; font-size: 0.9rem; font-weight: 500;">' + trendIcon + ' $' + asset.volume + 'B</div></li>';
        });
        listEl.innerHTML = html;
    },
    openAssetDetail: function(name, volume, trend) {
        const overlay = document.getElementById('asset-modal-overlay'), modal = document.getElementById('asset-modal');
        if (!overlay || !modal) return;
        this.currentAsset = { name, volume, trend };
        document.getElementById('asset-detail-name').innerText = name.toUpperCase();
        document.getElementById('asset-detail-vol').innerText = '$' + volume + 'B';
        const trendEl = document.getElementById('asset-detail-trend');
        const perc = (Math.random() * 8 + 0.5).toFixed(2);
        if (trend === 'up') { trendEl.innerText = '+' + perc + '%'; trendEl.style.color = 'var(--semantic-success)'; trendEl.style.background = 'rgba(16,185,129,0.1)'; }
        else { trendEl.innerText = '-' + perc + '%'; trendEl.style.color = 'var(--semantic-danger)'; trendEl.style.background = 'rgba(239,68,68,0.1)'; }
        this.currentChartColor = trend === 'up' ? 'var(--semantic-success)' : 'var(--semantic-danger)';
        this.currentPredictionData = [];
        this.currentChartData = this.generateAssetChartData(trend, 30);
        this.renderChart();
        if (this.liveChartInterval) clearInterval(this.liveChartInterval);
        this.liveChartInterval = setInterval(() => { this.updateLiveChart(); }, 2500);
        overlay.style.display = 'flex'; setTimeout(() => { overlay.style.opacity = '1'; modal.classList.add('open'); }, 10);
    },
    closeAssetDetail: function() {
        const overlay = document.getElementById('asset-modal-overlay'), modal = document.getElementById('asset-modal');
        if (!overlay || !modal) return;
        if (this.liveChartInterval) clearInterval(this.liveChartInterval); this.liveChartInterval = null;
        overlay.style.opacity = '0'; modal.classList.remove('open'); setTimeout(() => { overlay.style.display = 'none'; }, 300);
    },
    updateLiveChart: function() {
        if (!this.currentAsset || !this.currentChartData || this.currentChartData.length === 0) return;
        const lastPoint = this.currentChartData[this.currentChartData.length - 1];
        const open = lastPoint.close, change = (Math.random() - (this.currentAsset.trend === 'up' ? 0.45 : 0.55)) * 5;
        let close = open + change; if (close < 5) close = 5; if (close > 95) close = 95;
        this.currentChartData.shift();
        this.currentChartData.push({ date: new Date(), open, close, high: close + Math.random() * 3, low: close - Math.random() * 3, val: close, isPrediction: false });
        this.renderChart();
    },
    changeTimeframe: function(label, type) { this.currentTimeframe = type; this.currentChartData = this.generateAssetChartData(this.currentAsset.trend, 30); this.renderChart(); },
    generateAssetChartData: function(trend, points) {
        let data = [], currentVal = trend === 'up' ? 20 : 80;
        for (let i = 0; i < points; i++) { const change = (Math.random() - (trend === 'up' ? 0.45 : 0.55)) * 8; currentVal += change; if (currentVal < 5) currentVal = 5; if (currentVal > 95) currentVal = 95; data.push({ date: new Date(), open: currentVal - change, close: currentVal, high: currentVal + Math.random() * 4, low: currentVal - Math.random() * 4, val: currentVal, isPrediction: false }); }
        return data;
    },
    runPrediction: async function() {
        if (!this.currentAsset) return;
        const btn = document.getElementById('btn-run-prediction'), loader = document.getElementById('pred-loading'), introText = document.getElementById('pred-intro-text');
        if (btn) btn.style.display = 'none'; if (introText) introText.style.display = 'none'; if (loader) loader.style.display = 'block';
        let oldSignal = document.getElementById('ultimate-signal'); if (oldSignal) oldSignal.remove();
        setTimeout(() => {
            const finalTrend = Math.random() > 0.5 ? 'up' : 'down';
            this.generatePredictionPoints(finalTrend); this.renderChart();
            const lastPoint = this.currentChartData[this.currentChartData.length - 1];
            const entryPrice = lastPoint.close;
            const targetPrice = finalTrend === 'up' ? entryPrice * 1.05 : entryPrice * 0.95;
            const stopLoss = finalTrend === 'up' ? entryPrice - (entryPrice * 0.03) : entryPrice + (entryPrice * 0.03);
            const color = finalTrend === 'up' ? 'var(--semantic-success)' : 'var(--semantic-danger)';
            const typeStr = finalTrend === 'up' ? 'COMPRA (LONG)' : 'VENDI (SHORT)';
            const icon = finalTrend === 'up' ? '\U0001f680' : '\U0001f53b';
            const targetDate = new Date(Date.now() + 3600000);
            const dateStr = targetDate.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' });
            const timeStr = targetDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const signalHtml = '<div id="ultimate-signal" class="signal-card" style="border-color: ' + color + ';"><div class="signal-type-badge" style="color: ' + color + ';">' + icon + ' ' + typeStr + '</div><div class="signal-grid"><div class="signal-box-ui"><div class="signal-box-title">Entra Ora A:</div><div class="signal-box-val">$' + entryPrice.toFixed(2) + 'B</div></div><div class="signal-box-ui" style="border-color: ' + color + ';"><div class="signal-box-title" style="color: ' + color + ';">Target (Take Profit)</div><div class="signal-box-val" style="color: ' + color + ';">$' + targetPrice.toFixed(2) + 'B</div></div><div class="signal-box-ui" style="grid-column: span 2;"><div class="signal-box-title" style="color: var(--text-tertiary);">Stop Loss</div><div class="signal-box-val" style="font-size: 1.2rem; color: var(--text-secondary);">$' + stopLoss.toFixed(2) + 'B</div></div></div><div class="signal-footer"><div class="signal-time-title">SCADENZA SEGNALE PREVISTA IL:</div><div class="signal-time-val">' + dateStr + ' alle ' + timeStr + '</div></div><button onclick="AlphaOS.EliteRadar.resetPredictionUI()" class="ai-btn" style="width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.2); margin-top: 10px; font-size: 0.9rem;">Nuova Scansione</button></div>';
            document.getElementById('tv-prediction-engine').insertAdjacentHTML('beforeend', signalHtml);
            if (loader) loader.style.display = 'none';
        }, 2000);
    },
    resetPredictionUI: function() {
        const btn = document.getElementById('btn-run-prediction'), introText = document.getElementById('pred-intro-text'), oldSignal = document.getElementById('ultimate-signal');
        if (btn) btn.style.display = 'flex'; if (introText) introText.style.display = 'block'; if (oldSignal) oldSignal.remove();
    },
    generatePredictionPoints: function(trend) {
        if (!this.currentChartData || this.currentChartData.length === 0) return;
        const lastData = this.currentChartData[this.currentChartData.length - 1];
        let currentVal = lastData.close; this.currentPredictionData = [];
        for (let i = 0; i < 10; i++) { const change = (Math.random() - (trend === 'up' ? 0.1 : 0.9)) * 12; currentVal += change; if (currentVal < 2) currentVal = 2; if (currentVal > 98) currentVal = 98; this.currentPredictionData.push({ date: new Date(Date.now() + 60000 * (i + 1)), open: currentVal - change, close: currentVal, high: currentVal + Math.random() * 5, low: currentVal - Math.random() * 5, val: currentVal, isPrediction: true }); }
    },
    renderChart: function() {
        const container = document.getElementById('asset-chart-container'); if (!container) return;
        if (!this.currentChartData || this.currentChartData.length === 0) return;
        const combinedData = [...this.currentChartData, ...this.currentPredictionData];
        const points = combinedData.length, stepX = 100 / (points - 1);
        let minVal = 100, maxVal = 0;
        combinedData.forEach(d => { if (d.low < minVal) minVal = d.low; if (d.high > maxVal) maxVal = d.high; });
        minVal = Math.max(0, minVal - 5); maxVal = Math.min(100, maxVal + 5);
        const scaleY = (val) => 100 - (((val - minVal) / (maxVal - minVal)) * 100);
        let gridHtml = '';
        for (let i = 0; i <= 5; i++) { const yPos = i * 20; gridHtml += '<line x1="0" y1="' + yPos + '" x2="100" y2="' + yPos + '" class="svg-grid-line" />'; }
        let pathHistorical = 'M 0,' + scaleY(combinedData[0].val), areaHistorical = 'M 0,' + scaleY(combinedData[0].val);
        let pathPrediction = '', predStartIndex = -1;
        combinedData.forEach((d, index) => {
            if (!d.isPrediction) { if (index > 0) { pathHistorical += ' L ' + (index * stepX) + ',' + scaleY(d.val); areaHistorical += ' L ' + (index * stepX) + ',' + scaleY(d.val); } }
            else { if (predStartIndex === -1) { predStartIndex = index; pathPrediction += 'M ' + ((index - 1) * stepX) + ',' + scaleY(combinedData[index - 1].val); } pathPrediction += ' L ' + (index * stepX) + ',' + scaleY(d.val); }
        });
        const histEndIndex = predStartIndex === -1 ? combinedData.length - 1 : predStartIndex - 1;
        areaHistorical += ' L ' + (histEndIndex * stepX) + ',100 L 0,100 Z';
        const colorHex = this.currentChartColor;
        let chartHtml = '<defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + colorHex + '" stop-opacity="0.3"/><stop offset="100%" stop-color="' + colorHex + '" stop-opacity="0.0"/></linearGradient></defs><path d="' + areaHistorical + '" fill="url(#chartGrad)"/><path d="' + pathHistorical + '" fill="none" stroke="' + colorHex + '" stroke-width="1.5" stroke-linejoin="round"/>';
        if (predStartIndex !== -1) chartHtml += '<path d="' + pathPrediction + '" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="2,2" stroke-linejoin="round"/>';
        let predictionAnnotations = '';
        if (this.currentPredictionData.length > 0) {
            const todayX = (this.currentChartData.length - 1) * stepX, currentValY = scaleY(this.currentChartData[this.currentChartData.length - 1].val), targetValY = scaleY(this.currentPredictionData[this.currentPredictionData.length - 1].val);
            const isUp = targetValY < currentValY, predColor = isUp ? 'var(--semantic-success)' : 'var(--semantic-danger)';
            predictionAnnotations = '<polygon points="' + todayX + ',' + currentValY + ' 100,' + targetValY + ' 100,' + currentValY + '" fill="' + predColor + '" opacity="0.25" /><line x1="' + todayX + '" y1="0" x2="' + todayX + '" y2="100" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" stroke-dasharray="2,2" />';
        }
        container.innerHTML = '<div class="chart-y-axis"></div><div class="chart-x-axis"><span>' + combinedData[0].date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + '</span><span>' + combinedData[combinedData.length - 1].date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + '</span></div><svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="overflow: visible; cursor: crosshair; position: relative; z-index: 5;">' + gridHtml + predictionAnnotations + chartHtml + '</svg>';
    },
    start3HourSyncSimulation: function() {
        let secondsLeft = 3 * 3600; const timerEl = document.getElementById('sync-countdown');
        this._syncTimer = setInterval(() => { if (!this._radarSectionVisible) return; secondsLeft--; if (secondsLeft <= 0) secondsLeft = 3 * 3600; let h = Math.floor(secondsLeft / 3600), m = Math.floor((secondsLeft % 3600) / 60), s = secondsLeft % 60; if (timerEl) timerEl.innerText = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0'); }, 1000);
        this._simTimer = setInterval(() => {
            if (!this._radarSectionVisible) return;
            for (let i = 0; i < 5; i++) {
                let idx = Math.floor(Math.random() * this.assetData.length), asset = this.assetData[idx];
                let change = asset.baseTrend === 'up' ? Math.floor(Math.random() * 16) - 4 : Math.floor(Math.random() * 16) - 11;
                asset.volume += change; if (asset.volume < 10) asset.volume = 10; asset.trend = change > 0 ? 'up' : 'down';
            }
            this.renderTop50();
        }, 5000);
    }
};

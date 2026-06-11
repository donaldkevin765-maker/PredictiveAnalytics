AlphaOS.NeuralNet = {
    canvas: null, ctx: null, nodes: [], animFrame: null, isActive: false,
    init: function() {
        this.canvas = document.getElementById('neural-canvas');
        if (!this.canvas) return;
        try { this.ctx = this.canvas.getContext('2d'); } catch(e) { return; }
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createNodes(40);
    },
    resize: function() { if (!this.canvas) return; this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; },
    createNodes: function(count) {
        this.nodes = [];
        for (let i = 0; i < count; i++) {
            this.nodes.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2, radius: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2 });
        }
    },
    activate: function() {
        if (this.isActive) return;
        this.isActive = true;
        this.canvas.classList.add('active');
        this.animate();
        setTimeout(() => this.deactivate(), 2500);
    },
    deactivate: function() { this.isActive = false; if (this.canvas) this.canvas.classList.remove('active'); if (this.animFrame) cancelAnimationFrame(this.animFrame); },
    animate: function() {
        if (!this.isActive || !this.ctx) return;
        if (document.hidden) { this.animFrame = requestAnimationFrame(() => this.animate()); return; }
        const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        this.nodes.forEach(n => { n.x += n.vx; n.y += n.vy; n.pulse += 0.05; if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1; });
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x, dy = this.nodes[i].y - this.nodes[j].y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) { const opacity = (1 - dist / 100) * 0.25; ctx.beginPath(); ctx.moveTo(this.nodes[i].x, this.nodes[i].y); ctx.lineTo(this.nodes[j].x, this.nodes[j].y); ctx.strokeStyle = 'rgba(14, 165, 233, ' + opacity + ')'; ctx.lineWidth = 0.5; ctx.stroke(); }
            }
        }
        this.nodes.forEach(n => { const pulseSize = n.radius + Math.sin(n.pulse); ctx.beginPath(); ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2); ctx.fillStyle = 'rgba(14, 165, 233, 0.6)'; ctx.fill(); });
        this.animFrame = requestAnimationFrame(() => this.animate());
    }
};

AlphaOS.Particles = {
    canvas: null, ctx: null, particles: [], mouse: { x: -1000, y: -1000 }, timer: null, visible: true,
    init: function() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) return;
        try { this.ctx = this.canvas.getContext('2d'); } catch(e) { return; }
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }, { passive: true });
        for (let i = 0; i < 40; i++) {
            this.particles.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, radius: Math.random() * 1.5 + 0.5 });
        }
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => { this.visible = entries[0].isIntersecting; }, { threshold: 0 });
            obs.observe(this.canvas);
        }
        this.scheduleTick();
    },
    resize: function() { if (!this.canvas) return; this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; },
    scheduleTick: function() { this.timer = setTimeout(() => this.animate(), 33); },
    animate: function() {
        if (!this.ctx) return;
        if (!this.visible || document.hidden) { this.scheduleTick(); return; }
        const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        this.particles.forEach(p => {
            const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) { p.vx -= dx * 0.00005; p.vy -= dy * 0.00005; }
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(14, 165, 233, 0.3)'; ctx.fill();
        });
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x, dy = this.particles[i].y - this.particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) { ctx.beginPath(); ctx.moveTo(this.particles[i].x, this.particles[i].y); ctx.lineTo(this.particles[j].x, this.particles[j].y); ctx.strokeStyle = 'rgba(14, 165, 233, ' + (0.12 * (1 - dist / 100)) + ')'; ctx.lineWidth = 0.5; ctx.stroke(); }
            }
        }
        this.scheduleTick();
    }
};

AlphaOS.Market = {
    autoRefresh: false, refreshInterval: null, data: [],
    fetchData: async function() {
        AlphaOS.Toast.info('Market Data', 'Fetching live data from CoinGecko...');
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=true&price_change_percentage=24h');
            if (!res.ok) throw new Error('API limit');
            this.data = await res.json();
            this.render();
            AlphaOS.Toast.success('Market Data', 'Dati aggiornati con successo');
        } catch (e) { this.renderFallback(); AlphaOS.Toast.warning('Market Data', 'API limit, uso dati cached'); }
    },
    render: function() {
        const grid = document.getElementById('market-grid');
        if (!grid) return;
        let html = '';
        this.data.forEach(coin => {
            const change = coin.price_change_percentage_24h || 0;
            const isUp = change >= 0;
            const sparkline = coin.sparkline_in_7d?.price || [];
            const sparkPath = sparkline.length > 0 ? this.createSparkPath(sparkline, isUp) : '';
            html += '<div class="market-card"><div class="market-card-header"><span class="market-card-name">' + coin.name + '</span><span class="market-card-symbol">' + coin.symbol + '</span></div><div class="market-card-price">$' + coin.current_price.toLocaleString() + '</div><div class="market-card-change ' + (isUp ? 'up' : 'down') + '">' + (isUp ? '+' : '') + change.toFixed(2) + '% (24h)</div><div class="market-card-chart"><svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="' + sparkPath + '" fill="none" stroke="' + (isUp ? '#10b981' : '#ef4444') + '" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg></div></div>';
        });
        grid.innerHTML = html;
    },
    createSparkPath: function(data, isUp) {
        const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
        return data.map((v, i) => { const x = (i / (data.length - 1)) * 100, y = 40 - ((v - min) / range) * 40; return (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y; }).join(' ');
    },
    renderFallback: function() {
        const grid = document.getElementById('market-grid');
        if (!grid) return;
        const fallback = [{ name: 'Bitcoin', symbol: 'btc', price: 67500, change: 2.34 }, { name: 'Ethereum', symbol: 'eth', price: 3450, change: -1.12 }, { name: 'Solana', symbol: 'sol', price: 145, change: 5.67 }, { name: 'Cardano', symbol: 'ada', price: 0.45, change: 0.89 }, { name: 'Polkadot', symbol: 'dot', price: 7.2, change: -0.45 }, { name: 'Avalanche', symbol: 'avax', price: 35, change: 3.21 }];
        let html = '';
        fallback.forEach(coin => { const isUp = coin.change >= 0; html += '<div class="market-card"><div class="market-card-header"><span class="market-card-name">' + coin.name + '</span><span class="market-card-symbol">' + coin.symbol + '</span></div><div class="market-card-price">$' + coin.price.toLocaleString() + '</div><div class="market-card-change ' + (isUp ? 'up' : 'down') + '">' + (isUp ? '+' : '') + coin.change.toFixed(2) + '% (24h)</div></div>'; });
        grid.innerHTML = html;
    },
    toggleAutoRefresh: function() {
        this.autoRefresh = !this.autoRefresh;
        const btn = document.getElementById('btn-auto-refresh');
        if (btn) btn.textContent = 'Auto-Refresh: ' + (this.autoRefresh ? 'ON' : 'OFF');
        if (this.autoRefresh) { this.refreshInterval = setInterval(() => this.fetchData(), 30000); AlphaOS.Toast.success('Auto-Refresh', 'Aggiornamento ogni 30s'); }
        else { if (this.refreshInterval) clearInterval(this.refreshInterval); AlphaOS.Toast.info('Auto-Refresh', 'Auto-refresh disattivato'); }
    },
    initTicker: async function() {
        const ticker = document.getElementById('market-ticker'), track = document.getElementById('ticker-track');
        if (!ticker || !track) return;
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1');
            if (!res.ok) throw new Error('API limit');
            const coins = await res.json();
            let html = '';
            [...coins, ...coins].forEach(coin => {
                const change = coin.price_change_percentage_24h || 0, isUp = change >= 0;
                html += '<div class="ticker-item"><span class="ticker-symbol">' + coin.symbol.toUpperCase() + '</span><span class="ticker-price">$' + coin.current_price.toLocaleString() + '</span><span class="ticker-change ' + (isUp ? 'up' : 'down') + '">' + (isUp ? '+' : '') + change.toFixed(2) + '%</span></div>';
            });
            track.innerHTML = html; ticker.style.display = 'flex';
        } catch (e) {
            const fb = [{ s: 'BTC', p: '$67,500', c: '+2.34%', u: true }, { s: 'ETH', p: '$3,450', c: '-1.12%', u: false }, { s: 'SOL', p: '$145', c: '+5.67%', u: true }, { s: 'BNB', p: '$580', c: '+0.89%', u: true }, { s: 'XRP', p: '$0.52', c: '-0.45%', u: false }, { s: 'ADA', p: '$0.45', c: '+1.23%', u: true }];
            let html = '';
            [...fb, ...fb].forEach(c => { html += '<div class="ticker-item"><span class="ticker-symbol">' + c.s + '</span><span class="ticker-price">' + c.p + '</span><span class="ticker-change ' + (c.u ? 'up' : 'down') + '">' + c.c + '</span></div>'; });
            track.innerHTML = html; ticker.style.display = 'flex';
        }
    }
};

AlphaOS.CV = {
    switchLanguage: function(lang) {
        const docIt = document.getElementById('cv-doc-it'), docEn = document.getElementById('cv-doc-en');
        const btnIt = document.getElementById('btn-cv-it'), btnEn = document.getElementById('btn-cv-en');
        if (lang === 'it') {
            if (docIt) docIt.style.display = 'block'; if (docEn) docEn.style.display = 'none';
            if (btnIt) { btnIt.classList.add('btn-primary'); btnIt.classList.remove('btn-secondary'); }
            if (btnEn) { btnEn.classList.add('btn-secondary'); btnEn.classList.remove('btn-primary'); }
        } else {
            if (docIt) docIt.style.display = 'none'; if (docEn) docEn.style.display = 'block';
            if (btnIt) { btnIt.classList.add('btn-secondary'); btnIt.classList.remove('btn-primary'); }
            if (btnEn) { btnEn.classList.add('btn-primary'); btnEn.classList.remove('btn-secondary'); }
        }
    }
};

AlphaOS.TrendAnalysis = {
    initialized: false, currentPeriod: '1y', chartData: [], predictionData: [],
    indicators: [
        { name: 'AI & Tech', value: '+12.4%', up: true },
        { name: 'Crypto Market', value: '+8.7%', up: true },
        { name: 'Real Estate', value: '-2.1%', up: false },
        { name: 'Energy', value: '+5.3%', up: true },
        { name: 'Healthcare', value: '+3.8%', up: true }
    ],
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        this.renderIndicators();
        this.generateData(this.currentPeriod);
        this.renderChart();
        window.addEventListener('resize', () => this.renderChart());
    },
    setPeriod: function(period) {
        this.currentPeriod = period;
        document.querySelectorAll('.trend-period-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-' + period).classList.add('active');
        this.generateData(period);
        this.renderChart();
    },
    renderIndicators: function() {
        const container = document.getElementById('trend-indicators');
        if (!container) return;
        container.innerHTML = this.indicators.map(ind =>
            '<div class="trend-indicator-row"><span class="trend-indicator-name">' + ind.name + '</span><span class="trend-indicator-val ' + (ind.up ? 'up' : 'down') + '">' + ind.value + '</span></div>'
        ).join('');
    },
    generateData: function(period) {
        const months = period === '6m' ? 6 : period === '1y' ? 12 : 36;
        const now = new Date();
        this.chartData = [];
        let baseVal = 50;
        for (let i = months; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const change = (Math.random() - 0.4) * 8;
            baseVal = Math.max(20, Math.min(90, baseVal + change));
            this.chartData.push({ date, value: baseVal, isPrediction: false });
        }
        this.predictionData = [];
        let predVal = baseVal;
        for (let i = 1; i <= 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const change = (Math.random() - 0.35) * 6;
            predVal = Math.max(20, Math.min(90, predVal + change));
            this.predictionData.push({ date, value: predVal, isPrediction: true });
        }
        const lastVal = this.chartData[this.chartData.length - 1].value;
        const changePct = ((lastVal - this.chartData[0].value) / this.chartData[0].value * 100).toFixed(1);
        const isUp = +changePct >= 0;
        document.getElementById('trend-current-val').textContent = lastVal.toFixed(1);
        document.getElementById('trend-current-val').style.color = isUp ? 'var(--semantic-success)' : 'var(--semantic-danger)';
        document.getElementById('trend-change').textContent = (isUp ? '+' : '') + changePct + '% vs inizio periodo';
        document.getElementById('trend-change').style.color = isUp ? 'var(--semantic-success)' : 'var(--semantic-danger)';
        const signalEl = document.getElementById('trend-ai-signal');
        const isBullish = lastVal > 55;
        signalEl.style.background = isBullish ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        signalEl.style.borderColor = isBullish ? 'var(--semantic-success)' : 'var(--semantic-danger)';
        signalEl.innerHTML = '<div style="font-size: 2rem; margin-bottom: 8px;">' + (isBullish ? '\ud83d\udcc8' : '') + '</div><div style="font-weight: 700; color: ' + (isBullish ? 'var(--semantic-success)' : 'var(--semantic-danger)') + '; font-size: 1.1rem;">' + (isBullish ? 'RIALZO' : 'RIBASSO') + '</div><div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 8px;">Confidenza: ' + Math.floor(Math.random() * 20 + 70) + '%</div>';
    },
    renderChart: function() {
        const container = document.getElementById('trend-chart-container');
        if (!container) return;
        const combined = [...this.chartData, ...this.predictionData];
        if (combined.length === 0) return;
        const w = container.clientWidth, h = container.clientHeight;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const minVal = Math.min(...combined.map(d => d.value)) - 5;
        const maxVal = Math.max(...combined.map(d => d.value)) + 5;
        const scaleX = (i) => padding.left + (i / (combined.length - 1)) * chartW;
        const scaleY = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
        let pathHist = 'M ' + scaleX(0) + ',' + scaleY(combined[0].value);
        let pathPred = '';
        let predStart = -1;
        combined.forEach((d, i) => {
            if (!d.isPrediction) { if (i > 0) pathHist += ' L ' + scaleX(i) + ',' + scaleY(d.value); }
            else { if (predStart === -1) { predStart = i; pathPred = 'M ' + scaleX(i - 1) + ',' + scaleY(combined[i - 1].value); } pathPred += ' L ' + scaleX(i) + ',' + scaleY(d.value); }
        });
        let areaHist = 'M ' + scaleX(0) + ',' + scaleY(combined[0].value);
        const histEnd = predStart === -1 ? combined.length - 1 : predStart - 1;
        for (let i = 1; i <= histEnd; i++) areaHist += ' L ' + scaleX(i) + ',' + scaleY(combined[i].value);
        areaHist += ' L ' + scaleX(histEnd) + ',' + (padding.top + chartH) + ' L ' + scaleX(0) + ',' + (padding.top + chartH) + ' Z';
        let gridLines = '';
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            const val = maxVal - ((maxVal - minVal) / 4) * i;
            gridLines += '<line x1="' + padding.left + '" y1="' + y + '" x2="' + (w - padding.right) + '" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
            gridLines += '<text x="' + (padding.left - 8) + '" y="' + (y + 4) + '" text-anchor="end" fill="#a1a1aa" font-size="10" font-family="Fira Code">' + val.toFixed(0) + '</text>';
        }
        let xLabels = '';
        const labelCount = Math.min(6, combined.length);
        const step = Math.floor(combined.length / labelCount);
        for (let i = 0; i < combined.length; i += step) {
            const d = combined[i];
            const label = d.date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
            xLabels += '<text x="' + scaleX(i) + '" y="' + (h - 5) + '" text-anchor="middle" fill="#a1a1aa" font-size="9" font-family="Fira Code">' + label + '</text>';
        }
        let predArea = '';
        if (predStart !== -1) {
            const lastHistVal = combined[predStart - 1].value;
            const lastPredVal = combined[combined.length - 1].value;
            const isUp = lastPredVal > lastHistVal;
            const color = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            predArea = '<polygon points="' + scaleX(predStart - 1) + ',' + scaleY(lastHistVal) + ' ' + scaleX(combined.length - 1) + ',' + scaleY(lastPredVal) + ' ' + scaleX(combined.length - 1) + ',' + (padding.top + chartH) + ' ' + scaleX(predStart - 1) + ',' + (padding.top + chartH) + '" fill="' + color + '"/>';
        }
        container.innerHTML = '<svg width="' + w + '" height="' + h + '" style="overflow: visible;">' + gridLines + predArea + '<defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.3"/><stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/></linearGradient></defs><path d="' + areaHist + '" fill="url(#trendGrad)"/><path d="' + pathHist + '" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linejoin="round"/>' + (predStart !== -1 ? '<path d="' + pathPred + '" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="4,4" stroke-linejoin="round"/>' : '') + '<circle cx="' + scaleX(histEnd) + '" cy="' + scaleY(combined[histEnd].value) + '" r="4" fill="#0ea5e9" style="filter: drop-shadow(0 0 6px #0ea5e9);"/>' + (predStart !== -1 ? '<circle cx="' + scaleX(combined.length - 1) + '" cy="' + scaleY(combined[combined.length - 1].value) + '" r="4" fill="#eab308" style="filter: drop-shadow(0 0 6px #eab308);"/>' : '') + xLabels + '</svg>';
    }
};

AlphaOS.PDF = {
    exportReport: function() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFont('helvetica');
            doc.setFontSize(24); doc.setTextColor(14, 165, 233);
            doc.text('PREDICTIVE ANALYTICS', 20, 30);
            doc.setFontSize(12); doc.setTextColor(100);
            doc.text('Report Generato: ' + new Date().toLocaleDateString('it-IT'), 20, 42);
            doc.setLineWidth(0.5); doc.setDrawColor(14, 165, 233); doc.line(20, 48, 190, 48);
            doc.setFontSize(14); doc.setTextColor(0);
            doc.text('Relazione Tecnica', 20, 60);
            doc.setFontSize(10); doc.setTextColor(60);
            doc.text('1. Proiezioni di Budget e Margini', 20, 75);
            doc.setFontSize(9); doc.setTextColor(100);
            doc.text('Tutti i costi sono stati sovrastimati del 35%. Questo cuscinetto', 20, 83);
            doc.text('garantisce un margine contro gli imprevisti.', 20, 90);
            doc.setFontSize(10); doc.setTextColor(60);
            doc.text('2. Architettura Legale e Data Monetization', 20, 105);
            doc.setFontSize(9); doc.setTextColor(100);
            doc.text('Implementazione di consensi GDPR multistrato per la cessione', 20, 113);
            doc.text('a partner terzi dello storico presenze.', 20, 120);
            doc.setFontSize(10); doc.setTextColor(60);
            doc.text('3. Protocollo Sicurezza TVCC', 20, 135);
            doc.setFontSize(9); doc.setTextColor(100);
            doc.text('Cartellonistica di avviso e registri delle attivita di trattamento', 20, 143);
            doc.text('(Art. 30 GDPR) verificabili.', 20, 150);
            doc.setFontSize(10); doc.setTextColor(60);
            doc.text('Contesto Business', 20, 165);
            doc.setFontSize(9); doc.setTextColor(100);
            doc.text('Settore: ' + AlphaOS.businessContext, 20, 173);
            doc.text('Localita: ' + AlphaOS.locationContext, 20, 180);
            doc.save('Predictive_Analytics_Report.pdf');
            AlphaOS.Toast.success('PDF', 'Report esportato con successo');
        } catch (e) { AlphaOS.Toast.error('PDF', 'Errore durante l\'export'); }
    }
};

AlphaOS.PDFViewer = {
    init: function() {
        if (this._loaded) return;
        this._loaded = true;
        const container = document.getElementById('pdf-viewer');
        if (!container) return;
        container.innerHTML = '<p style="color: var(--text-tertiary); font-family: Fira Code, monospace; padding: 40px;">Caricamento PDF.js...</p>';
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            let pdfDoc = null, pageNum = 1, pageRendering = false, pageNumPending = null;
            const canvas = document.getElementById('pdf-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            function renderPage(num) {
                pageRendering = true;
                pdfDoc.getPage(num).then(page => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = { canvasContext: ctx, viewport: viewport, background: 'transparent' };
                    return page.render(renderContext).promise;
                }).then(() => {
                    pageRendering = false;
                    const info = document.getElementById('pdf-page-info');
                    if (info) info.textContent = 'Pagina ' + num + ' / ' + pdfDoc.numPages;
                    const prev = document.getElementById('pdf-prev');
                    if (prev) prev.style.opacity = num <= 1 ? '0.5' : '1';
                    const next = document.getElementById('pdf-next');
                    if (next) next.style.opacity = num >= pdfDoc.numPages ? '0.5' : '1';
                    if (pageNumPending !== null) { renderPage(pageNumPending); pageNumPending = null; }
                });
            }
            function queueRenderPage(num) {
                if (pageRendering) { pageNumPending = num; return; }
                pageNum = num;
                renderPage(num);
            }
            document.getElementById('pdf-prev').onclick = () => { if (pageNum > 1) queueRenderPage(pageNum - 1); };
            document.getElementById('pdf-next').onclick = () => { if (pdfDoc && pageNum < pdfDoc.numPages) queueRenderPage(pageNum + 1); };
            pdfjsLib.getDocument('relazione-stage.pdf').promise.then(pdf => {
                pdfDoc = pdf;
                canvas.style.display = 'block';
                renderPage(1);
            }).catch(() => {
                container.innerHTML = '<p style="color: var(--semantic-danger); padding: 40px; font-family: Fira Code, monospace;">Errore caricamento PDF</p>';
            });
        };
        script.onerror = () => {
            container.innerHTML = '<p style="color: var(--semantic-danger); padding: 40px; font-family: Fira Code, monospace;">Errore caricamento PDF.js. Disabilita Brave Shields per questo sito o usa un altro browser.</p>';
        };
        document.body.appendChild(script);
    }
};

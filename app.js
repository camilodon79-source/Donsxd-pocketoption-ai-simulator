// app.js - Application principale DONSXD POCKET-OPTION AI

class DONSXDPocketOptionAI {
    constructor() {
        // Initialiser le moteur de simulation
        this.engine = new SimulationEngine();
        
        // Initialiser le renderer de graphique
        this.chartRenderer = null;
        
        // État de l'application
        this.currentMarket = 'forex';
        this.countdown = 0;
        this.countdownInterval = null;
        this.isAnalyzing = false;
        
        // Initialiser l'application
        this.initialize();
    }
    
    // Initialiser l'application
    initialize() {
        console.log('DONSXD POCKET-OPTION AI - Initializing...');
        
        // Initialiser les références DOM
        this.initializeDOM();
        
        // Initialiser le graphique
        this.initializeChart();
        
        // Initialiser les événements
        this.initializeEvents();
        
        // Initialiser les données
        this.initializeData();
        
        // Démarrer l'horloge
        this.startClock();
        
        // Démarrer le compte à rebours
        this.startCountdown();
        
        // Démarrer la mise à jour des bougies
        this.startCandleUpdates();
        
        console.log('DONSXD POCKET-OPTION AI - Initialized successfully');
    }
    
    // Initialiser les références DOM
    initializeDOM() {
        this.elements = {
            clockDisplay: document.getElementById('clockDisplay'),
            assetSelect: document.getElementById('assetSelect'),
            selectedAssetDisplay: document.getElementById('selectedAssetDisplay'),
            timeframeGrid: document.getElementById('timeframeGrid'),
            countdownDisplay: document.getElementById('countdownDisplay'),
            analyzeBtn: document.getElementById('analyzeBtn'),
            signalAsset: document.getElementById('signalAsset'),
            signalResult: document.getElementById('signalResult'),
            signalAnimation: document.getElementById('signalAnimation'),
            confidenceValue: document.getElementById('confidenceValue'),
            confidenceFill: document.getElementById('confidenceFill'),
            analysisReasons: document.getElementById('analysisReasons'),
            infoMarket: document.getElementById('infoMarket'),
            infoTimeframe: document.getElementById('infoTimeframe'),
            infoSignal: document.getElementById('infoSignal'),
            infoConfidence: document.getElementById('infoConfidence'),
            infoTime: document.getElementById('infoTime'),
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            fastModeBtn: document.getElementById('fastModeBtn'),
            candleChart: document.getElementById('candleChart')
        };
        
        // Boutons de marché
        this.marketTabButtons = document.querySelectorAll('.tab-btn');
        
        // Boutons de navigation
        this.navButtons = document.querySelectorAll('.nav-btn');
    }
    
    // Initialiser le graphique
    initializeChart() {
        this.chartRenderer = new ChartRenderer(this.elements.candleChart);
    }
    
    // Initialiser les événements
    initializeEvents() {
        // Événements des onglets de marché
        this.marketTabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const market = e.target.dataset.market;
                this.switchMarket(market);
            });
        });
        
        // Événement de changement d'actif
        this.elements.assetSelect.addEventListener('change', (e) => {
            this.engine.currentAsset = e.target.value;
            this.elements.selectedAssetDisplay.textContent = e.target.value;
            this.updateInfoMarket();
            this.engine.initializeCandles();
        });
        
        // Événements des boutons de timeframe
        this.elements.timeframeGrid.addEventListener('click', (e) => {
            const tfBtn = e.target.closest('.tf-btn');
            if (tfBtn) {
                const timeframe = tfBtn.dataset.timeframe;
                this.switchTimeframe(timeframe);
            }
        });
        
        // Événement du bouton Analyser
        this.elements.analyzeBtn.addEventListener('click', () => {
            this.analyzeMarket();
        });
        
        // Événement du bouton Effacer l'historique
        this.elements.clearHistoryBtn.addEventListener('click', () => {
            this.engine.clearHistory();
            this.updateHistory();
        });
        
        // Événement du bouton Mode rapide
        this.elements.fastModeBtn.addEventListener('click', () => {
            const isFast = this.engine.toggleFastMode();
            this.elements.fastModeBtn.classList.toggle('active', isFast);
            this.startCountdown();
        });
        
        // Événements de navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nav = e.target.dataset.nav;
                this.handleNavigation(nav);
            });
        });
        
        // Événement de redimensionnement
        window.addEventListener('resize', () => {
            this.resizeChart();
        });
    }
    
    // Initialiser les données
    initializeData() {
        // Remplir le sélecteur d'actifs
        this.populateAssetSelect();
        
        // Créer les boutons de timeframe
        this.createTimeframeButtons();
        
        // Initialiser les bougies
        this.engine.initializeCandles();
        
        // Mettre à jour l'affichage initial
        this.updateAllDisplays();
        
        // Ajouter un signal initial à l'historique pour démonstration
        this.addDemoSignals();
    }
    
    // Remplir le sélecteur d'actifs
    populateAssetSelect() {
        const assets = this.engine.markets[this.currentMarket];
        
        this.elements.assetSelect.innerHTML = '';
        assets.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset;
            option.textContent = asset;
            this.elements.assetSelect.appendChild(option);
        });
        
        this.elements.assetSelect.value = assets[0];
        this.engine.currentAsset = assets[0];
        this.elements.selectedAssetDisplay.textContent = assets[0];
    }
    
    // Créer les boutons de timeframe
    createTimeframeButtons() {
        const timeframes = Object.keys(this.engine.timeframes);
        const labels = {
            '5s': '5 SEC',
            '10s': '10 SEC',
            '15s': '15 SEC',
            '30s': '30 SEC',
            '1m': '1 MIN',
            '2m': '2 MIN',
            '3m': '3 MIN',
            '5m': '5 MIN',
            '10m': '10 MIN',
            '15m': '15 MIN',
            '30m': '30 MIN',
            '1h': '1 HR'
        };
        
        this.elements.timeframeGrid.innerHTML = '';
        timeframes.forEach(tf => {
            const btn = document.createElement('button');
            btn.className = 'tf-btn';
            btn.dataset.timeframe = tf;
            btn.textContent = labels[tf] || tf;
            
            if (tf === this.engine.currentTimeframe) {
                btn.classList.add('active');
            }
            
            this.elements.timeframeGrid.appendChild(btn);
        });
    }
    
    // Changer de marché
    switchMarket(market) {
        this.currentMarket = market;
        this.engine.currentMarket = market;
        
        // Mettre à jour les boutons d'onglet
        this.marketTabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.market === market);
        });
        
        // Mettre à jour le sélecteur d'actifs
        this.populateAssetSelect();
        
        // Réinitialiser les bougies
        this.engine.initializeCandles();
        
        // Mettre à jour l'affichage
        this.updateAllDisplays();
    }
    
    // Changer de timeframe
    switchTimeframe(timeframe) {
        this.engine.currentTimeframe = timeframe;
        
        // Mettre à jour les boutons
        const tfButtons = document.querySelectorAll('.tf-btn');
        tfButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timeframe === timeframe);
        });
        
        // Réinitialiser le compte à rebours
        this.startCountdown();
        
        // Réinitialiser les bougies
        this.engine.initializeCandles();
        
        // Mettre à jour l'affichage
        this.updateInfoTimeframe();
    }
    
    // Démarrer l'horloge
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.elements.clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // Démarrer le compte à rebours
    startCountdown() {
        this.clearCountdown();
        
        const intervalMs = this.engine.getTimeframeMs();
        this.countdown = Math.floor(intervalMs / 1000);
        
        const updateCountdown = () => {
            if (this.countdown > 0) {
                this.elements.countdownDisplay.textContent = `${this.countdown}s`;
                this.countdown--;
            } else {
                this.elements.countdownDisplay.textContent = 'ANALYZING...';
                clearInterval(this.countdownInterval);
                
                // Analyser automatiquement
                setTimeout(() => {
                    this.analyzeMarket(true);
                }, 500);
            }
        };
        
        // Délai initial plus court en mode rapide
        const updateInterval = this.engine.fastMode ? 100 : 1000;
        
        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, updateInterval);
    }
    
    // Arrêter le compte à rebours
    clearCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
    
    // Analyser le marché
    analyzeMarket(isAuto = false) {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.elements.analyzeBtn.classList.add('loading');
        this.elements.analyzeBtn.querySelector('.btn-text').style.display = 'none';
        this.elements.analyzeBtn.querySelector('.btn-loading').style.display = 'inline';
        
        // Simuler l'analyse
        setTimeout(() => {
            // Générer le signal
            const signalData = this.engine.generateSignal();
            
            // Afficher le signal
            this.displaySignal(signalData);
            
            // Ajouter à l'historique
            this.engine.addToHistory(signalData);
            this.updateHistory();
            
            // Réinitialiser l'état
            this.isAnalyzing = false;
            this.elements.analyzeBtn.classList.remove('loading');
            this.elements.analyzeBtn.querySelector('.btn-text').style.display = 'inline';
            this.elements.analyzeBtn.querySelector('.btn-loading').style.display = 'none';
            
            // Redémarrer le compte à rebours
            this.startCountdown();
        }, this.engine.fastMode ? 1000 : 2000);
    }
    
    // Afficher le signal
    displaySignal(signalData) {
        // Mettre à jour l'actif du signal
        this.elements.signalAsset.textContent = signalData.asset;
        
        // Mettre à jour le résultat du signal
        const signalText = this.elements.signalResult.querySelector('.signal-text');
        signalText.textContent = signalData.signal;
        signalText.className = 'signal-text';
        
        if (signalData.signal === 'BUY') {
            signalText.classList.add('buy');
        } else if (signalData.signal === 'SELL') {
            signalText.classList.add('sell');
        } else {
            signalText.classList.add('neutral');
        }
        
        // Animer le signal
        this.elements.signalAnimation.classList.remove('active');
        void this.elements.signalAnimation.offsetWidth; // Force reflow
        this.elements.signalAnimation.classList.add('active');
        
        // Mettre à jour la confiance
        this.elements.confidenceValue.textContent = `${signalData.confidence}%`;
        this.elements.confidenceFill.style.width = `${signalData.confidence}%`;
        
        // Mettre à jour les raisons
        this.elements.analysisReasons.innerHTML = '';
        signalData.reasons.forEach((reason, index) => {
            const reasonDiv = document.createElement('div');
            reasonDiv.className = 'reason-item';
            reasonDiv.style.animationDelay = `${index * 0.1}s`;
            reasonDiv.innerHTML = `<span class="checkmark">✓</span>${reason}`;
            this.elements.analysisReasons.appendChild(reasonDiv);
        });
        
        // Mettre à jour les informations
        this.updateInfoSignal(signalData);
    }
    
    // Mettre à jour toutes les informations
    updateAllDisplays() {
        this.updateInfoMarket();
        this.updateInfoTimeframe();
        this.updateHistory();
    }
    
    // Mettre à jour le marché dans les infos
    updateInfoMarket() {
        this.elements.infoMarket.textContent = this.engine.currentAsset;
    }
    
    // Mettre à jour le timeframe dans les infos
    updateInfoTimeframe() {
        const label = this.engine.getTimeframeLabel();
        this.elements.infoTimeframe.textContent = label;
    }
    
    // Mettre à jour le signal dans les infos
    updateInfoSignal(signalData) {
        this.elements.infoSignal.textContent = signalData.signal;
        this.elements.infoConfidence.textContent = `${signalData.confidence}%`;
        
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        this.elements.infoTime.textContent = timeString;
    }
    
    // Mettre à jour l'historique
    updateHistory() {
        this.elements.historyList.innerHTML = '';
        
        this.engine.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const time = item.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const signalClass = item.signal === 'BUY' ? 'buy' : 
                               item.signal === 'SELL' ? 'sell' : 'neutral';
            
            const statusClass = item.status === 'WIN' ? 'win' : 
                               item.status === 'LOSS' ? 'loss' : 'pending';
            
            historyItem.innerHTML = `
                <span class="history-time">${time}</span>
                <span>${item.asset}</span>
                <span class="history-signal ${signalClass}">${item.signal}</span>
                <span>${item.confidence}%</span>
                <span class="history-status ${statusClass}">${item.status}</span>
            `;
            
            this.elements.historyList.appendChild(historyItem);
        });
    }
    
    // Ajouter des signaux de démonstration
    addDemoSignals() {
        const demoSignals = [
            {
                signal: 'BUY',
                confidence: 78,
                asset: 'EUR/USD',
                timestamp: new Date(Date.now() - 60000),
                status: 'WIN'
            },
            {
                signal: 'SELL',
                confidence: 82,
                asset: 'GBP/USD',
                timestamp: new Date(Date.now() - 120000),
                status: 'LOSS'
            },
            {
                signal: 'BUY',
                confidence: 75,
                asset: 'USD/JPY',
                timestamp: new Date(Date.now() - 180000),
                status: 'WIN'
            }
        ];
        
        demoSignals.forEach(signal => {
            this.engine.addToHistory(signal);
        });
        
        this.updateHistory();
    }
    
    // Démarrer la mise à jour des bougies
    startCandleUpdates() {
        setInterval(() => {
            const allCandles = [...this.engine.candles, this.engine.currentCandle].filter(c => c !== null);
            this.chartRenderer.updateCandles(allCandles.slice(-30));
        }, 500);
    }
    
    // Redimensionner le graphique
    resizeChart() {
        const container = this.elements.candleChart.parentElement;
        const width = container.clientWidth - 32;
        this.chartRenderer.resize(width, 200);
    }
    
    // Gérer la navigation
    handleNavigation(nav) {
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === nav);
        });
        
        // Simple démonstration de navigation
        const cards = document.querySelectorAll('.card, .analyze-btn');
        
        switch (nav) {
            case 'home':
                cards.forEach(card => card.style.display = '');
                break;
            case 'signals':
                cards.forEach((card, index) => {
                    if (index < 6) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
                break;
            case 'history':
                cards.forEach((card, index) => {
                    if (index === cards.length - 2) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
                break;
            case 'settings':
                alert('Settings - Fonctionnalité à venir');
                break;
        }
    }
}

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DONSXDPocketOptionAI();
});

// simulation-engine.js - Moteur de simulation pour DONSXD POCKET-OPTION AI

class SimulationEngine {
    constructor() {
        this.markets = {
            forex: [
                'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 
                'USD/CAD', 'USD/CHF', 'EUR/JPY', 'EUR/GBP'
            ],
            otc: [
                'EUR/USD OTC', 'GBP/USD OTC', 'USD/JPY OTC', 
                'AUD/USD OTC', 'USD/CAD OTC', 'EUR/JPY OTC', 
                'GBP/JPY OTC', 'BTC/USD OTC', 'ETH/USD OTC'
            ]
        };
        
        this.timeframes = {
            '5s': 5,
            '10s': 10,
            '15s': 15,
            '30s': 30,
            '1m': 60,
            '2m': 120,
            '3m': 180,
            '5m': 300,
            '10m': 600,
            '15m': 900,
            '30m': 1800,
            '1h': 3600
        };
        
        this.currentMarket = 'forex';
        this.currentAsset = 'EUR/USD';
        this.currentTimeframe = '1m';
        this.fastMode = false;
        
        this.candles = [];
        this.currentCandle = null;
        this.candleInterval = null;
        
        this.buyReasons = [
            'Trend confirmation',
            'Momentum confirmation',
            'Support level respected',
            'Bullish candle pattern',
            'Low volatility breakout',
            'Market structure bullish',
            'RSI bullish divergence',
            'Moving average crossover',
            'Volume increase on upward move',
            'Previous resistance broken'
        ];
        
        this.sellReasons = [
            'Downtrend confirmation',
            'Bearish momentum',
            'Resistance level rejected',
            'Bearish candle pattern',
            'High volatility breakdown',
            'Market structure bearish',
            'RSI bearish divergence',
            'Moving average cross down',
            'Volume increase on downward move',
            'Previous support broken'
        ];
        
        this.neutralReasons = [
            'Sideways market detected',
            'Low volatility consolidation',
            'Indecision candle pattern',
            'Mixed signals detected',
            'Unclear market structure',
            'Weak momentum',
            'Choppy price action',
            'No clear trend direction'
        ];
        
        this.history = [];
        this.maxHistoryItems = 20;
    }
    
    // Initialiser les bougies simulées
    initializeCandles() {
        this.candles = [];
        const now = Date.now();
        const intervalMs = this.getTimeframeMs();
        
        // Générer 30 bougies historiques
        for (let i = 30; i >= 1; i--) {
            const timestamp = now - (i * intervalMs);
            this.candles.push(this.generateCandle(timestamp));
        }
        
        // Démarrer la bougie actuelle
        this.startCurrentCandle();
    }
    
    // Démarrer la bougie actuelle
    startCurrentCandle() {
        this.clearCandleInterval();
        
        const intervalMs = this.getTimeframeMs();
        const now = Date.now();
        
        // Créer une nouvelle bougie si nécessaire
        if (!this.currentCandle || now - this.currentCandle.timestamp >= intervalMs) {
            if (this.currentCandle) {
                this.candles.push(this.currentCandle);
                if (this.candles.length > 50) {
                    this.candles.shift();
                }
            }
            
            this.currentCandle = {
                timestamp: now,
                open: this.generatePrice(),
                high: 0,
                low: 0,
                close: 0
            };
            
            this.currentCandle.high = this.currentCandle.open;
            this.currentCandle.low = this.currentCandle.open;
            this.currentCandle.close = this.currentCandle.open;
        }
        
        // Mettre à jour la bougie toutes les secondes (ou plus vite en mode rapide)
        const updateInterval = this.fastMode ? 100 : 1000;
        
        this.candleInterval = setInterval(() => {
            this.updateCurrentCandle();
            
            // Vérifier si nous devons passer à une nouvelle bougie
            const currentTime = Date.now();
            const elapsedMs = currentTime - this.currentCandle.timestamp;
            
            if (elapsedMs >= intervalMs) {
                this.candles.push(this.currentCandle);
                if (this.candles.length > 50) {
                    this.candles.shift();
                }
                
                this.currentCandle = {
                    timestamp: currentTime,
                    open: this.currentCandle.close,
                    high: this.currentCandle.close,
                    low: this.currentCandle.close,
                    close: this.currentCandle.close
                };
            }
        }, updateInterval);
    }
    
    // Mettre à jour la bougie actuelle
    updateCurrentCandle() {
        if (!this.currentCandle) return;
        
        const priceChange = this.generatePriceChange();
        const newPrice = this.currentCandle.close + priceChange;
        
        // Mettre à jour high, low, close
        this.currentCandle.close = newPrice;
        this.currentCandle.high = Math.max(this.currentCandle.high, newPrice);
        this.currentCandle.low = Math.min(this.currentCandle.low, newPrice);
    }
    
    // Générer une bougie complète
    generateCandle(timestamp) {
        const basePrice = this.generatePrice();
        const volatility = this.getVolatility();
        
        const open = basePrice;
        const close = basePrice + (Math.random() - 0.5) * volatility * basePrice;
        const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;
        
        return {
            timestamp,
            open,
            high,
            low,
            close
        };
    }
    
    // Générer un prix de base
    generatePrice() {
        const basePrices = {
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 149.50,
            'AUD/USD': 0.6550,
            'USD/CAD': 1.3650,
            'USD/CHF': 0.8850,
            'EUR/JPY': 162.00,
            'EUR/GBP': 0.8580,
            'EUR/USD OTC': 1.0850,
            'GBP/USD OTC': 1.2650,
            'USD/JPY OTC': 149.50,
            'AUD/USD OTC': 0.6550,
            'USD/CAD OTC': 1.3650,
            'EUR/JPY OTC': 162.00,
            'GBP/JPY OTC': 190.50,
            'BTC/USD OTC': 42000,
            'ETH/USD OTC': 2250
        };
        
        const basePrice = basePrices[this.currentAsset] || 1.0000;
        return basePrice + (Math.random() - 0.5) * basePrice * 0.001;
    }
    
    // Générer un changement de prix
    generatePriceChange() {
        const volatility = this.getVolatility();
        const basePrice = this.currentCandle?.close || this.generatePrice();
        
        return (Math.random() - 0.48) * volatility * basePrice;
    }
    
    // Obtenir la volatilité selon l'actif
    getVolatility() {
        const volatilityMap = {
            'EUR/USD': 0.0005,
            'GBP/USD': 0.0008,
            'USD/JPY': 0.0007,
            'AUD/USD': 0.0009,
            'USD/CAD': 0.0008,
            'USD/CHF': 0.0006,
            'EUR/JPY': 0.001,
            'EUR/GBP': 0.0006,
            'EUR/USD OTC': 0.001,
            'GBP/USD OTC': 0.0015,
            'USD/JPY OTC': 0.0012,
            'AUD/USD OTC': 0.0018,
            'USD/CAD OTC': 0.0015,
            'EUR/JPY OTC': 0.002,
            'GBP/JPY OTC': 0.0025,
            'BTC/USD OTC': 0.003,
            'ETH/USD OTC': 0.004
        };
        
        return volatilityMap[this.currentAsset] || 0.001;
    }
    
    // Obtenir la durée du timeframe en millisecondes
    getTimeframeMs() {
        return this.timeframes[this.currentTimeframe] * 1000;
    }
    
    // Obtenir le label du timeframe
    getTimeframeLabel() {
        const tfMap = {
            '5s': '5 SECONDS',
            '10s': '10 SECONDS',
            '15s': '15 SECONDS',
            '30s': '30 SECONDS',
            '1m': '1 MIN',
            '2m': '2 MIN',
            '3m': '3 MIN',
            '5m': '5 MIN',
            '10m': '10 MIN',
            '15m': '15 MIN',
            '30m': '30 MIN',
            '1h': '1 HOUR'
        };
        
        return tfMap[this.currentTimeframe] || this.currentTimeframe;
    }
    
    // Générer un signal simulé
    generateSignal() {
        const signalTypes = ['BUY', 'SELL', 'NO SIGNAL'];
        
        // Distribution pondérée pour plus de réalisme
        const random = Math.random();
        let signal;
        
        if (random < 0.4) {
            signal = 'BUY';
        } else if (random < 0.8) {
            signal = 'SELL';
        } else {
            signal = 'NO SIGNAL';
        }
        
        // Générer la confiance
        let confidence;
        if (signal === 'NO SIGNAL') {
            confidence = Math.floor(Math.random() * 30) + 20; // 20-50%
        } else {
            confidence = Math.floor(Math.random() * 25) + 65; // 65-90%
        }
        
        // Sélectionner les raisons
        let reasons;
        if (signal === 'BUY') {
            const count = Math.floor(Math.random() * 4) + 3; // 3-6 raisons
            reasons = this.shuffleArray(this.buyReasons).slice(0, count);
        } else if (signal === 'SELL') {
            const count = Math.floor(Math.random() * 4) + 3;
            reasons = this.shuffleArray(this.sellReasons).slice(0, count);
        } else {
            const count = Math.floor(Math.random() * 3) + 2; // 2-4 raisons
            reasons = this.shuffleArray(this.neutralReasons).slice(0, count);
        }
        
        return {
            signal,
            confidence,
            reasons,
            timestamp: new Date(),
            asset: this.currentAsset,
            timeframe: this.currentTimeframe,
            status: Math.random() < 0.5 ? 'PENDING' : (Math.random() < 0.5 ? 'WIN' : 'LOSS')
        };
    }
    
    // Mélanger un tableau
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Ajouter un signal à l'historique
    addToHistory(signalData) {
        this.history.unshift(signalData);
        if (this.history.length > this.maxHistoryItems) {
            this.history.pop();
        }
    }
    
    // Effacer l'historique
    clearHistory() {
        this.history = [];
    }
    
    // Activer/désactiver le mode rapide
    toggleFastMode() {
        this.fastMode = !this.fastMode;
        this.startCurrentCandle();
        return this.fastMode;
    }
    
    // Nettoyer les intervalles
    clearCandleInterval() {
        if (this.candleInterval) {
            clearInterval(this.candleInterval);
            this.candleInterval = null;
        }
    }
    
    // Nettoyer le moteur
    destroy() {
        this.clearCandleInterval();
    }
}

// API simulée pour future intégration réelle
function getMarketData(asset, timeframe) {
    // Version simulée - sera remplacée par une vraie API
    const engine = new SimulationEngine();
    engine.currentAsset = asset;
    engine.currentTimeframe = timeframe;
    engine.initializeCandles();
    
    return {
        candles: engine.candles,
        currentCandle: engine.currentCandle
    };
}

function generateSignal(asset, timeframe) {
    // Version simulée - sera remplacée par un vrai backend
    const engine = new SimulationEngine();
    engine.currentAsset = asset;
    engine.currentTimeframe = timeframe;
    
    return engine.generateSignal();
}

// Exporter le moteur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SimulationEngine,
        getMarketData,
        generateSignal
    };
              }

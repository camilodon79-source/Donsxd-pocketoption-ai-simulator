// chart-renderer.js - Rendu du graphique en chandeliers

class ChartRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.candles = [];
        this.width = canvas.width;
        this.height = canvas.height;
        this.padding = 10;
    }
    
    // Mettre à jour les bougies à afficher
    updateCandles(candles) {
        this.candles = candles;
        this.render();
    }
    
    // Rendre le graphique
    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, width, height);
        
        // Fond
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
        
        if (this.candles.length === 0) return;
        
        // Trouver les prix min et max
        const prices = this.candles.flatMap(c => [c.high, c.low]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        const pricePadding = priceRange * 0.1;
        
        const chartMin = minPrice - pricePadding;
        const chartMax = maxPrice + pricePadding;
        const chartRange = chartMax - chartMin;
        
        // Dimensions du graphique
        const chartWidth = width - (this.padding * 2);
        const chartHeight = height - (this.padding * 2);
        const candleWidth = Math.max(3, (chartWidth / this.candles.length) * 0.7);
        const candleSpacing = chartWidth / this.candles.length;
        
        // Dessiner les lignes de grille
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const y = this.padding + (chartHeight * i / 4);
            ctx.beginPath();
            ctx.moveTo(this.padding, y);
            ctx.lineTo(width - this.padding, y);
            ctx.stroke();
            
            // Label de prix
            const price = chartMax - (chartRange * i / 4);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(price.toFixed(4), width - this.padding + 5, y + 3);
        }
        
        // Dessiner les bougies
        this.candles.forEach((candle, index) => {
            const x = this.padding + (candleSpacing * index) + (candleSpacing / 2);
            
            // Déterminer la couleur
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? '#10b981' : '#ef4444';
            
            // Convertir les prix en coordonnées Y
            const openY = this.padding + ((chartMax - candle.open) / chartRange) * chartHeight;
            const closeY = this.padding + ((chartMax - candle.close) / chartRange) * chartHeight;
            const highY = this.padding + ((chartMax - candle.high) / chartRange) * chartHeight;
            const lowY = this.padding + ((chartMax - candle.low) / chartRange) * chartHeight;
            
            // Dessiner la mèche (high-low)
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();
            
            // Dessiner le corps (open-close)
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
            
            ctx.fillStyle = color;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        });
        
        // Dessiner la dernière bougie en surbrillance
        if (this.candles.length > 0) {
            const lastCandle = this.candles[this.candles.length - 1];
            const x = this.padding + (candleSpacing * (this.candles.length - 1)) + (candleSpacing / 2);
            const lastY = this.padding + ((chartMax - lastCandle.close) / chartRange) * chartHeight;
            
            // Ligne de prix actuelle
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(this.padding, lastY);
            ctx.lineTo(width - this.padding, lastY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label du prix actuel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(lastCandle.close.toFixed(4), this.padding + 5, lastY - 5);
        }
    }
    
    // Redimensionner le canvas
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.render();
    }
}

// Exporter le renderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartRenderer;
}

var ItemType;
(function (ItemType) {
    ItemType["STONE"] = "stone";
    ItemType["GRASS"] = "grass";
    ItemType["BUG"] = "bug";
    ItemType["WORM"] = "worm";
    ItemType["MUSHROOM"] = "mushroom";
})(ItemType || (ItemType = {}));
var PixelGame = /** @class */ (function () {
    function PixelGame() {
        this.player = { x: 0, y: 0 };
        this.items = [];
        this.collected = 0;
        this.totalItems = 15;
        this.gridSize = 20;
        this.tileSize = 30;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }
    PixelGame.prototype.init = function () {
        var _this = this;
        this.resetGame();
        document.addEventListener('keydown', function (e) { return _this.handleInput(e); });
        var resetButton = document.getElementById('resetButton');
        resetButton === null || resetButton === void 0 ? void 0 : resetButton.addEventListener('click', function () { return _this.resetGame(); });
        this.draw();
    };
    PixelGame.prototype.generateRandomItems = function (count) {
        var items = [];
        var itemTypes = [
            ItemType.STONE, ItemType.GRASS, ItemType.BUG,
            ItemType.WORM, ItemType.MUSHROOM
        ];
        for (var i = 0; i < count; i++) {
            var position = void 0;
            var attempts = 0;
            do {
                position = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
                attempts++;
            } while ((this.isPositionOccupied(position, items) ||
                (position.x === this.player.x && position.y === this.player.y)) &&
                attempts < 100);
            var type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            items.push({ position: position, type: type });
        }
        return items;
    };
    PixelGame.prototype.isPositionOccupied = function (position, items) {
        return items.some(function (item) {
            return item.position.x === position.x && item.position.y === position.y;
        });
    };
    PixelGame.prototype.resetGame = function () {
        this.player = { x: 0, y: 0 };
        this.items = this.generateRandomItems(this.totalItems);
        this.collected = 0;
        this.updateScore();
        this.draw();
    };
    PixelGame.prototype.handleInput = function (e) {
        var moves = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'w': { x: 0, y: -1 },
            's': { x: 0, y: 1 },
            'a': { x: -1, y: 0 },
            'd': { x: 1, y: 0 }
        };
        var move = moves[e.key];
        if (move) {
            var newPos = {
                x: this.player.x + move.x,
                y: this.player.y + move.y
            };
            if (this.isValidPosition(newPos)) {
                this.player = newPos;
                this.checkItemCollection();
                this.draw();
            }
        }
    };
    PixelGame.prototype.isValidPosition = function (pos) {
        return pos.x >= 0 && pos.x < this.gridSize &&
            pos.y >= 0 && pos.y < this.gridSize;
    };
    PixelGame.prototype.checkItemCollection = function () {
        var _this = this;
        var itemsBefore = this.items.length;
        this.items = this.items.filter(function (item) {
            return !(item.position.x === _this.player.x && item.position.y === _this.player.y);
        });
        var itemsAfter = this.items.length;
        var collectedNow = itemsBefore - itemsAfter;
        if (collectedNow > 0) {
            this.collected += collectedNow;
            this.updateScore();
            if (this.items.length === 0) {
                setTimeout(function () {
                    alert('Поздравляем! Вы собрали все предметы!');
                    _this.resetGame();
                }, 100);
            }
        }
    };
    PixelGame.prototype.updateScore = function () {
        var scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = "\u0421\u043E\u0431\u0440\u0430\u043D\u043E: ".concat(this.collected, "/").concat(this.totalItems);
        }
    };
    PixelGame.prototype.drawPlayer = function () {
        var _a = this.player, x = _a.x, y = _a.y;
        var tile = this.tileSize;
        // Рюкзак
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x * tile + 5, y * tile + 10, 8, 12);
        // Тело
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x * tile + 8, y * tile + 8, 14, 16);
        // Голова
        this.ctx.fillStyle = '#FFDBAC';
        this.ctx.fillRect(x * tile + 10, y * tile + 2, 10, 8);
        // Глаза
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x * tile + 12, y * tile + 5, 2, 2);
        this.ctx.fillRect(x * tile + 16, y * tile + 5, 2, 2);
        // Ноги
        this.ctx.fillStyle = '#556B2F';
        this.ctx.fillRect(x * tile + 8, y * tile + 24, 6, 4);
        this.ctx.fillRect(x * tile + 16, y * tile + 24, 6, 4);
        // Шляпа
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x * tile + 8, y * tile, 14, 4);
    };
    PixelGame.prototype.drawItem = function (item) {
        var _a = item.position, x = _a.x, y = _a.y;
        var tile = this.tileSize;
        switch (item.type) {
            case ItemType.STONE:
                // Камушек
                this.ctx.fillStyle = '#708090';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 6, 4, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case ItemType.GRASS:
                // Травинка
                this.ctx.fillStyle = '#32CD32';
                this.ctx.beginPath();
                this.ctx.moveTo(x * tile + 15, y * tile + 20);
                this.ctx.lineTo(x * tile + 12, y * tile + 10);
                this.ctx.lineTo(x * tile + 18, y * tile + 10);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case ItemType.BUG:
                // Букашка
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 5, 3, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x * tile + 13, y * tile + 14, 1, 1);
                this.ctx.fillRect(x * tile + 17, y * tile + 14, 1, 1);
                break;
            case ItemType.WORM:
                // Червячок
                this.ctx.fillStyle = '#FF69B4';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 8, 2, Math.PI / 4, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case ItemType.MUSHROOM:
                // Грибочек
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(x * tile + 14, y * tile + 12, 2, 6);
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 10, 6, 4, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
        }
    };
    PixelGame.prototype.draw = function () {
        var _this = this;
        // Очистка холста
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Рисование сетки (сделаем менее заметной)
        this.ctx.strokeStyle = '#2d3047';
        this.ctx.lineWidth = 0.5;
        for (var i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }
        // Рисование предметов
        this.items.forEach(function (item) { return _this.drawItem(item); });
        // Рисование игрока
        this.drawPlayer();
    };
    return PixelGame;
}());
// Инициализация игры после загрузки страницы
document.addEventListener('DOMContentLoaded', function () {
    new PixelGame();
});

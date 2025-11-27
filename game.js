var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        this.totalItems = 12;
        this.gridSize = 16;
        this.tileSize = 32;
        this.animationFrame = 0;
        this.isMoving = false;
        this.moveStartTime = 0;
        this.moveFrom = { x: 0, y: 0 };
        this.moveTo = { x: 0, y: 0 };
        this.victoryModal = null;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;
        this.init();
    }
    PixelGame.prototype.init = function () {
        var _this = this;
        this.resetGame();
        document.addEventListener('keydown', function (e) { return _this.handleInput(e); });
        var resetButton = document.getElementById('resetButton');
        resetButton === null || resetButton === void 0 ? void 0 : resetButton.addEventListener('click', function () { return _this.resetGame(); });
        this.setupTouchControls();
        this.gameLoop();
    };
    PixelGame.prototype.setupTouchControls = function () {
        var _this = this;
        var controls = document.querySelectorAll('.control-btn');
        controls.forEach(function (btn) {
            btn.addEventListener('touchstart', function (e) {
                e.preventDefault();
                var direction = btn.getAttribute('data-direction');
                _this.handleTouchInput(direction);
            });
        });
    };
    PixelGame.prototype.handleTouchInput = function (direction) {
        var moves = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        var move = moves[direction || ''];
        if (move) {
            var newPos = {
                x: this.player.x + move.x,
                y: this.player.y + move.y
            };
            if (this.isValidPosition(newPos)) {
                this.startMoveAnimation(newPos);
            }
        }
    };
    PixelGame.prototype.startMoveAnimation = function (newPos) {
        this.moveFrom = __assign({}, this.player);
        this.moveTo = newPos;
        this.isMoving = true;
        this.moveStartTime = performance.now();
    };
    PixelGame.prototype.updateMoveAnimation = function () {
        if (!this.isMoving)
            return;
        var duration = 200;
        var elapsed = performance.now() - this.moveStartTime;
        var progress = Math.min(elapsed / duration, 1);
        var easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        this.player = {
            x: this.moveFrom.x + (this.moveTo.x - this.moveFrom.x) * easeProgress,
            y: this.moveFrom.y + (this.moveTo.y - this.moveFrom.y) * easeProgress
        };
        if (progress >= 1) {
            this.isMoving = false;
            this.player = __assign({}, this.moveTo);
            this.checkItemCollection();
        }
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
            items.push({
                position: position,
                type: type,
                collected: false,
                animationOffset: Math.random() * Math.PI * 2
            });
        }
        return items;
    };
    PixelGame.prototype.isPositionOccupied = function (position, items) {
        return items.some(function (item) {
            return item.position.x === position.x && item.position.y === position.y;
        });
    };
    PixelGame.prototype.resetGame = function () {
        // Закрываем модальное окно победы если оно открыто
        this.closeVictoryMessage();
        this.player = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };
        this.items = this.generateRandomItems(this.totalItems);
        this.collected = 0;
        this.isMoving = false;
        this.updateScore();
        this.updateProgressBar();
    };
    PixelGame.prototype.closeVictoryMessage = function () {
        if (this.victoryModal) {
            this.victoryModal.remove();
            this.victoryModal = null;
        }
    };
    PixelGame.prototype.handleInput = function (e) {
        if (this.isMoving)
            return;
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
                this.startMoveAnimation(newPos);
            }
        }
    };
    PixelGame.prototype.isValidPosition = function (pos) {
        return pos.x >= 0 && pos.x < this.gridSize &&
            pos.y >= 0 && pos.y < this.gridSize;
    };
    PixelGame.prototype.checkItemCollection = function () {
        var _this = this;
        var collectedThisMove = 0;
        this.items = this.items.map(function (item) {
            if (!item.collected && item.position.x === _this.player.x && item.position.y === _this.player.y) {
                collectedThisMove++;
                return __assign(__assign({}, item), { collected: true });
            }
            return item;
        }).filter(function (item) { return !item.collected; });
        if (collectedThisMove > 0) {
            this.collected += collectedThisMove;
            this.updateScore();
            this.updateProgressBar();
            this.showCollectionEffect(collectedThisMove);
            if (this.items.length === 0) {
                setTimeout(function () {
                    _this.showVictoryMessage();
                }, 500);
            }
        }
    };
    PixelGame.prototype.showCollectionEffect = function (count) {
        var _a;
        var effect = document.createElement('div');
        effect.className = 'collection-effect';
        effect.textContent = "+".concat(count);
        effect.style.left = "".concat(this.player.x * this.tileSize + 16, "px");
        effect.style.top = "".concat(this.player.y * this.tileSize, "px");
        (_a = document.getElementById('gameContainer')) === null || _a === void 0 ? void 0 : _a.appendChild(effect);
        setTimeout(function () { return effect.remove(); }, 1000);
    };
    PixelGame.prototype.showVictoryMessage = function () {
        var _this = this;
        this.victoryModal = document.createElement('div');
        this.victoryModal.className = 'victory-message';
        this.victoryModal.innerHTML = "\n            <div class=\"victory-content\">\n                <h2>\uD83C\uDF89 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \uD83C\uDF89</h2>\n                <p>\u0412\u044B \u0441\u043E\u0431\u0440\u0430\u043B\u0438 \u0432\u0441\u0435 ".concat(this.totalItems, " \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u043E\u0432!</p>\n                <button id=\"playAgainButton\">\u0418\u0433\u0440\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430</button>\n            </div>\n        ");
        document.body.appendChild(this.victoryModal);
        // Добавляем обработчик для кнопки "Играть снова"
        var playAgainButton = document.getElementById('playAgainButton');
        playAgainButton === null || playAgainButton === void 0 ? void 0 : playAgainButton.addEventListener('click', function () {
            _this.resetGame();
        });
    };
    PixelGame.prototype.updateScore = function () {
        var scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = "".concat(this.collected, "/").concat(this.totalItems);
        }
    };
    PixelGame.prototype.updateProgressBar = function () {
        var progressBar = document.getElementById('progressBar');
        if (progressBar) {
            var progress = (this.collected / this.totalItems) * 100;
            progressBar.style.width = "".concat(progress, "%");
        }
    };
    PixelGame.prototype.drawPlayer = function () {
        var _a = this.player, x = _a.x, y = _a.y;
        var tile = this.tileSize;
        // Тень
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x * tile + 4, y * tile + 28, tile - 8, 4);
        // Тело
        this.ctx.fillStyle = '#3a86ff';
        this.ctx.fillRect(x * tile + 8, y * tile + 8, 16, 16);
        // Рюкзак
        this.ctx.fillStyle = '#8338ec';
        this.ctx.fillRect(x * tile + 6, y * tile + 10, 6, 12);
        // Голова
        this.ctx.fillStyle = '#ffbe0b';
        this.ctx.fillRect(x * tile + 10, y * tile + 4, 12, 8);
        // Глаза
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x * tile + 12, y * tile + 7, 2, 2);
        this.ctx.fillRect(x * tile + 18, y * tile + 7, 2, 2);
        // Ноги
        this.ctx.fillStyle = '#fb5607';
        this.ctx.fillRect(x * tile + 8, y * tile + 24, 6, 4);
        this.ctx.fillRect(x * tile + 18, y * tile + 24, 6, 4);
        // Анимация движения
        if (this.isMoving) {
            var wave = Math.sin(this.animationFrame * 0.1) * 2;
            this.ctx.fillRect(x * tile + 8, y * tile + 24, 6, 4 + wave);
            this.ctx.fillRect(x * tile + 18, y * tile + 24, 6, 4 - wave);
        }
    };
    PixelGame.prototype.drawItem = function (item) {
        if (item.collected)
            return;
        var _a = item.position, x = _a.x, y = _a.y;
        var tile = this.tileSize;
        var floatOffset = Math.sin(this.animationFrame * 0.05 + item.animationOffset) * 3;
        this.ctx.save();
        this.ctx.translate(0, floatOffset);
        switch (item.type) {
            case ItemType.STONE:
                var stoneGradient = this.ctx.createRadialGradient(x * tile + 15, y * tile + 15, 0, x * tile + 15, y * tile + 15, 6);
                stoneGradient.addColorStop(0, '#9d4edd');
                stoneGradient.addColorStop(1, '#5a189a');
                this.ctx.fillStyle = stoneGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 5, 3, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case ItemType.GRASS:
                this.ctx.fillStyle = '#38b000';
                this.ctx.beginPath();
                this.ctx.moveTo(x * tile + 15, y * tile + 18);
                this.ctx.lineTo(x * tile + 10, y * tile + 10);
                this.ctx.lineTo(x * tile + 20, y * tile + 10);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case ItemType.BUG:
                this.ctx.fillStyle = '#ff006e';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 5, 3, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(x * tile + 12, y * tile + 13, 4, 2);
                this.ctx.fillRect(x * tile + 16, y * tile + 13, 4, 2);
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x * tile + 13, y * tile + 14, 1, 1);
                this.ctx.fillRect(x * tile + 17, y * tile + 14, 1, 1);
                break;
            case ItemType.WORM:
                this.ctx.fillStyle = '#ff70a6';
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 15, 7, 2, Math.PI / 6, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case ItemType.MUSHROOM:
                this.ctx.fillStyle = '#e09f3e';
                this.ctx.fillRect(x * tile + 14, y * tile + 13, 2, 5);
                var mushroomGradient = this.ctx.createRadialGradient(x * tile + 15, y * tile + 11, 0, x * tile + 15, y * tile + 11, 6);
                mushroomGradient.addColorStop(0, '#ff4d6d');
                mushroomGradient.addColorStop(1, '#c9184a');
                this.ctx.fillStyle = mushroomGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 11, 6, 4, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
        }
        this.ctx.restore();
    };
    PixelGame.prototype.drawBackground = function () {
        var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1b4b');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(74, 107, 255, 0.1)';
        this.ctx.lineWidth = 1;
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
    };
    PixelGame.prototype.draw = function () {
        var _this = this;
        this.drawBackground();
        this.items.forEach(function (item) { return _this.drawItem(item); });
        this.drawPlayer();
    };
    PixelGame.prototype.gameLoop = function () {
        var _this = this;
        this.animationFrame++;
        this.updateMoveAnimation();
        this.draw();
        requestAnimationFrame(function () { return _this.gameLoop(); });
    };
    return PixelGame;
}());
document.addEventListener('DOMContentLoaded', function () {
    new PixelGame();
});

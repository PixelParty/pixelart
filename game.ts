// game.ts
type Position = { x: number; y: number };

enum ItemType {
    STONE = 'stone',
    GRASS = 'grass',
    BUG = 'bug',
    WORM = 'worm',
    MUSHROOM = 'mushroom'
}

interface GameItem {
    position: Position;
    type: ItemType;
    collected: boolean;
    animationOffset: number;
}

class PixelGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Position = { x: 0, y: 0 };
    private items: GameItem[] = [];
    private collected: number = 0;
    private totalItems: number = 12;
    private readonly gridSize: number = 16;
    private readonly tileSize: number = 32;
    private animationFrame: number = 0;
    private isMoving: boolean = false;
    private moveStartTime: number = 0;
    private moveFrom: Position = { x: 0, y: 0 };
    private moveTo: Position = { x: 0, y: 0 };
    private victoryModal: HTMLDivElement | null = null;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;

        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;

        this.init();
    }

    private init() {
        this.resetGame();
        document.addEventListener('keydown', (e) => this.handleInput(e));

        const resetButton = document.getElementById('resetButton');
        resetButton?.addEventListener('click', () => this.resetGame());

        this.setupTouchControls();
        this.gameLoop();
    }

    private setupTouchControls() {
        const controls = document.querySelectorAll('.control-btn');
        controls.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.getAttribute('data-direction');
                this.handleTouchInput(direction);
            });
        });
    }

    private handleTouchInput(direction: string | null) {
        const moves: { [key: string]: Position } = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };

        const move = moves[direction || ''];
        if (move) {
            const newPos = {
                x: this.player.x + move.x,
                y: this.player.y + move.y
            };

            if (this.isValidPosition(newPos)) {
                this.startMoveAnimation(newPos);
            }
        }
    }

    private startMoveAnimation(newPos: Position) {
        this.moveFrom = { ...this.player };
        this.moveTo = newPos;
        this.isMoving = true;
        this.moveStartTime = performance.now();
    }

    private updateMoveAnimation() {
        if (!this.isMoving) return;

        const duration = 200;
        const elapsed = performance.now() - this.moveStartTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.player = {
            x: this.moveFrom.x + (this.moveTo.x - this.moveFrom.x) * easeProgress,
            y: this.moveFrom.y + (this.moveTo.y - this.moveFrom.y) * easeProgress
        };

        if (progress >= 1) {
            this.isMoving = false;
            this.player = { ...this.moveTo };
            this.checkItemCollection();
        }
    }

    private generateRandomItems(count: number): GameItem[] {
        const items: GameItem[] = [];
        const itemTypes = [
            ItemType.STONE, ItemType.GRASS, ItemType.BUG,
            ItemType.WORM, ItemType.MUSHROOM
        ];

        for (let i = 0; i < count; i++) {
            let position: Position;
            let attempts = 0;

            do {
                position = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
                attempts++;
            } while (
                (this.isPositionOccupied(position, items) ||
                    (position.x === this.player.x && position.y === this.player.y)) &&
                attempts < 100
                );

            const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            items.push({
                position,
                type,
                collected: false,
                animationOffset: Math.random() * Math.PI * 2
            });
        }

        return items;
    }

    private isPositionOccupied(position: Position, items: GameItem[]): boolean {
        return items.some(item =>
            item.position.x === position.x && item.position.y === position.y
        );
    }

    public resetGame() {
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
    }

    private closeVictoryMessage() {
        if (this.victoryModal) {
            this.victoryModal.remove();
            this.victoryModal = null;
        }
    }

    private handleInput(e: KeyboardEvent) {
        if (this.isMoving) return;

        const moves: { [key: string]: Position } = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 },
            'w': { x: 0, y: -1 },
            's': { x: 0, y: 1 },
            'a': { x: -1, y: 0 },
            'd': { x: 1, y: 0 }
        };

        const move = moves[e.key];
        if (move) {
            const newPos = {
                x: this.player.x + move.x,
                y: this.player.y + move.y
            };

            if (this.isValidPosition(newPos)) {
                this.startMoveAnimation(newPos);
            }
        }
    }

    private isValidPosition(pos: Position): boolean {
        return pos.x >= 0 && pos.x < this.gridSize &&
            pos.y >= 0 && pos.y < this.gridSize;
    }

    private checkItemCollection() {
        let collectedThisMove = 0;

        this.items = this.items.map(item => {
            if (!item.collected && item.position.x === this.player.x && item.position.y === this.player.y) {
                collectedThisMove++;
                return { ...item, collected: true };
            }
            return item;
        }).filter(item => !item.collected);

        if (collectedThisMove > 0) {
            this.collected += collectedThisMove;
            this.updateScore();
            this.updateProgressBar();
            this.showCollectionEffect(collectedThisMove);

            if (this.items.length === 0) {
                setTimeout(() => {
                    this.showVictoryMessage();
                }, 500);
            }
        }
    }

    private showCollectionEffect(count: number) {
        const effect = document.createElement('div');
        effect.className = 'collection-effect';
        effect.textContent = `+${count}`;
        effect.style.left = `${this.player.x * this.tileSize + 16}px`;
        effect.style.top = `${this.player.y * this.tileSize}px`;
        document.getElementById('gameContainer')?.appendChild(effect);

        setTimeout(() => effect.remove(), 1000);
    }

    private showVictoryMessage() {
        this.victoryModal = document.createElement('div');
        this.victoryModal.className = 'victory-message';
        this.victoryModal.innerHTML = `
            <div class="victory-content">
                <h2>🎉 Поздравляем! 🎉</h2>
                <p>Вы собрали все ${this.totalItems} предметов!</p>
                <button id="playAgainButton">Играть снова</button>
            </div>
        `;
        document.body.appendChild(this.victoryModal);

        // Добавляем обработчик для кнопки "Играть снова"
        const playAgainButton = document.getElementById('playAgainButton');
        playAgainButton?.addEventListener('click', () => {
            this.resetGame();
        });
    }

    private updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `${this.collected}/${this.totalItems}`;
        }
    }

    private updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = (this.collected / this.totalItems) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    private drawPlayer() {
        const { x, y } = this.player;
        const tile = this.tileSize;

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
            const wave = Math.sin(this.animationFrame * 0.1) * 2;
            this.ctx.fillRect(x * tile + 8, y * tile + 24, 6, 4 + wave);
            this.ctx.fillRect(x * tile + 18, y * tile + 24, 6, 4 - wave);
        }
    }

    private drawItem(item: GameItem) {
        if (item.collected) return;

        const { x, y } = item.position;
        const tile = this.tileSize;
        const floatOffset = Math.sin(this.animationFrame * 0.05 + item.animationOffset) * 3;

        this.ctx.save();
        this.ctx.translate(0, floatOffset);

        switch (item.type) {
            case ItemType.STONE:
                const stoneGradient = this.ctx.createRadialGradient(
                    x * tile + 15, y * tile + 15, 0,
                    x * tile + 15, y * tile + 15, 6
                );
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

                const mushroomGradient = this.ctx.createRadialGradient(
                    x * tile + 15, y * tile + 11, 0,
                    x * tile + 15, y * tile + 11, 6
                );
                mushroomGradient.addColorStop(0, '#ff4d6d');
                mushroomGradient.addColorStop(1, '#c9184a');
                this.ctx.fillStyle = mushroomGradient;
                this.ctx.beginPath();
                this.ctx.ellipse(x * tile + 15, y * tile + 11, 6, 4, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
        }

        this.ctx.restore();
    }

    private drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1b4b');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(74, 107, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }
    }

    private draw() {
        this.drawBackground();
        this.items.forEach(item => this.drawItem(item));
        this.drawPlayer();
    }

    private gameLoop() {
        this.animationFrame++;
        this.updateMoveAnimation();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelGame();
});
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
}

class PixelGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Position = { x: 0, y: 0 };
    private items: GameItem[] = [];
    private collected: number = 0;
    private totalItems: number = 15;
    private readonly gridSize: number = 20;
    private readonly tileSize: number = 30;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.init();
    }

    private init() {
        this.resetGame();
        document.addEventListener('keydown', (e) => this.handleInput(e));

        const resetButton = document.getElementById('resetButton');
        resetButton?.addEventListener('click', () => this.resetGame());

        this.draw();
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
            items.push({ position, type });
        }

        return items;
    }

    private isPositionOccupied(position: Position, items: GameItem[]): boolean {
        return items.some(item =>
            item.position.x === position.x && item.position.y === position.y
        );
    }

    private resetGame() {
        this.player = { x: 0, y: 0 };
        this.items = this.generateRandomItems(this.totalItems);
        this.collected = 0;
        this.updateScore();
        this.draw();
    }

    private handleInput(e: KeyboardEvent) {
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
                this.player = newPos;
                this.checkItemCollection();
                this.draw();
            }
        }
    }

    private isValidPosition(pos: Position): boolean {
        return pos.x >= 0 && pos.x < this.gridSize &&
            pos.y >= 0 && pos.y < this.gridSize;
    }

    private checkItemCollection() {
        const itemsBefore = this.items.length;
        this.items = this.items.filter(item =>
            !(item.position.x === this.player.x && item.position.y === this.player.y)
        );

        const itemsAfter = this.items.length;
        const collectedNow = itemsBefore - itemsAfter;

        if (collectedNow > 0) {
            this.collected += collectedNow;
            this.updateScore();

            if (this.items.length === 0) {
                setTimeout(() => {
                    alert('Поздравляем! Вы собрали все предметы!');
                    this.resetGame();
                }, 100);
            }
        }
    }

    private updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Собрано: ${this.collected}/${this.totalItems}`;
        }
    }

    private drawPlayer() {
        const { x, y } = this.player;
        const tile = this.tileSize;

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
    }

    private drawItem(item: GameItem) {
        const { x, y } = item.position;
        const tile = this.tileSize;

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
    }

    private draw() {
        // Очистка холста
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисование сетки (сделаем менее заметной)
        this.ctx.strokeStyle = '#2d3047';
        this.ctx.lineWidth = 0.5;
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

        // Рисование предметов
        this.items.forEach(item => this.drawItem(item));

        // Рисование игрока
        this.drawPlayer();
    }
}

// Инициализация игры после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    new PixelGame();
});
class Vec 
{
    constructor(x = 0, y = 0) 
    {
        this.x = x;
        this.y = y;
    }
    get len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(value)
    {
        const fact = value / this.len;
        this.x *= fact;
        this.y *= fact;
    }
}

class Rect 
{
    constructor(w, h) 
    {
        this.pos = new Vec;
        this.size = new Vec(w, h);
    }
    get left() {
        return this.pos.x - this.size.x / 2;
    }
    get right() {
        return this.pos.x + this.size.x / 2;
    }
    get top() {
        return this.pos.y - this.size.y / 2;
    }
    get bottom() {
        return this.pos.y + this.size.y / 2;
    }
}

class Player extends Rect
{
    constructor()
    {
        super(10, 100);
        this.score = 0;
    }
}

class Ball extends Rect 
{
    constructor() 
    {
        super(10,10);
        this.vel = new Vec;
    }
}

class Pong 
{
    constructor(canvas) 
    {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        // Ball init
        this.ball = new Ball;

        // Players
        this.players = [new Player, new Player];
        // Player position
        this.players[0].pos.x = 30;
        this.players[1].pos.x = this._canvas.width - 30;
        this.players.forEach(player => {
            player.pos.y = this._canvas.height / 2;
        })

        // Motion
        let lastTime;
        const callback = (millis) => {
            if (lastTime) {
                this.update((millis - lastTime) / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(callback);
        };
        callback();

        // Score canvas
        this.CHAR_PIXEL = 10;
        this.CHARS = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                }
            });
            return canvas;
        });

        this.reset();
    }
    collide(player, ball)
    {
        if (player.left < ball.right && player.right > ball.left && 
            player.top < ball.bottom && player.bottom > ball.top) {
                const len = ball.vel.len;
                ball.vel.x = -ball.vel.x;
                ball.vel.y += 300 * (Math.random() - .5);
                ball.vel.len *= 1.07;
        }
    }
    draw()
    {
        this._context.fillStyle = '#2A44AF';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }
    drawRect(rect)
    {
        this._context.fillStyle = '#fff';
        this._context.fillRect(rect.left, rect.top,
                            rect.size.x, rect.size.y);
    }
    drawScore()
    {
        const align = this._canvas.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char | 0], offset + pos * cw, 20);
            });
        });
    }
    reset()
    {   
        // Ball position
        this.ball.pos.x = this._canvas.width / 2;
        this.ball.pos.y = this._canvas.height /2;

        // Ball velocity
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
    }
    start() {
        if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
            this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);
            this.ball.vel.y = 300 * (Math.random() * 2 - 1);
            this.ball.vel.len = 300;
        }
    }
    update(dt) 
    {
        this.ball.pos.x += this.ball.vel.x * dt;
        this.ball.pos.y += this.ball.vel.y * dt;

        // Bouncy walls
        if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
            // this.ball.vel.x = - this.ball.vel.x;
            const playerId = this.ball.vel.x < 0 | 0;
            this.players[playerId].score++;
            this.reset();
        }
        if (this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
            this.ball.vel.y = - this.ball.vel.y;
        }

        this.players[1].pos.y = this.ball.pos.y;

        this.players.forEach(player => this.collide(player, this.ball));

        this.draw();
    }
}

// Canvas
const canvas = document.getElementById('pong');
const pong = new Pong(canvas);

// Follow player mouse
canvas.addEventListener('mousemove', event => {
    const scale = event.offsetY / event.target.getBoundingClientRect().height;
    pong.players[0].pos.y = canvas.height * scale;
});
// Start game
canvas.addEventListener('click', event => {
    pong.start();
});
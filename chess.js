(() => {
    const NICK = 'garrytheplayer';
    const board = document.getElementById('board');
    if (!board) return;

    for (let i = 0; i < 64; i++) {
        const sq = document.createElement('i');
        if ((Math.floor(i / 8) + i) % 2) sq.className = 'dk';
        board.appendChild(sq);
    }
    const squares = board.querySelectorAll('i');
    const knight = document.createElement('span');
    knight.className = 'knight';
    knight.textContent = '♞';
    board.appendChild(knight);

    let pos = { x: 1, y: 7 };
    const jumps = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

    function place() {
        knight.style.transform = `translate(calc(var(--sq) * ${pos.x}), calc(var(--sq) * ${pos.y}))`;
    }

    function move() {
        const options = jumps
            .map(([dx, dy]) => ({ x: pos.x + dx, y: pos.y + dy }))
            .filter(p => p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 8);
        const next = options[Math.floor(Math.random() * options.length)];
        squares.forEach(s => s.classList.remove('hl'));
        squares[pos.y * 8 + pos.x].classList.add('hl');
        squares[next.y * 8 + next.x].classList.add('hl');
        pos = next;
        place();
    }

    place();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(move, 1500);

    const $ = id => document.getElementById(id);
    let stats = null;

    function countUp(el, to) {
        const start = performance.now();
        const dur = 1400;
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    }

    async function load() {
        try {
            const res = await fetch(`https://api.chess.com/pub/player/${NICK}/stats`);
            if (!res.ok) throw new Error(res.status);
            const d = await res.json();

            const mode = ['chess_rapid', 'chess_blitz', 'chess_bullet'].find(m => d[m]?.last);
            const names = { chess_rapid: 'rapid', chess_blitz: 'blitz', chess_bullet: 'bullet' };
            stats = {
                mode: names[mode],
                now: d[mode]?.last.rating,
                best: d[mode]?.best?.rating,
                puzzles: d.tactics?.highest?.rating,
                date: d[mode]?.last.date
            };

            $('chessMode').textContent = stats.mode ? `current rating · ${stats.mode}` : 'current rating';

            const io = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) {
                    countUp($('chessNow'), stats.now || 0);
                    io.disconnect();
                }
            });
            io.observe($('chessNow'));

            const list = [];
            if (stats.best) list.push(['najlepszy', stats.best]);
            if (stats.puzzles) list.push(['zadania', stats.puzzles]);
            $('chessStats').innerHTML = list.map(([k, v]) => `<li>${k}<b>${v}</b></li>`).join('');

            if (stats.date) {
                const when = new Date(stats.date * 1000).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
                $('chessDate').textContent = `ostatnia partia: ${when}`;
            }
        } catch (err) {
            $('chessNow').textContent = '—';
            $('chessDate').textContent = 'nie udało się pobrać danych, sprawdź profil';
        }
    }

    load();

    if (typeof commands !== 'undefined') {
        commands.chess = commands.szachy = () => {
            if (!stats) return print('ładuję dane z chess.com...', 'dim');
            print(`♞ ${NICK} · ${stats.mode} <span class="ok">${stats.now}</span>${stats.best ? ` · najlepszy ${stats.best}` : ''}`);
            print('zagrasz? <a href="https://www.chess.com/member/Garrytheplayer" target="_blank" rel="noopener">chess.com/member/Garrytheplayer</a>');
        };
    }
})();

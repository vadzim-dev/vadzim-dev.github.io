(() => {
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
})();

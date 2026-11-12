(() => {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const shape = [
        '..........#..#',
        '...........##.',
        '...ooooo..hhhh',
        '..oooo|ooohhhe',
        '.ooooo|ooohhhh',
        '.ooooo|ooohhh.',
        '..oooo|ooo....'
    ];
    const legs = [
        ['..#..#..#.....', '.#..#..#......'],
        ['...#..#..#....', '....#..#..#...']
    ];
    const cls = { '#': 'b-dark', o: 'b-body', '|': 'b-line', h: 'b-dark', e: 'b-eye' };

    function draw(rows) {
        let r = '';
        rows.forEach((row, y) => {
            [...row].forEach((c, x) => {
                if (cls[c]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" class="${cls[c]}"/>`;
            });
        });
        return r;
    }

    const frames = legs.map(l =>
        `<svg viewBox="0 0 14 9" shape-rendering="crispEdges">${draw([...shape, ...l])}</svg>`
    );

    const bug = document.getElementById('bug');
    if (bug) {
        bug.innerHTML = `<div class="bug__inner">${frames[0]}</div><span class="bug__say"></span>`;
        const inner = bug.querySelector('.bug__inner');
        const say = bug.querySelector('.bug__say');
        const lines = ['to nie bug, to feature', 'hej!', 'nie łapiesz mnie', 'Exception?', '404: bug not found', 'git commit -m "fix"'];

        let x = -60, frame = 0, last = 0, clicks = 0, talkTimer;
        const speed = 70;

        function jump() {
            if (bug.classList.contains('is-jumping')) return;
            bug.classList.add('is-jumping');
            setTimeout(() => bug.classList.remove('is-jumping'), 560);
        }

        function talk(text) {
            say.textContent = text;
            bug.classList.add('is-talking');
            clearTimeout(talkTimer);
            talkTimer = setTimeout(() => bug.classList.remove('is-talking'), 1600);
        }

        function step(t) {
            const dt = Math.min((t - last) / 1000, 0.05);
            last = t;
            const w = bug.parentElement.offsetWidth;
            x += speed * dt;
            if (x > w + 20) x = -60;
            bug.style.transform = `translateX(${x}px)`;
            if (Math.floor(t / 130) % 2 !== frame) {
                frame = Math.floor(t / 130) % 2;
                inner.innerHTML = frames[frame];
            }
            requestAnimationFrame(step);
        }

        if (!calm) {
            requestAnimationFrame(t => { last = t; step(t); });
            setInterval(() => { if (Math.random() < 0.55) jump(); }, 1400);
        } else {
            bug.style.transform = 'translateX(20px)';
        }

        bug.addEventListener('click', () => {
            jump();
            clicks++;
            if (clicks === 5) {
                toast('🐞 brawo, złapałeś buga! szkoda, że w kodzie tak łatwo nie jest');
                clicks = 0;
            } else {
                talk(lines[Math.floor(Math.random() * lines.length)]);
            }
        });
    }

    function toast(text) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = text;
        document.body.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-on')));
        setTimeout(() => {
            el.classList.remove('is-on');
            setTimeout(() => el.remove(), 500);
        }, 3200);
    }

    if (calm || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const html = document.documentElement;
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cur-dot';
    ring.className = 'cur-ring';
    document.body.append(dot, ring);
    html.classList.add('has-cursor');

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, lastTrail = 0;

    addEventListener('pointermove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
        html.classList.add('cur-on');

        const now = performance.now();
        if (now - lastTrail > 45) {
            lastTrail = now;
            const t = document.createElement('div');
            t.className = 'trail';
            t.style.left = mx + 'px';
            t.style.top = my + 'px';
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 600);
        }

        const el = e.target;
        ring.classList.toggle('is-text', !!el.closest('input, textarea'));
        ring.classList.toggle('is-hover', !!el.closest('a, button, .bug, [data-tilt], .paths li') && !el.closest('input'));
    });

    document.addEventListener('pointerleave', () => html.classList.remove('cur-on'));
    addEventListener('pointerdown', () => ring.classList.add('is-down'));
    addEventListener('pointerup', () => ring.classList.remove('is-down'));

    (function follow() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(follow);
    })();
})();

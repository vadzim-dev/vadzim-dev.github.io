const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

const darkMq = matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (darkMq.matches ? 'dark' : 'light');

function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
}

document.getElementById('theme').addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
});

let ticking = false;
window.addEventListener('pointermove', e => {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
});

window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        const max = document.body.scrollHeight - innerHeight;
        root.style.setProperty('--p', max > 0 ? scrollY / max : 0);
        ticking = false;
    });
}, { passive: true });

const words = ['Javie', 'Pythonie', 'JavaScripcie', 'PHP', 'SQL', 'HTML i CSS'];
const typed = document.getElementById('typed');

async function typeLoop() {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let i = 0;
    while (true) {
        const word = words[i % words.length];
        for (let n = typed.textContent.length; n >= 0; n--) {
            typed.textContent = typed.textContent.slice(0, n);
            await wait(45);
        }
        for (let n = 1; n <= word.length; n++) {
            typed.textContent = word.slice(0, n);
            await wait(90);
        }
        await wait(1600);
        i++;
    }
}
if (!reduced) typeLoop();

const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

if (!reduced && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            card.style.setProperty('--ry', (x - 0.5) * 10 + 'deg');
            card.style.setProperty('--rx', (0.5 - y) * 10 + 'deg');
            card.style.setProperty('--cx', x * 100 + '%');
            card.style.setProperty('--cy', y * 100 + '%');
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

const out = document.getElementById('termOut');
const body = document.getElementById('termBody');
const form = document.getElementById('termForm');
const input = document.getElementById('termInput');
const cmdHistory = [];
let hIndex = 0;

function print(text, cls) {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.innerHTML = text;
    out.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

const commands = {
    help() {
        print(
`dostępne komendy:
    <span class="ok">whoami</span>     kim jestem
    <span class="ok">stack</span>      czego się uczę
    <span class="ok">szkola</span>     gdzie się uczę
    <span class="ok">kontakt</span>    jak mnie złapać
    <span class="ok">github</span>     otwiera mój profil
    <span class="ok">theme</span>      zmienia motyw
    <span class="ok">date</span>       dzisiejsza data
    <span class="ok">clear</span>      czyści ekran`);
    },
    whoami() {
        print('Vadzim. Uczeń technikum, przyszły programista.\nLubię backend, ładne interfejsy i dane.');
    },
    stack() {
        ['Java', 'Python', 'JavaScript', 'PHP', 'SQL', 'HTML/CSS', 'Git']
            .forEach(name => print(`  <span class="ok">▸</span> ${name}`));
        print('ciągle się uczę, więc lista będzie rosła', 'dim');
    },
    szkola() {
        print('technikum, kierunek: technik programista');
    },
    kontakt() {
        print('najszybciej przez GitHub: <a href="https://github.com/vadzim-dev" target="_blank" rel="noopener">github.com/vadzim-dev</a>');
    },
    github() {
        print('otwieram github.com/vadzim-dev ...', 'dim');
        window.open('https://github.com/vadzim-dev', '_blank', 'noopener');
    },
    theme() {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        print(`motyw: ${next}`, 'ok');
    },
    date() {
        print(new Date().toLocaleString('pl-PL', { dateStyle: 'full', timeStyle: 'short' }));
    },
    clear() {
        out.innerHTML = '';
    },
    sudo() {
        print('nice try 😄 tu nie masz uprawnień roota', 'err');
    },
    ls() {
        print('o-mnie.txt  stack/  projekty/  kontakt.md');
    },
    hello() { print('hej! 👋', 'ok'); }
};
commands.cześć = commands.hello;
commands.hej = commands.hello;

form.addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    print(`<span class="dim">$</span> ${raw.replace(/</g, '&lt;')}`, 'cmd');
    if (!raw) return;

    cmdHistory.push(raw);
    hIndex = cmdHistory.length;

    const name = raw.split(/\s+/)[0].toLowerCase();
    const fn = commands[name];
    if (fn) fn();
    else print(`nie znam komendy: ${name.replace(/</g, '&lt;')}. wpisz <span class="ok">help</span>`, 'err');
});

input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hIndex > 0) {
        input.value = cmdHistory[--hIndex];
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        hIndex = Math.min(hIndex + 1, cmdHistory.length);
        input.value = cmdHistory[hIndex] || '';
        e.preventDefault();
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const hit = Object.keys(commands).find(c => c.startsWith(input.value.toLowerCase()));
        if (hit && input.value) input.value = hit;
    }
});

body.addEventListener('click', () => input.focus({ preventScroll: true }));

print('vadzim-os v1.0', 'dim');
print('witaj! wpisz <span class="ok">help</span> i naciśnij Enter');

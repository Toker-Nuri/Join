const logo = document.getElementById('joinLogo');
const splash = document.getElementById('splash');

logo.addEventListener('animationstart', () => {
    document.body.classList.add('show-login');
}, { once: true });

logo.addEventListener('animationend', () => {
    document.body.appendChild(logo);
    logo.classList.add('logo-stick');
    splash && splash.remove();
}, { once: true });

function getInitialsFromName(name) {
    if (!name) return '';
    const parts = String(name).trim().split(/\s+/);
    const first = (parts[0] || '')[0] || '';
    const last = (parts[parts.length - 1] || '')[0] || '';
    return (first + last).toUpperCase();
}

function updateAccountUI() {
    const badge = document.getElementById('userBadge');
    const greeting = document.getElementById('greeting');

    if (!badge || !greeting) return;

    const isGuest = (localStorage.getItem('isGuest') || 'false') === 'true';
    const name = (localStorage.getItem('name') || '').trim();

    const onLoginPage = window.location.pathname.includes('log.html');
    if (onLoginPage) {
        badge.setAttribute('hidden', '');
        badge.textContent = '';
        greeting.textContent = '';
        return;
    }

    if (isGuest) {
        badge.removeAttribute('hidden');
        badge.textContent = 'G';
        greeting.textContent = 'Good morning';
    } else if (name) {
        badge.removeAttribute('hidden');
        badge.textContent = getInitialsFromName(name);
        greeting.textContent = 'Good morning';
    } else {
        badge.setAttribute('hidden', '');
        badge.textContent = '';
        greeting.textContent = '';
    }
}

document.getElementById('btn-guest-log-in')?.addEventListener('click', () => {
    try {
        localStorage.setItem('isGuest', 'true');
        localStorage.removeItem('name');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
    } catch { }
  
    window.location.href = '../summary.html';
});

const loginPanel = document.getElementById('loginPanel');
const signupPanel = document.getElementById('signupPanel');

const openSignupBtn = document.getElementById('switchAuthBtn') || document.getElementById('openSignupBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');

const headerRight =
    document.querySelector('.header-right-side')
    || document.querySelector('.header-right')
    || document.getElementById('headerRight')
    || document.querySelector('header .header-right')
    || document.querySelector('header .header-right-side');

window.mode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login';

window.renderAuthUI = function renderAuthUI() {
    const isSignup = window.mode === 'signup';
  
    loginPanel && loginPanel.classList.toggle('show', !isSignup);
    signupPanel && signupPanel.classList.toggle('show', isSignup);

    if (headerRight) {
        if (isSignup) headerRight.classList.add('hidden');
        else headerRight.classList.remove('hidden');
    }
    updateAccountUI();
};

openSignupBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.mode = 'signup';
    window.renderAuthUI();
  
});

backToLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.mode = 'login';
    window.renderAuthUI();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.renderAuthUI);
} else {
    window.renderAuthUI();
}

window.updateAccountUI = updateAccountUI;

(function setupPasswordToggle() {
    const ids = ['loginPassword', 'signupPassword', 'signupPasswordConfirm'];
    const RIGHT_HITBOX = 36;

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.type = 'password';
        el.classList.add('passwort-icon');

        el.addEventListener('pointerdown', (ev) => {
            const rect = el.getBoundingClientRect();
            const clickFromRight = rect.right - ev.clientX;
            if (clickFromRight <= RIGHT_HITBOX) {
                ev.preventDefault();

                if (el.type === 'password') {
                    el.type = 'text';
                    el.classList.remove('passwort-icon');
                    el.classList.add('visibile-icon');
                } else {
                    el.type = 'password';
                    el.classList.remove('visibile-icon');
                    el.classList.add('passwort-icon');
                }
            }
        });
    });
})();
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

document.getElementById('btn-guest-log-in')?.addEventListener('click', () => {
    window.location.href = '../summary.html';
});

const loginPanel = document.getElementById('loginPanel');
const signupPanel = document.getElementById('signupPanel');

const openSignupBtn = document.getElementById('switchAuthBtn')  
    || document.getElementById('openSignupBtn'); 
const backToLoginBtn = document.getElementById('backToLoginBtn'); 

const headerRight =
    document.querySelector('.header-right-side')
    || document.querySelector('.header-right')
    || document.getElementById('headerRight')
    || document.querySelector('header .header-right')
    || document.querySelector('header .header-right-side');

let mode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login';

function renderAuthUI() {
    const isSignup = mode === 'signup';

    loginPanel && loginPanel.classList.toggle('show', !isSignup);
    signupPanel && signupPanel.classList.toggle('show', isSignup);

    if (headerRight) {
        if (isSignup) headerRight.classList.add('hidden');
        else headerRight.classList.remove('hidden');
    }
}

openSignupBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'signup';
    renderAuthUI();
});

backToLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'login';
    renderAuthUI();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAuthUI);
} else {
    renderAuthUI();
}
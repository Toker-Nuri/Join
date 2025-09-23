(() => {
    const STORAGE_KEY = 'usersDB';
    const EMAIL_INDEX_KEY = 'usersEmailIndex';

    const REDIRECT_AFTER_AUTH = '../summary.html';

    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
    const byPh = (ph, root = document) => root.querySelector(`input[placeholder="${ph}"], input[placeholder="${ph} "]`);

    const showMsg = (text, ok = false) => {
        if (msgEl) {
            msgEl.textContent = text;
            msgEl.style.color = ok ? '#1B5E20' : '#c0392b';
        } else {
            alert(text);
        }
    };

 
    const simpleHash = (s) =>
        'h:' + Array.from(new TextEncoder().encode(String(s))).reduce((a, b) => (a + b).toString(16), '');

   
    const uid = () => 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

    const LocalJsonAdapter = {
        _load() {
            const raw = localStorage.getItem(STORAGE_KEY);
            const db = raw ? JSON.parse(raw) : { users: [] };
            const idxRaw = localStorage.getItem(EMAIL_INDEX_KEY);
            const emailIndex = idxRaw ? JSON.parse(idxRaw) : {};
            return { db, emailIndex };
        },
        _save(db, emailIndex) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
            localStorage.setItem(EMAIL_INDEX_KEY, JSON.stringify(emailIndex));
        },
        async initFromFileOnce(url = '../data/users.json') {
            
            if (db.users && db.users.length > 0) return;
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) return;
                const json = await res.json();
                const users = Array.isArray(json.users) ? json.users : [];
                const emailIndex = {};
                users.forEach((u) => (emailIndex[(u.email || '').toLowerCase()] = u.uid));
                this._save({ users }, emailIndex);
            } catch {
            
            }
        },
        async createUser({ firstName, lastName, email, password }) {
            const { db, emailIndex } = this._load();
            const key = (email || '').toLowerCase();
            if (!key) throw new Error('Bitte E-Mail angeben.');
            if (emailIndex[key]) throw new Error('E-Mail ist bereits registriert.');

            const user = {
                uid: uid(),
                firstName,
                lastName,
                email,
                passwordHash: simpleHash(password),
                createdAt: Date.now()
            };
            db.users.push(user);
            emailIndex[key] = user.uid;
            this._save(db, emailIndex);
            return user;
        },
        async getUserByEmail(email) {
            const { db, emailIndex } = this._load();
            const id = emailIndex[(email || '').toLowerCase()];
            if (!id) return null;
            return db.users.find((u) => u.uid === id) || null;
        },
        async verifyLogin(email, password) {
            const u = await this.getUserByEmail(email);
            if (!u) throw new Error('E-Mail oder Passwort ist falsch.');
            if (u.passwordHash !== simpleHash(password)) throw new Error('E-Mail oder Passwort ist falsch.');
            return u;
        }
    };

    
    const STORAGE = LocalJsonAdapter;
    STORAGE.initFromFileOnce(); 

    const loginRoot = document.getElementById('loginPanel') || document;
    const loginEmail = document.getElementById('loginEmail') || byPh('Email', loginRoot) || byPh('E-mail', loginRoot);
    const loginPass = document.getElementById('loginPassword') || byPh('Password', loginRoot);
    const loginBtn = document.getElementById('loginBtn') || (() => {
        return $$('button, a', loginRoot).find(el => (el.textContent || '').trim().toLowerCase() === 'log in');
    })();

    const signupRoot = document.getElementById('signupPanel') || document;
    const suFirst = document.getElementById('signupFirst') || byPh('First name', signupRoot);
    const suLast = document.getElementById('signupLast') || byPh('Last name', signupRoot);
    const suEmail = document.getElementById('signupEmail') || byPh('Email', signupRoot) || byPh('E-mail', signupRoot);
    const suPass = document.getElementById('signupPassword') || byPh('Password', signupRoot);
    const suBtn = document.getElementById('createAccountBtn') || (() => {
        return $$('button, a', signupRoot).find(el => (el.textContent || '').trim().toLowerCase() === 'create account');
    })();

    async function handleSignup(e) {
        e && e.preventDefault();
        if (!suFirst || !suLast || !suEmail || !suPass) return;

        const firstName = suFirst.value.trim();
        const lastName = suLast.value.trim();
        const email = suEmail.value.trim();
        const password = suPass.value.trim();

        if (!firstName || !lastName || !email || !password) {
            return showMsg('Bitte alle Felder ausfüllen.');
        }

        try {
            const user = await STORAGE.createUser({ firstName, lastName, email, password });

            localStorage.setItem('firstName', firstName);
            localStorage.setItem('lastName', lastName);

            showMsg('Account erstellt. Weiterleitung …', true);
            window.location.href = REDIRECT_AFTER_AUTH;
        } catch (err) {
            showMsg(err.message || 'Fehler beim Erstellen des Accounts.');
        }
    }

    async function handleLogin(e) {
        e && e.preventDefault();
        if (!loginEmail || !loginPass) return;

        const email = loginEmail.value.trim();
        const pass = loginPass.value.trim();
        if (!email || !pass) return showMsg('Bitte E-Mail und Passwort eingeben.');

        try {
            const user = await STORAGE.verifyLogin(email, pass);

            localStorage.setItem('firstName', user.firstName || '');
            localStorage.setItem('lastName', user.lastName || '');

            showMsg('Login erfolgreich. Weiterleitung …', true);
            window.location.href = REDIRECT_AFTER_AUTH;
        } catch (err) {
            showMsg(err.message || 'Login fehlgeschlagen.');
        }
    }

    suBtn && suBtn.addEventListener('click', handleSignup);
    loginBtn && loginBtn.addEventListener('click', handleLogin);

    window.AuthLocal = { handleSignup, handleLogin };
})();

(function () {
    function onGuestLoginClick(e) {
        e?.preventDefault?.();
        try {
            localStorage.removeItem('firstName');
            localStorage.removeItem('lastName');
        } catch (err) {
            console.warn('localStorage not available:', err);
        }
        window.location.href = '../summary.html';
    }

    const guestBtn = document.getElementById('btn-guest-log-in')
        || document.querySelector('#btn-guest-log-in');

    if (guestBtn) {
        guestBtn.addEventListener('click', onGuestLoginClick);
    } else {
        document.addEventListener('click', (ev) => {
            const t = ev.target.closest('#btn-guest-log-in');
            if (!t) return;
            onGuestLoginClick(ev);
        });
    }
})();

(() => {
    const REDIRECT_AFTER_AUTH = '../summary.html';

    const msgEl = document.getElementById('authMessage');
    const showMsg = (text, ok = false) => {
        if (msgEl) {
            msgEl.textContent = text || '';
            msgEl.style.color = ok ? '#1B5E20' : '#DC2626';
        } else {
            // KEIN alert mehr – wenn kein Platzhalter existiert, schweigen wir leise
            if (text) console.warn('[authMessage]', text);
        }
    };

    // --- kleines Toast für Sign-up Erfolg (unten reinsliden, kurz zeigen) ---
    function showSignupToast(message = 'You Signed Up successfully') {
        // Falls schon eins offen ist, entferne es
        document.querySelector('.toast-signup')?.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-signup';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;

        document.body.appendChild(toast);

        // Start-Animation triggern (CSS kümmert sich um Slide/Fade)
        // Nach ~1.2s wieder entfernen
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 700);
    }

    const clearInvalid = (...inputs) => {
        inputs.filter(Boolean).forEach(i => i.removeAttribute('aria-invalid'));
    };
    const markInvalid = (...inputs) => {
        inputs.filter(Boolean).forEach(i => i.setAttribute('aria-invalid', 'true'));
    };

    const simpleHash = (s) =>
        'h:' + Array.from(new TextEncoder().encode(String(s))).reduce((a, b) => (a + b).toString(16), '');

    const uid = () => 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    const sanitizeKey = (str) => String(str).replace(/[.#$\[\]\/]/g, '_');

    const FirebaseAdapter = {
        async _emailToId(lowerEmail) {
            try {
                const safe = sanitizeKey(lowerEmail);
                const id = await window.firebaseGet(`/emailIndex/${safe}`);
                return (typeof id === 'string' && id) ? id : null;
            } catch { return null; }
        },
        async _ensureIndex(lowerEmail, uidValue) {
            try {
                const safe = sanitizeKey(lowerEmail);
                await window.firebasePut(`/emailIndex/${safe}`, uidValue);
            } catch { }
        },
        async _scanUserByEmail(lowerEmail) {
            try {
                const all = await window.firebaseGet(`/users`);
                if (!all || typeof all !== 'object') return null;
                for (const u of Object.values(all)) {
                    const em = (u && u.email || '').toLowerCase().trim();
                    if (em === lowerEmail) return u;
                }
            } catch { }
            return null;
        },
        async getUserByEmail(email) {
            const lower = (email || '').toLowerCase().trim();
            if (!lower) return null;

            const id = await this._emailToId(lower);
            if (id) {
                const user = await window.firebaseGet(`/users/${encodeURIComponent(id)}`);
                if (user) return user;
            }
            const scanned = await this._scanUserByEmail(lower);
            if (scanned && scanned.uid) await this._ensureIndex(lower, scanned.uid);
            return scanned || null;
        },
        async createUser({ name, email, password }) {
            const lower = (email || '').toLowerCase().trim();
            if (!lower) throw new Error('Bitte E-Mail angeben.');

            if (await this._emailToId(lower)) throw new Error('E-Mail ist bereits registriert.');
            if (await this._scanUserByEmail(lower)) throw new Error('E-Mail ist bereits registriert.');

            const id = uid();
            const user = {
                uid: id,
                name,
                email,
                passwordHash: simpleHash(password),
                createdAt: Date.now()
            };
            await window.firebasePut(`/users/${encodeURIComponent(id)}`, user);
            await this._ensureIndex(lower, id);
            return user;
        },
        async verifyLogin(email, password) {
            const user = await this.getUserByEmail(email);
            if (!user) throw new Error('auth/wrong-credentials');
            if (user.passwordHash !== simpleHash(password)) throw new Error('auth/wrong-credentials');
            return user;
        }
    };

    const STORAGE = FirebaseAdapter;

    // Elemente (Login)
    const loginEmail = document.getElementById('loginEmail');
    const loginPass = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    // Elemente (Signup)
    const suName = document.getElementById('signupName');
    const suEmail = document.getElementById('signupEmail');
    const suPass = document.getElementById('signupPassword');
    const suPass2 = document.getElementById('signupPasswordConfirm');
    const suBtn = document.getElementById('createAccountBtn');

    // === SIGNUP ===
    async function handleSignup(e) {
        e && e.preventDefault();

        // Reset Markierungen
        clearInvalid(suName, suEmail, suPass, suPass2);
        showMsg('');

        const name = suName?.value.trim();
        const email = suEmail?.value.trim();
        const pass = suPass?.value.trim();
        const pass2 = suPass2?.value.trim();
        const accept = document.getElementById('acceptPolicy');

        // Leere Felder sammeln
        const empties = [];
        if (!name) empties.push(suName);
        if (!email) empties.push(suEmail);
        if (!pass) empties.push(suPass);
        if (!pass2) empties.push(suPass2);

        if (empties.length) {
            markInvalid(...empties);
            showMsg('Please fill out all fields.');
            return;
        }

        if (pass !== pass2) {
            markInvalid(suPass, suPass2);
            showMsg('Passwords do not match.');
            return;
        }

        if (accept && !accept.checked) {
            showMsg('Please accept the Privacy Policy.');
            return;
        }

        try {
            await STORAGE.createUser({ name, email, password: pass });

            // WICHTIG: KEIN alert und KEIN localStorage-Login hier.
            // Der User ist NICHT eingeloggt – er soll erst einloggen.

            // Felder leeren
            suName.value = ''; suEmail.value = ''; suPass.value = ''; suPass2.value = '';
            accept && (accept.checked = false);

            // Toast anzeigen & nach kurzer Zeit zum Login-Panel wechseln
            showSignupToast('You Signed Up successfully');

            // sanfter Wechsel zurück zum Login
            setTimeout(() => {
                if (typeof window.mode !== 'undefined' && typeof window.renderAuthUI === 'function') {
                    window.mode = 'login';
                    window.renderAuthUI();
                }
                // Fokus auf E-Mail-Feld, damit man direkt tippen kann
                loginEmail?.focus();
            }, 900);
        } catch (err) {
            markInvalid(suEmail);
            showMsg(err?.message || 'Sign up failed.');
        }
    }

    // === LOGIN ===
    async function handleLogin(e) {
        e && e.preventDefault();

        clearInvalid(loginEmail, loginPass);
        showMsg('');

        const email = loginEmail?.value.trim();
        const pass = loginPass?.value.trim();

        const empties = [];
        if (!email) empties.push(loginEmail);
        if (!pass) empties.push(loginPass);

        if (empties.length) {
            markInvalid(...empties);
            showMsg('Please enter email and password.');
            return;
        }

        try {
            const user = await STORAGE.verifyLogin(email, pass);

            const fullName = (user.name && String(user.name).trim())
                || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

            localStorage.setItem('isGuest', 'false');
            localStorage.setItem('name', fullName || '');

            showMsg('Login successful. Redirecting …', true);
            window.location.href = REDIRECT_AFTER_AUTH;
        } catch (err) {
            markInvalid(loginEmail, loginPass);
            showMsg('Check your email and password. Please try again.');
        }
    }

    suBtn && suBtn.addEventListener('click', handleSignup);
    loginBtn && loginBtn.addEventListener('click', handleLogin);

    window.AuthLocal = { handleSignup, handleLogin };
})();

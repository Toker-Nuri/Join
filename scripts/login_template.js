function getLoginContent() {
  return `
        <header>
            <div class="logo">
                <svg width="100" height="60" viewBox="0 0 152.94 45" xmlns="http://www.w3.org/2000/svg">
                
                    <rect x="0" y="22" width="18" height="18" rx="2" fill="#29abe2"/>
                    
                    
                    <path d="M47.46 45c-16.68 0-24.32-7.82-24.32-24.32V0h15.78v20.68c0 8.14 2.43 10.64 8.54 10.64 6.11 0 8.54-2.5 8.54-10.64V0h15.78v20.68C71.78 37.18 64.14 45 47.46 45z" fill="#2a3647"/>
                    <text x="80" y="35" font-family="Inter,sans-serif" font-size="24" font-weight="700" fill="#2a3647">OIN</text>
                </svg>
            </div>
            <div class="sign-up-section">
                <span>Not a Join user?</span>
                <div class="sign-up-button">
                    <a href="sign_up.html">Sign up</a>
                </div>
            </div>
        </header>

        <section class="Log-In-Section">
            <div class="Log-In-Field">
                <span class="Log-In-Headline">Log in</span>
                <div class="underline-headline"></div>
                
                <form class="Log-In-Form" onsubmit="loginUser(event); return false">
                    <div class="inputs-section">
                        <!-- Email Input -->
                        <div id="emailInputField" class="email-password-fields">
                            <input class="input-email-password" type="email" id="email" placeholder="Email" required>
                            <svg class="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="m2 6 10 7L22 6"/>
                            </svg>
                        </div>

                        <!-- Password Input -->
                        <div class="email-password-alert-section">
                            <div id="passwordInputField" class="email-password-fields">
                                <input class="input-email-password" oninput="showClosedEyeImg()" type="password" id="password" 
                                       minlength="6" placeholder="Password" required>
                                <div id="passwordInputSection" class="password-input-section">
                                    <svg id="passwordLockImg" class="input-icon lock-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <circle cx="12" cy="16" r="1"/>
                                        <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                            </div>
                            <span id="alertMessageEmail" class="hide-alert-message">
                                Check your email and password
                            </span>
                        </div>
                    </div>

                    <!-- Login Buttons -->
                    <div class="Log-In-and-Guest-Log-In">
                        <button type="submit" class="Log-In-Button">Log in</button>
                        <button type="button" onclick="guestLogin()" class="Guest-Log-In-Button">Guest Log in</button>
                    </div>
                </form>

                <!-- Footer inside Card -->
                <div class="footer-in-card">
                    <a href="privacy_policy_unlogged.html">Privacy Policy</a>
                    <a href="legal_notice_unlogged.html">Legal notice</a>
                </div>
            </div>
        </section>

        <div id="rotateWarning" class="rotate-overlay hide">
            <div class="rotate-message">
                <h2>Bitte drehe dein Gerät</h2>
                <p>Um unsere Seite optimal zu nutzen, verwende bitte das Hochformat.</p>
            </div>
        </div>
    `;
}
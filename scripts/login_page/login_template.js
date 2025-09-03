function getLoginContent() {
  return `
        <header>
            <div class="logo">
                <div class="logo-icon">
                    <div class="logo-squares">
                        <div class="square square-top-left"></div>
                        <div class="square square-top-right"></div>
                        <div class="square square-bottom-left"></div>
                        <div class="square square-bottom-right"></div>
                    </div>
                    <span class="logo-j">J</span>
                    <span class="logo-text">OIN</span>
                </div>
            </div>
            <div class="sign-up-section">
                <span>Noch kein JOIN-Benutzer?</span>
                <div class="sign-up-button">
                    <a href="sign_up.html">Registrieren</a>
                </div>
            </div>
        </header>

        <section class="Log-In-Section">
            <div class="Log-In-Field">
                <span class="Log-In-Headline">Anmelden</span>
                <div class="underline-headline"></div>
                
                <form class="Log-In-Form" onsubmit="loginUser(event); return false">
                    <div class="inputs-section">
                        <!-- Email Input -->
                        <div id="emailInputField" class="email-password-fields">
                            <input class="input-email-password" type="text" id="email" placeholder="E-Mail">
                            <img src="./assets/img/mail.svg" alt="">
                        </div>

                        <!-- Password Input -->
                        <div class="email-password-alert-section">
                            <div id="passwordInputField" class="email-password-fields">
                                <input class="input-email-password" oninput="showClosedEyeImg()" type="password" id="password" 
                                       minlength="6" placeholder="Passwort">
                                <div id="passwordInputSection" class="password-input-section">
                                    <img id="passwordLockImg" src="./assets/img/lock.svg" alt="">
                                </div>
                            </div>
                            <span id="alertMessageEmail" class="hide-alert-message">
                                Überprüfen Sie Ihre E-Mail und Ihr Passwort
                            </span>
                        </div>
                    </div>

                    <!-- Login Buttons -->
                    <div class="Log-In-and-Guest-Log-In">
                        <button type="submit" class="Log-In-Button">Anmelden</button>
                        <button type="button" onclick="guestLogin()" class="Guest-Log-In-Button">Gast-Anmeldung</button>
                    </div>
                </form>
            </div>
        </section>

        <div class="sign-up-section-hidden">
            <div class="sign-up-section-inner-div">
                <span>Noch kein JOIN-Benutzer?</span>
                <div class="sign-up-button">
                    <a href="sign_up.html">Registrieren</a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer>
            <div class="privacy-span">
                <a href="privacy_policy_unlogged.html"><span>Datenschutzerklärung</span></a>
            </div>
            <div class="legal-span">
                <a href="legal_notice_unlogged.html"><span>Impressum</span></a>
            </div>
        </footer>

        <div id="rotateWarning" class="rotate-overlay hide">
        <div class="rotate-message">
          <h2>Bitte drehe dein Gerät</h2>
          <p>Um unsere Seite optimal zu nutzen, verwende bitte das Hochformat.</p>
        </div>
        </div>
    `;
}
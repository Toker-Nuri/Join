/**
 * Initializes login page with animation sequence
 * Shows splash screen with correct logo then transitions to login form
 */
function initLoginAnimation() {
    const contentElement = document.getElementById('content');
    contentElement.classList.add('content-hidden');
    
    if (!document.getElementById('splash-screen')) {
      createSplashScreen();
    }
    
    // Render login content immediately but keep it hidden
    renderLoginContent();

    setTimeout(() => {
      const splashScreen = document.getElementById('splash-screen');
      
      if (splashScreen) {
        splashScreen.style.opacity = '0';
        
        setTimeout(() => {
          splashScreen.remove();
          contentElement.classList.remove('content-hidden');
          contentElement.classList.add('content-visible');
        }, 500);
      } else {
        // Fallback if no splash screen
        contentElement.classList.remove('content-hidden');
        contentElement.classList.add('content-visible');
      }
    }, 2000);
  }
  
  /**
   * Creates splash screen with the original SVG logo
   */
  function createSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.className = 'splash-screen';
    
    // Header mit Sign up Button
    const splashHeader = document.createElement('div');
    splashHeader.className = 'splash-header';
    splashHeader.innerHTML = `
      <div></div>
      <div class="splash-signup">
        <span>Not a Join user?</span>
        <button class="splash-signup-btn">Sign up</button>
      </div>
    `;
    
    // Logo Container
    const logoContainer = document.createElement('div');
    logoContainer.className = 'splash-logo-container';
    
    // Das echte JOIN Logo aus der SVG-Datei
    const logo = document.createElement('img');
    logo.src = './assets/img/joinLogo.svg';
    logo.alt = 'Join Logo';
    logo.width = 120;
    logo.className = 'splash-logo';
    
    logoContainer.appendChild(logo);
    splashScreen.appendChild(splashHeader);
    splashScreen.appendChild(logoContainer);
    document.body.appendChild(splashScreen);
  }

  /**
   * Renders the login content into the designated container.
   * Called during animation sequence
   */
  function renderLoginContent() {
    const contentDiv = document.getElementById('content');
    if (contentDiv && typeof getLoginContent === 'function') {
      contentDiv.innerHTML = getLoginContent();
      
      // Initialize event listeners after content is rendered
      if (typeof initLoginEventListeners === 'function') {
        initLoginEventListeners();
      }
    } else {
      console.error('Content div not found or getLoginContent function not available');
    }
  }
/**
 * Initializes login page with animation sequence
 * Shows splash screen then transitions to login form
 */
function initLoginAnimation() {
    const contentElement = document.getElementById('content');
    contentElement.classList.add('content-hidden');
    
    if (!document.getElementById('splash-screen')) {
      createSplashScreen();
    }
    
    // Render login content immediately
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
   * Creates splash screen with logo
   */
  function createSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.className = 'splash-screen';
    
    const logo = document.createElement('img');
    logo.src = './assets/img/joinLogo.svg';
    logo.alt = 'Join Logo';
    logo.className = 'splash-logo';
    
    splashScreen.appendChild(logo);
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
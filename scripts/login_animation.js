function initLoginAnimation() {
    const contentElement = document.getElementById('content');
    contentElement.classList.add('content-hidden');
    
    if (!document.getElementById('splash-screen')) {
      createSplashScreen();
    }
    
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
        contentElement.classList.remove('content-hidden');
        contentElement.classList.add('content-visible');
      }
    }, 2000);
  }
  
  function createSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.className = 'splash-screen';
    
    const splashHeader = document.createElement('div');
    splashHeader.className = 'splash-header';
    splashHeader.innerHTML = `
      <div></div>
      <div class="splash-signup">
        <span>Not a Join user?</span>
        <button class="splash-signup-btn">Sign up</button>
      </div>
    `;
    
    const logoContainer = document.createElement('div');
    logoContainer.className = 'splash-logo-container';
    
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

  function renderLoginContent() {
    const contentDiv = document.getElementById('content');
    if (contentDiv && typeof getLoginContent === 'function') {
      contentDiv.innerHTML = getLoginContent();
      
      if (typeof initLoginEventListeners === 'function') {
        initLoginEventListeners();
      }
    } else {
      console.error('Content div not found or getLoginContent function not available');
    }
  }
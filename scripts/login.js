/**
 * Sets up event listeners for the login form elements
 * Called after rendering the login content
 */
function initLoginEventListeners() {
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordLockImg);
  }
}

/**
 * Updates the password lock image based on user input.
 */
function updatePasswordLockImg() {
  const passwordInput = document.getElementById('password').value;
  const passwordLockImg = document.getElementById('passwordLockImg');
  
  if (passwordInput.length === 0) {
    // Show lock icon
    passwordLockImg.innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <circle cx="12" cy="16" r="1"/>
      <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
    `;
    passwordLockImg.onclick = null;
  } else {
    // Show visibility off icon
    passwordLockImg.innerHTML = `
      <path d="m9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    `;
    passwordLockImg.onclick = togglePasswordVisibility;
  }
}

/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const passwordLockImg = document.getElementById('passwordLockImg');
  
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    // Show visibility icon
    passwordLockImg.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  } else {
    passwordInput.type = "password";
    // Show visibility off icon
    passwordLockImg.innerHTML = `
      <path d="m9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    `;
  }
}

/**
 * Updates the password visibility icon based on the current state of the password input.
 * When the password field is non-empty, it sets the icon to "visibility_off" and attaches the togglePasswordVisibility click handler.
 * If the password field is empty, it sets the icon to "lock" and removes any click event handler.
 */
function showClosedEyeImg() {
  const input = document.getElementById('password');
  const img = document.getElementById('passwordLockImg');
  
  if (input && img) {
    if (input.value) {
      img.innerHTML = `
        <path d="m9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
      `;
      img.onclick = togglePasswordVisibility;
    } else {
      img.innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <circle cx="12" cy="16" r="1"/>
        <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
      `;
      img.onclick = null;
    }
  }
} input.
 */
function updatePasswordLockImg() {
  let passwordInput = document.getElementById('password').value;
  let passwordLockImg = document.getElementById('passwordLockImg');
  if(passwordInput.length===0){
    passwordLockImg.src="./assets/img/lock.svg";
    passwordLockImg.onclick=null;
  } else {
    passwordLockImg.src="./assets/img/visibility_off.svg";
    passwordLockImg.onclick=togglePasswordVisibility;
  }
}

/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility() {
  let passwordInput = document.getElementById('password');
  let passwordLockImg = document.getElementById('passwordLockImg');
  if(passwordInput.type==="password"){
    passwordInput.type="text";
    passwordLockImg.src="./assets/img/visibility.svg";
  } else {
    passwordInput.type="password";
    passwordLockImg.src="./assets/img/visibility_off.svg";
  }
}

/**
 * Updates the password visibility icon based on the current state of the password input.
 * When the password field is non-empty, it sets the icon to "visibility_off" and attaches the togglePasswordVisibility click handler.
 * If the password field is empty, it sets the icon to "lock" and removes any click event handler.
 */
function showClosedEyeImg() {
  let input = document.getElementById('password');
  let img = document.getElementById('passwordLockImg');
  if (input && img) {
    img.src = input.value ? "./assets/img/visibility_off.svg" : "./assets/img/lock.svg";
    img.onclick = input.value ? togglePasswordVisibility : null;
  }
}
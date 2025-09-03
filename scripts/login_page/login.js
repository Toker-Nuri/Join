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
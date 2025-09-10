/**
 * Firebase Configuration - Ersetzen Sie diese mit Ihren Firebase-Daten
 */
const FIREBASE_CONFIG = {
    databaseURL: "https://join-aen-default-rtdb.europe-west1.firebasedatabase.app/"
};

/**
 * Initialize splash screen animation on page load
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        const mainContent = document.getElementById('main-content');
        
        if (splashScreen) {
            splashScreen.style.opacity = '0';
            
            setTimeout(() => {
                splashScreen.remove();
                mainContent.classList.add('visible');
            }, 500);
        }
    }, 2000);
});

/**
 * Toggle password visibility for password inputs
 * @param {string} inputId - ID of the password input field
 * @param {HTMLElement} icon - The icon element to update
 */
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    
    // Change icon based on visibility state
    if (isPassword) {
        // Show eye icon (password is visible)
        icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    } else {
        // Show locked eye icon (password is hidden)
        icon.innerHTML = `
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
        `;
    }
}

/**
 * Validate the signup form in real-time
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateForm() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const signupBtn = document.getElementById('signupBtn');
    
    if (password !== confirmPassword && confirmPassword.length > 0) {
        showError('Passwords do not match');
        signupBtn.disabled = true;
        return false;
    }
    
    if (password.length > 0 && password.length < 6) {
        showError('Password must be at least 6 characters long');
        signupBtn.disabled = true;
        return false;
    }
    
    signupBtn.disabled = false;
    hideError();
    return true;
}

/**
 * Generate a unique user ID
 * @returns {string} Unique user ID
 */
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Split full name into first and last name
 * @param {string} fullName - Full name input
 * @returns {object} Object with firstName and lastName
 */
function splitName(fullName) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return { firstName, lastName };
}

/**
 * Save user data to Firebase
 * @param {object} userData - User data to save
 * @returns {Promise} Firebase response
 */
async function saveUserToFirebase(userData) {
    try {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/users.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('User saved to Firebase:', result);
        return result;
    } catch (error) {
        console.error('Error saving user to Firebase:', error);
        throw error;
    }
}

/**
 * Check if email already exists in Firebase
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 */
async function checkEmailExists(email) {
    try {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/users.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        
        if (!users) {
            return false;
        }

        // Check if any user has the same email
        for (let userId in users) {
            if (users[userId].email && users[userId].email.toLowerCase() === email.toLowerCase()) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking email:', error);
        return false; // In case of error, allow registration to continue
    }
}

/**
 * Handle the signup form submission
 * @param {Event} event - Form submission event
 */
async function handleSignup(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const privacyAccepted = document.getElementById('privacy').checked;
    
    // Validate all fields
    if (!name || !email || !password) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (!privacyAccepted) {
        showError('Please accept the Privacy Policy');
        return;
    }

    // Disable form during submission
    const signupBtn = document.getElementById('signupBtn');
    const originalText = signupBtn.textContent;
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
        // Check if email already exists
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            showError('An account with this email already exists');
            return;
        }

        // Split name into first and last name
        const { firstName, lastName } = splitName(name);
        
        // Create user data object
        const userData = {
            id: generateUserId(),
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(),
            password: password, // In production, hash this password!
            createdAt: new Date().toISOString(),
            isActive: true
        };

        // Save to Firebase
        await saveUserToFirebase(userData);
        
        // Show success message
        showSuccess('Account created successfully! Redirecting to login...');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Signup error:', error);
        showError('An error occurred while creating your account. Please try again.');
    } finally {
        // Re-enable form
        signupBtn.disabled = false;
        signupBtn.textContent = originalText;
    }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    successEl.textContent = message;
    successEl.style.display = 'block';
    hideError();
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    hideSuccess();
}

/**
 * Hide success message
 */
function hideSuccess() {
    document.getElementById('success-message').style.display = 'none';
}

/**
 * Hide error message
 */
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

/**
 * Navigate back to previous page
 */
function goBack() {
    window.history.back();
}

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for real-time validation
    document.getElementById('password').addEventListener('input', validateForm);
    document.getElementById('confirmPassword').addEventListener('input', validateForm);
    
    // Add event listener for form submission
    document.querySelector('.signup-form').addEventListener('submit', handleSignup);
    
    // Clear messages when user starts typing
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                hideError();
                hideSuccess();
            }
        });
    });
});
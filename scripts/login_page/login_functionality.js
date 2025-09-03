/**
 * Base URL for the Firebase Realtime Database.
 * @constant {string}
 */
const DATABASEURL =
  "https://join-7dba7-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Handles the user login process by validating credentials,
 * storing user data in localStorage, and redirecting on success.
 * Shows an alert if login fails.
 * 
 * @param {Event} event - The form submission event
 */
async function loginUser(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  try {
    const usersData = await fetchUsers();
    const user = findUser(usersData, emailInput, passwordInput);

    if (user) {
      storeUserData(user);
      window.location.href = "summary.html";
    } else {
      document.getElementById("alertMessageEmail").className = "alert-message";
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login.");
  }
}

/**
 * Fetches all user data from the database URL.
 * 
 * @returns {Promise<Object>} A promise resolving to the users data object
 */
async function fetchUsers() {
  const response = await fetch(`${DATABASEURL}.json`);
  return await response.json();
}

/**
 * Searches for a user matching the given email and password.
 * 
 * @param {Object} usersData - Object containing all users data
 * @param {string} email - The email to match (case-insensitive)
 * @param {string} password - The password to match (string comparison)
 * @returns {Object|null} The matched user object or null if not found
 */
function findUser(usersData, email, password) {
  for (let userKey in usersData) {
    const user = usersData[userKey];
    if (
      user.email.toLowerCase() === email.toLowerCase() &&
      String(user.password) === password
    ) {
      return user;
    }
  }
  return null;
}

/**
 * Stores user information in localStorage.
 * 
 * @param {Object} user - The user object containing id, firstName, and lastName
 */
function storeUserData(user) {
  localStorage.setItem("firstName", user.firstName);
  localStorage.setItem("lastName", user.lastName);
  localStorage.setItem("currentUserId", user.id);
}

/**
 * Logs in as a guest user by fetching guest user data from the database.
 * Stores guest user info in localStorage and redirects to summary page.
 * Shows an alert if guest user data cannot be loaded.
 */
async function guestLogin() {
  try {
    const response = await fetch(`${DATABASEURL}/guest_user.json`);
    const guestData = await response.json();

    if (!guestData) {
      alert("Guest user could not be loaded.");
      return;
    }

    localStorage.setItem("firstName", guestData.firstName);
    localStorage.setItem("lastName", guestData.lastName);
    localStorage.setItem("currentUserId", guestData.id);

    window.location.href = "summary.html";
  } catch (error) {
    console.error("Error during guest login:", error);
    alert("An error occurred.");
  }
}

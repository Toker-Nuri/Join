/**
 * Checks if the current device is a mobile device.
 * @returns {boolean} True if the device is mobile.
 */
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);
}


/**
 * Determines if the device is in landscape orientation.
 * @returns {boolean} True if the device is in landscape mode.
 */
function isLandscapeOrientation() {
  return window.matchMedia("(orientation: landscape)").matches;
}


/**
 * Updates the overlay's visibility based on device type and orientation.
 * @param {HTMLElement} overlay - The overlay element.
 */
function updateOverlayVisibility(overlay) {
  if (isMobileDevice() && isLandscapeOrientation()) {
    overlay.classList.remove("hide");
  } else {
    overlay.classList.add("hide");
  }
}


/**
 * Adds event listeners to update overlay visibility on orientation change and resize.
 * @param {HTMLElement} overlay - The overlay element.
 */
function addOrientationEventListeners(overlay) {
  const update = () => updateOverlayVisibility(overlay);
  window.addEventListener("orientationchange", update);
  window.addEventListener("resize", update);
}


/**
 * Initializes the landscape overlay functionality by locating the overlay element
 * and setting up the orientation check and event listeners.
 */
function initLandscapeOverlay() {
  const overlay = document.getElementById("rotateWarning");
  if (!overlay) {
    console.error('Overlay element with ID "rotateWarning" not found.');
    return;
  }
  updateOverlayVisibility(overlay);
  addOrientationEventListeners(overlay);
}


/**
 * MutationObserver callback that initializes the landscape overlay once the element is added.
 * @param {MutationRecord[]} mutations - Array of mutation records.
 * @param {MutationObserver} observer - The MutationObserver instance.
 */
function handleOverlayMutation(mutations, observer) {
  if (document.getElementById("rotateWarning")) {
    initLandscapeOverlay();
    observer.disconnect();
  }
}


/**
 * Observes the DOM for the addition of the overlay element.
 */
function observeForOverlayElement() {
  const observer = new MutationObserver(handleOverlayMutation);
  observer.observe(document.body, { childList: true, subtree: true });
}


// Start observing for the overlay element.
observeForOverlayElement();
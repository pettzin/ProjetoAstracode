
/**
 * @param {HTMLInputElement} input - The input element to apply the mask to
 */
function applyPhoneMask(input) {
    input.addEventListener("input", (e) => {
      // Get only digits from input value
      let value = e.target.value.replace(/\D/g, "")
  
      // Apply phone mask format: (XX) XXXXX-XXXX
      if (value.length > 0) {
        // Format with parentheses for area code
        if (value.length <= 2) {
          value = `(${value}`
        } else if (value.length <= 7) {
          value = `(${value.substring(0, 2)}) ${value.substring(2)}`
        } else {
          value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`
        }
      }
  
      // Update input value with formatted text
      e.target.value = value
    })
  }
  
  /**
   * Applies an email mask to an input field
   * @param {HTMLInputElement} input - The input element to apply the mask to
   */
  function applyEmailMask(input) {
    input.addEventListener("input", (e) => {
      // Get current value
      let value = e.target.value
  
      // Remove spaces
      value = value.replace(/\s/g, "")
  
      // Convert to lowercase for consistency
      value = value.toLowerCase()
  
      // Basic email validation - only allow valid email characters
      value = value.replace(/[^a-z0-9@._-]/g, "")
  
      // Update input value
      e.target.value = value
    })
  }
  
  /**
   * Initialize input masks on a page
   */
  function initInputMasks() {
    // Apply phone mask to phone input fields
    const phoneInputs = document.querySelectorAll('input[type="number"], input#profilePhone')
    phoneInputs.forEach((input) => {
      // Change type from number to text to allow non-numeric characters in the mask
      if (input.type === "number") {
        input.type = "text"
      }
      applyPhoneMask(input)
    })
  
    // Apply email mask to email input fields
    const emailInputs = document.querySelectorAll('input[type="email"], input#profileEmail')
    emailInputs.forEach((input) => {
      applyEmailMask(input)
    })
  }
  
  // Export functions for use in other files
  window.InputMasks = {
    applyPhoneMask,
    applyEmailMask,
    initInputMasks,
  }  
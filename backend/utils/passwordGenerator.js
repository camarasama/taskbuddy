// ============================================================================
// Password Generator Utility - NEW FILE
// Generates secure random passwords for child/spouse accounts
// ============================================================================

const crypto = require('crypto');

// ============================================================================
// GENERATE RANDOM PASSWORD
// Generates a secure random password with mixed character types
// ============================================================================
exports.generateRandomPassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill rest with random characters
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password to randomize position of required characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// ============================================================================
// GENERATE MEMORABLE PASSWORD
// Generates a more memorable password using word patterns
// Format: Word-Word-Number-Special (e.g., "Happy-Cloud-2024!")
// ============================================================================
exports.generateMemorablePassword = () => {
  const words = [
    'Happy', 'Sunny', 'Bright', 'Swift', 'Smart', 'Cool', 'Quick', 'Bold',
    'Lucky', 'Star', 'Moon', 'Cloud', 'Ocean', 'River', 'Forest', 'Wind'
  ];
  
  const specials = ['!', '@', '#', '$', '%', '&', '*'];
  
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  const special = specials[Math.floor(Math.random() * specials.length)];
  
  return `${word1}-${word2}-${number}${special}`;
};

// ============================================================================
// VALIDATE PASSWORD STRENGTH
// Checks if a password meets minimum security requirements
// ============================================================================
exports.validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = 
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber;
  
  return {
    isValid,
    errors: {
      length: password.length < minLength ? `Password must be at least ${minLength} characters` : null,
      uppercase: !hasUppercase ? 'Password must contain at least one uppercase letter' : null,
      lowercase: !hasLowercase ? 'Password must contain at least one lowercase letter' : null,
      number: !hasNumber ? 'Password must contain at least one number' : null
    },
    strength: calculatePasswordStrength(password)
  };
};

// ============================================================================
// CALCULATE PASSWORD STRENGTH
// Returns strength rating: 'weak', 'medium', 'strong', 'very-strong'
// ============================================================================
function calculatePasswordStrength(password) {
  let strength = 0;
  
  // Length scoring
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;
  
  // Character type scoring
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  // Pattern detection (deduct points for common patterns)
  if (/(.)\1{2,}/.test(password)) strength -= 1; // Repeated characters
  if (/^[0-9]+$/.test(password)) strength -= 2; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) strength -= 1; // Only letters
  
  // Return strength rating
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  if (strength <= 6) return 'strong';
  return 'very-strong';
}

export const validInputs = (email: string, password: string): boolean => {
  email = email.trim();
  password = password.trim();

  if (!email || !password) {
    alert('Please fill in both fields');
    return false;
  }
  if (!email.includes('@')) {
    alert('Provide a valid email address');
    return false;
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[!-/:-@[-`{-~]/.test(password); // all ASCII symbols
  const isLongEnough = password.length >= 8;

  if (!isLongEnough || !hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    alert('Password must be ≥ 8 chars, include upper & lower case, a digit and a symbol.');
    return false;
  }
  return true;
};



export const validMail = (email: string): boolean => {
  email = email.trim();
  if (!email.includes('@')) {
    alert('Provide a valid email address');
    return false;
  }
  return true;
};

export const validRegistrationPassword = (password: string): boolean => {
  password = password.trim();

  if (!password) {
    alert('Please fill in password fields');
    return false;
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[!-/:-@[-`{-~]/.test(password); // all ASCII symbols
  const isLongEnough = password.length >= 8;

  if (!isLongEnough || !hasUpper || !hasLower || !hasDigit || !hasSymbol) {
    alert('Password must be ≥ 8 chars, include upper & lower case, a digit and a symbol.');
    return false;
  }
  return true;
};
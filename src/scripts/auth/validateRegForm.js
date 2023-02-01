export default function validateForm(regForm) {
  if (regForm.username.includes(" ")) {
    return {
      valid: false,
      message: "Username must not contain spaces"
    }
  }
  if (regForm.username.length < 4) { // check username is long enough
    return {
      valid: false,
      message: "Username must be at least 4 characters."
    }
  }
  const regex = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i); // define email validity regex
  if (!regex.test(regForm.email)) { // if email does not meet regex critera
    return {
      valid: false,
      message: "Invalid email address."
    }
  }
  if (regForm.password !== regForm.passwordConf) { // check passwords match
    return {
      valid: false,
      message: "Passwords do not match."
    }
  }
  if (regForm.password.length < 6) { // check password is long enough
    return {
      valid: false,
      message: "Password must be at least 6 characters."
    }
  }
  return {
    valid: true,
    message: ""
  }
}
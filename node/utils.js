/*
 * All return true or false
 * isEightAlphanumerics
 * isNewUsername
 * isExistingUsername
 * isEmail
 * 
*/

export function isEightAlphanumerics(str) {
  return /^[A-Za-z0-9]{8,}$/.test(str);
}

export async function isNewUsername(username) {
  try {
    const res = await fetch(`http://fastapi:8000/compeer?username=${username}`);
    const data = await res.json();
    return data.exists === false; // true only if username is NOT found
  } catch (err) {
    console.error("Error checking username:", err);
    return false; // treat failures as "username not valid"
  }
}

export async function isExistingUsername(username) {
  try {
    const res = await fetch(`http://fastapi:8000/compeer?username=${username}`);
    const data = await res.json();
    return data.exists === true; 
  } catch (err) {
    console.error("Error checking username:", err);
    return false; // treat failures as "username not valid"
  }
}

export function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

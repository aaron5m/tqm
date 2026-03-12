/*
 * All return true or false
 * isEightChars
 * usernameExists
 * isNewValidUsername
 * isEmail
 * 
*/

export function isEightChars(str) {
  return /^[A-Za-z0-9]{8,}$/.test(str);
}

export async function usernameExists(username) {
  try {
    const res = await fetch(`http://fastapi:8000/compeer?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    return data.exists === true;
  } catch (err) {
    return true; // treat failures as "username exists" to block signup
  }
}

export async function isNewValidUsername(username) {
  if (!isEightChars(username)) return false;
  if (await usernameExists(username)) return false;
  return true;
}

export function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

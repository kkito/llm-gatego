export function renderLogin(user = false): string {
  return `<form id="login-form"><h1>${user ? 'User login' : 'Admin login'}</h1><label>${user ? 'API Key' : 'Password'} <input name="${user?'apikey':'password'}" type="password" required></label><button type="submit">Login</button></form>`
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem('sd_admin_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires) {
      localStorage.removeItem('sd_admin_session');
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem('sd_admin_session');
}
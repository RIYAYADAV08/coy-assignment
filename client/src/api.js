async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const getFeed = () => request('/feed').then((d) => d.profiles);
export const getMatches = () => request('/matches').then((d) => d.matches);
export const postSwipe = (profileId, direction) =>
  request('/swipe', { method: 'POST', body: JSON.stringify({ profileId, direction }) });
export const resetDemo = () => request('/reset', { method: 'POST' });

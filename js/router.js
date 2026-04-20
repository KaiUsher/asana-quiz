const TRANSIENT = new Set([
  'quiz', 'insight', 'result', 'mastery-summary', 'streak-milestone',
]);

let _routes;

export function navigate(hash) {
  window.location.hash = hash.startsWith('#') ? hash : '#' + hash;
}

export function initRouter(routes) {
  _routes = new Map(Object.entries(routes));

  function handleHash() {
    const key = window.location.hash.replace('#', '').toLowerCase();

    if (TRANSIENT.has(key) || !_routes.has(key)) {
      history.replaceState(null, '', '#');
      _routes.get('')();
      return;
    }

    _routes.get(key)();
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}

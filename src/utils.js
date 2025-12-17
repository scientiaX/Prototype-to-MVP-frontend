export function createPageUrl(pageName) {
  const routes = {
    Home: '/',
    Arena: '/arena',
    Profile: '/profile',
    Leaderboard: '/leaderboard',
    Calibration: '/calibration'
  };
  return routes[pageName] || '/';
}

/**
 * Lightweight Google Analytics 4 helper.
 * gtag() is loaded by /public/index.html. This file just exposes
 * a clean API for SPA pageviews and custom event tracking.
 */

const isReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

/** Fire a GA4 page_view. Called from App.js on every route change. */
export const trackPageview = (path) => {
  if (!isReady()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

/**
 * Fire a custom GA4 event.
 * @param {string} name - GA4 event name (e.g. "book_call_clicked", "purchase")
 * @param {object} [params] - Extra parameters (value, currency, etc.)
 */
export const trackEvent = (name, params = {}) => {
  if (!isReady()) return;
  window.gtag('event', name, params);
};

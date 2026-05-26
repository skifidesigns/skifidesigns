/**
 * Unified analytics helper. Pushes events to BOTH Google Analytics 4
 * (gtag) and Meta Pixel (fbq). Both libs are loaded from /public/index.html.
 *
 * Naming convention: event names use GA4 conventions (snake_case). We map
 * to Meta standard events where possible so Meta's optimisation engine
 * understands the funnel.
 */

const gaReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';
const fbReady = () => typeof window !== 'undefined' && typeof window.fbq === 'function';

// GA4 event name -> Meta standard event name. Anything not mapped is sent
// to Meta as a trackCustom event so it still shows up in Events Manager.
const META_STANDARD_MAP = {
  page_view: 'PageView',
  book_call_clicked: 'Lead',          // booking a call = lead
  start_project_clicked: 'InitiateCheckout',
  purchase: 'Purchase',
  signup_google: 'CompleteRegistration',
};

/** Fire a GA4 page_view + Meta Pixel PageView. Called on every SPA route change. */
export const trackPageview = (path) => {
  if (gaReady()) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (fbReady()) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Fire a custom event in BOTH analytics platforms.
 * @param {string} name - GA4-style event name (e.g. "book_call_clicked")
 * @param {object} [params] - Extra parameters (value, currency, etc.)
 */
export const trackEvent = (name, params = {}) => {
  if (gaReady()) {
    window.gtag('event', name, params);
  }
  if (fbReady()) {
    const metaName = META_STANDARD_MAP[name];
    // Build Meta payload. Meta expects camelCase for some standard fields
    // (value, currency, content_ids, content_name).
    const metaParams = { ...params };
    if (params.value != null) metaParams.value = Number(params.value) || 0;
    if (params.currency) metaParams.currency = params.currency;

    if (metaName) {
      window.fbq('track', metaName, metaParams);
    } else {
      window.fbq('trackCustom', name, metaParams);
    }
  }
};

// Google Analytics 4 (gtag.js) Utility

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Dynamically load the Google Analytics script tag
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: Missing VITE_GA_MEASUREMENT_ID env variable. Analytics will run in simulation mode.');
    return;
  }

  // Check if already injected
  if (document.getElementById('ga-gtag-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // Pageviews will be tracked manually on route change
  });
};

// Helper to push events to gtag
const sendGAEvent = (eventName, params = {}) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, {
      send_to: GA_MEASUREMENT_ID,
      ...params,
    });
  } else {
    // Development mode simulator log
    console.debug(`[GA4 SIMULATOR] Event: "${eventName}"`, params);
  }
};

// Reusable track functions
export const trackPageView = (path) => {
  sendGAEvent('page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackEvent = (category, action, label = '', value = null, customParams = {}) => {
  sendGAEvent(action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParams,
  });
};

export const trackLogin = (userId, method = 'Google') => {
  sendGAEvent('login', {
    user_id: userId,
    method: method,
  });
};

export const trackRegister = (userId, method = 'Google') => {
  sendGAEvent('sign_up', {
    user_id: userId,
    method: method,
  });
};

export const trackReview = (action, reviewId, rating = null) => {
  sendGAEvent('review_action', {
    review_action_type: action, // 'created', 'edited', 'deleted', 'liked', 'unliked'
    review_id: reviewId,
    rating: rating,
  });
};

export const trackSearch = (query, filters = {}) => {
  sendGAEvent('search', {
    search_term: query,
    filters_applied: JSON.stringify(filters),
  });
};

export const trackError = (errorType, message) => {
  sendGAEvent('exception', {
    description: `${errorType}: ${message}`,
    fatal: errorType === 'JavaScript Error',
  });
};

export const trackUpload = (fileType, fileSize = 0) => {
  sendGAEvent('file_upload', {
    file_type: fileType, // 'image', 'proof', etc.
    file_size_kb: Math.round(fileSize / 1024),
  });
};

export const trackEventAdminAction = (actionType, details = {}) => {
  sendGAEvent('admin_action', {
    admin_action_type: actionType, // 'approve', 'ban', 'delete_listing'
    action_details: JSON.stringify(details),
  });
};

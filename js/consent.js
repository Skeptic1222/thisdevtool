(function() {
  'use strict';
  var CONSENT_KEY = 'devtoolbox-consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch(e) { return null; }
  }

  function setConsent(analytics, ads) {
    var consent = { analytics: analytics, ads: ads, timestamp: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    // Update gtag consent if available
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: ads ? 'granted' : 'denied',
        ad_personalization: ads ? 'granted' : 'denied',
        ad_user_data: ads ? 'granted' : 'denied'
      });
    }
    // Load ads if consented
    if (ads && window.DevToolboxAds && typeof window.DevToolboxAds.load === 'function') {
      window.DevToolboxAds.load();
    }
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.id = 'consentBanner';
    banner.innerHTML = '<div class="consent-inner">' +
      '<p class="consent-text">We use cookies for analytics and to improve your experience. Your data from our tools never leaves your browser.</p>' +
      '<div class="consent-buttons">' +
      '<button class="btn btn-primary btn-sm" id="consentAccept">Accept All</button>' +
      '<button class="btn btn-secondary btn-sm" id="consentReject">Essential Only</button>' +
      '<a href="/legal/privacy.html" class="consent-link">Privacy Policy</a>' +
      '</div></div>';
    document.body.appendChild(banner);

    document.getElementById('consentAccept').addEventListener('click', function() {
      setConsent(true, true);
      closeBanner();
    });
    document.getElementById('consentReject').addEventListener('click', function() {
      setConsent(false, false);
      closeBanner();
    });
  }

  function closeBanner() {
    var banner = document.getElementById('consentBanner');
    if (banner) banner.remove();
  }

  // Check consent on load
  var existing = getConsent();
  if (!existing) {
    // Set default denied state for gtag
    if (typeof gtag === 'function') {
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_personalization: 'denied',
        ad_user_data: 'denied',
        wait_for_update: 500
      });
    }
    // Show banner on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  } else {
    // Reapply previous consent
    setConsent(existing.analytics, existing.ads);
  }

  window.DevToolboxConsent = { getConsent: getConsent, setConsent: setConsent };
})();

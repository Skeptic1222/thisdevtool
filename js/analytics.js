(function() {
  'use strict';
  // GA4 Measurement ID — replace with real ID before launch
  var GA_ID = 'G-XXXXXXXXXX';

  // Define gtag before consent.js uses it
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  // Set consent defaults (denied until user accepts)
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_personalization: 'denied',
    ad_user_data: 'denied',
    wait_for_update: 500
  });

  // Configure GA4
  gtag('config', GA_ID, {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  // Load gtag.js async
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(script);
})();

(function() {
  'use strict';
  // DevToolbox Ad Loader
  // Currently a stub — populate with AdSense ad unit IDs after approval

  var AD_UNITS = {
    'top-banner': '',    // AdSense ad unit ID for top banner
    'mid-content': '',   // AdSense ad unit ID for inline content
    'sidebar': ''        // AdSense ad unit ID for sidebar
  };

  function loadAds() {
    // Check consent
    var consent = window.DevToolboxConsent ? window.DevToolboxConsent.getConsent() : null;
    if (!consent || !consent.ads) return;

    // Check if ad units are configured
    var hasUnits = Object.keys(AD_UNITS).some(function(k) { return AD_UNITS[k] !== ''; });
    if (!hasUnits) return; // No ad units configured yet

    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      document.head.appendChild(script);
    }

    // Replace placeholder ad slots with actual ad units
    document.querySelectorAll('.ad-slot[data-ad]').forEach(function(slot) {
      var adKey = slot.getAttribute('data-ad');
      var unitId = AD_UNITS[adKey];
      if (!unitId) return;

      slot.innerHTML = '';
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', ''); // Fill after AdSense approval
      ins.setAttribute('data-ad-slot', unitId);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      slot.appendChild(ins);

      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    });
  }

  window.DevToolboxAds = { load: loadAds };

  // Auto-load if consent already granted
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      var consent = window.DevToolboxConsent ? window.DevToolboxConsent.getConsent() : null;
      if (consent && consent.ads) loadAds();
    });
  } else {
    var consent = window.DevToolboxConsent ? window.DevToolboxConsent.getConsent() : null;
    if (consent && consent.ads) loadAds();
  }
})();

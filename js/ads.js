(function() {
  'use strict';
  // DevToolbox Ad Loader
  var AD_CLIENT = 'ca-pub-5845159962709002';

  var AD_UNITS = {
    'top-banner': '',    // AdSense ad unit ID for top banner
    'mid-content': '',   // AdSense ad unit ID for inline content
    'sidebar': ''        // AdSense ad unit ID for sidebar
  };

  // Always load AdSense verification script (required for site approval)
  if (AD_CLIENT && !document.querySelector('script[src*="adsbygoogle"]')) {
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT;
    document.head.appendChild(script);
  }

  function loadAds() {
    // Check if ad units are configured
    var hasUnits = Object.keys(AD_UNITS).some(function(k) { return AD_UNITS[k] !== ''; });
    if (!hasUnits) return;

    // Replace placeholder ad slots with actual ad units
    document.querySelectorAll('.ad-slot[data-ad]').forEach(function(slot) {
      var adKey = slot.getAttribute('data-ad');
      var unitId = AD_UNITS[adKey];
      if (!unitId) return;

      slot.innerHTML = '';
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', AD_CLIENT);
      ins.setAttribute('data-ad-slot', unitId);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      slot.appendChild(ins);

      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    });
  }

  window.DevToolboxAds = { load: loadAds };
})();

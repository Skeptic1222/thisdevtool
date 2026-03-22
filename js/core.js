/**
 * DevToolbox — Shared core utilities
 * Theme, ad framework, FAQ toggle, clipboard, analytics events
 */

(function () {
  'use strict';

  // --- Theme ---
  var THEME_KEY = 'devtoolbox-theme';

  function getPreferredTheme() {
    var stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply immediately to prevent flash
  applyTheme(getPreferredTheme());

  // --- FAQ Toggle ---
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // --- Global Namespace ---
  window.DevToolbox = {
    toggleTheme: toggleTheme,

    /**
     * Copy text to clipboard. Returns a Promise.
     * Shows "Copied!" feedback on the button if provided.
     */
    copyToClipboard: function (text, feedbackBtn) {
      return navigator.clipboard.writeText(text).then(function () {
        if (feedbackBtn) {
          var orig = feedbackBtn.textContent;
          feedbackBtn.textContent = 'Copied!';
          setTimeout(function () { feedbackBtn.textContent = orig; }, 1500);
        }
      });
    },

    /**
     * Download text content as a file.
     */
    downloadText: function (content, filename, mimeType) {
      mimeType = mimeType || 'text/plain';
      var blob = new Blob([content], { type: mimeType });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Read a file from an <input type="file"> as text. Returns a Promise.
     */
    readFileAsText: function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
      });
    },

    /**
     * Set text content of element by id.
     */
    setText: function (id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    },

    /**
     * Set HTML content of element by id.
     */
    setHTML: function (id, html) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = html;
    },

    /**
     * Get value of element by id.
     */
    getValue: function (id) {
      var el = document.getElementById(id);
      return el ? el.value : '';
    },

    /**
     * Set value of element by id.
     */
    setValue: function (id, val) {
      var el = document.getElementById(id);
      if (el) el.value = val;
    },

    /**
     * Show/hide element by id.
     */
    toggle: function (id, show) {
      var el = document.getElementById(id);
      if (el) el.style.display = show ? '' : 'none';
    },

    /**
     * Format bytes to human-readable size.
     */
    formatBytes: function (bytes) {
      if (bytes === 0) return '0 B';
      var units = ['B', 'KB', 'MB', 'GB'];
      var i = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
    },

    /**
     * Debounce a function (for live-as-you-type processing).
     */
    debounce: function (fn, delay) {
      var timer;
      return function () {
        var args = arguments;
        var ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
      };
    },

    /**
     * Track a tool usage event (for analytics).
     */
    trackTool: function (toolName) {
      if (typeof gtag === 'function') {
        gtag('event', 'use_tool', {
          event_category: 'tool',
          event_label: toolName
        });
      }
    }
  };

  // --- Google Analytics (GA4) ---
  // Replace G-XXXXXXXXXX with your actual GA4 Measurement ID
  var GA_ID = 'G-4676WGM9FD';
  if (GA_ID !== 'G-XXXXXXXXXX') {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  // --- Cookiebot Consent ---
  // Replace XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX with your Cookiebot ID
  var COOKIEBOT_ID = '9362730c-1d81-419b-8f5f-21130b3ab7e5';
  if (COOKIEBOT_ID !== 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX') {
    var cbScript = document.createElement('script');
    cbScript.id = 'Cookiebot';
    cbScript.src = 'https://consent.cookiebot.com/uc.js';
    cbScript.setAttribute('data-cbid', COOKIEBOT_ID);
    cbScript.type = 'text/javascript';
    cbScript.async = true;
    document.head.insertBefore(cbScript, document.head.firstChild);
  }

  // --- Init on DOM ready ---
  document.addEventListener('DOMContentLoaded', function () {
    // Theme button
    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    initFAQ();

    // Keyboard shortcut: Ctrl+Enter to reprocess
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        var chip = document.querySelector('.option-chip.active');
        if (chip) chip.click();
      }
    });
  });
})();

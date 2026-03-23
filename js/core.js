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
    },

    // --- IndexedDB Helper ---
    db: {
      _db: null,
      open: function () {
        var self = this;
        if (self._db) return Promise.resolve(self._db);
        return new Promise(function (resolve, reject) {
          var req = indexedDB.open('DevToolbox', 1);
          req.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('tool-history')) db.createObjectStore('tool-history');
            if (!db.objectStoreNames.contains('favorites')) db.createObjectStore('favorites');
            if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
          };
          req.onsuccess = function (e) { self._db = e.target.result; resolve(self._db); };
          req.onerror = function () { reject(req.error); };
        });
      },
      get: function (store, key) {
        return this.open().then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx = db.transaction(store, 'readonly');
            var req = tx.objectStore(store).get(key);
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
          });
        });
      },
      put: function (store, key, value) {
        return this.open().then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx = db.transaction(store, 'readwrite');
            var req = tx.objectStore(store).put(value, key);
            req.onsuccess = function () { resolve(); };
            req.onerror = function () { reject(req.error); };
          });
        });
      },
      delete: function (store, key) {
        return this.open().then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx = db.transaction(store, 'readwrite');
            var req = tx.objectStore(store).delete(key);
            req.onsuccess = function () { resolve(); };
            req.onerror = function () { reject(req.error); };
          });
        });
      }
    },

    // --- Web Worker Spawner ---
    runWorker: function (fn, data) {
      return new Promise(function (resolve, reject) {
        var blob = new Blob([
          'self.onmessage=function(e){var r=(' + fn.toString() + ')(e.data);self.postMessage(r);}'
        ], { type: 'application/javascript' });
        var url = URL.createObjectURL(blob);
        var worker = new Worker(url);
        worker.onmessage = function (e) {
          resolve(e.data);
          worker.terminate();
          URL.revokeObjectURL(url);
        };
        worker.onerror = function (e) {
          reject(e);
          worker.terminate();
          URL.revokeObjectURL(url);
        };
        worker.postMessage(data);
      });
    },

    // --- URL State Management ---
    getParam: function (key) {
      return new URLSearchParams(window.location.search).get(key);
    },

    setParam: function (key, value) {
      var params = new URLSearchParams(window.location.search);
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      var qs = params.toString();
      history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    },

    // --- File Drag-Drop Helper ---
    enableDragDrop: function (element, onFile, options) {
      options = options || {};
      var accept = options.accept || null;
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (evt) {
        element.addEventListener(evt, function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
      });
      element.addEventListener('dragenter', function () {
        element.classList.add('drag-active');
      });
      element.addEventListener('dragover', function () {
        element.classList.add('drag-active');
      });
      element.addEventListener('dragleave', function (e) {
        if (!element.contains(e.relatedTarget)) element.classList.remove('drag-active');
      });
      element.addEventListener('drop', function (e) {
        element.classList.remove('drag-active');
        var files = e.dataTransfer.files;
        if (files.length > 0) {
          if (accept && !files[0].type.match(accept)) {
            DevToolbox.toast('Invalid file type', 'error');
            return;
          }
          onFile(files[0]);
        }
      });
    },

    // --- Toast Notifications ---
    toast: function (message, type, duration) {
      type = type || 'info';
      duration = duration || 3000;
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
      var t = document.createElement('div');
      t.className = 'toast toast-' + type;
      t.textContent = message;
      container.appendChild(t);
      requestAnimationFrame(function () { t.classList.add('toast-show'); });
      setTimeout(function () {
        t.classList.remove('toast-show');
        setTimeout(function () { t.remove(); }, 300);
      }, duration);
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
  // Disabled until thisdevtool.com is added to Cookiebot domain group.
  // Re-enable by setting COOKIEBOT_ID to your CBID (was: 9362730c-1d81-419b-8f5f-21130b3ab7e5)
  var COOKIEBOT_ID = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
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

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    }

    // Keyboard shortcut: Ctrl+Enter to reprocess
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        var chip = document.querySelector('.option-chip.active');
        if (chip) chip.click();
      }
    });
  });
})();

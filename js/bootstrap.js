/**
 * ThisDevTool - Essential runtime fallback
 * Keeps core UI functional when consent-gated scripts are deferred.
 */

(function () {
  'use strict';

  if (window.DevToolbox && window.DevToolbox.db) return;

  var DT = window.DevToolbox || {};

  var THEME_KEY = 'devtoolbox-theme';

  function getSystemTheme() {
    try { var stored = localStorage.getItem(THEME_KEY); if (stored) return stored; } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initThemeButton() {
    var btn = document.querySelector('.theme-toggle');
    if (btn && !btn.dataset.dtBootstrapBound) {
      btn.addEventListener('click', toggleTheme);
      btn.dataset.dtBootstrapBound = '1';
    }
  }

  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      if (btn.dataset.dtBootstrapBound) return;
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var wasOpen = item && item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (item && !wasOpen) item.classList.add('open');
      });
      btn.dataset.dtBootstrapBound = '1';
    });
  }

  DT.toggleTheme = DT.toggleTheme || toggleTheme;
  DT.copyToClipboard = DT.copyToClipboard || function (text, feedbackBtn) {
    var done = function () {
      if (!feedbackBtn) return;
      var original = feedbackBtn.textContent;
      feedbackBtn.textContent = 'Copied!';
      setTimeout(function () { feedbackBtn.textContent = original; }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(done);
    }

    return new Promise(function (resolve, reject) {
      try {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        done();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  DT.downloadText = DT.downloadText || function (content, filename, mimeType) {
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
  };
  DT.readFileAsText = DT.readFileAsText || function (file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsText(file);
    });
  };
  DT.setText = DT.setText || function (id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  DT.setHTML = DT.setHTML || function (id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  DT.getValue = DT.getValue || function (id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  };
  DT.setValue = DT.setValue || function (id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value;
  };
  DT.toggle = DT.toggle || function (id, show) {
    var el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  };
  DT.formatBytes = DT.formatBytes || function (bytes) {
    if (bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var index = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, index)).toFixed(index > 0 ? 1 : 0) + ' ' + units[index];
  };
  DT.debounce = DT.debounce || function (fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  };
  DT.trackTool = DT.trackTool || function (toolName) {
    if (typeof gtag === 'function') {
      gtag('event', 'use_tool', {
        event_category: 'tool',
        event_label: toolName
      });
    }
  };
  DT.getParam = DT.getParam || function (key) {
    return new URLSearchParams(window.location.search).get(key);
  };
  DT.setParam = DT.setParam || function (key, value) {
    var params = new URLSearchParams(window.location.search);
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    var query = params.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  };
  DT.toast = DT.toast || function (message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('toast-show'); });
    setTimeout(function () {
      toast.classList.remove('toast-show');
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);
  };

  window.DevToolbox = DT;
  applyTheme(document.documentElement.getAttribute('data-theme') || getSystemTheme());

  function init() {
    if (window.DevToolbox && window.DevToolbox.db) return;
    initThemeButton();
    initFAQ();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

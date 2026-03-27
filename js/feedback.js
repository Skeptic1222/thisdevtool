/**
 * ThisDevTool — Feedback Widget
 * Self-contained IIFE. Injects a rating + request widget on every tool page.
 * No dependencies. Communicates via GA4 (gtag). Stores cooldown in localStorage.
 */

(function () {
  'use strict';

  function ensureEssentialRuntime() {
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

    function initBootstrapUI() {
      if (window.DevToolbox && window.DevToolbox.db) return;
      initThemeButton();
      initFAQ();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBootstrapUI);
    } else {
      initBootstrapUI();
    }
  }

  ensureEssentialRuntime();

  // --- Detect tool name ---
  function getToolName() {
    var widget = document.querySelector('.feedback-widget');
    if (widget && widget.dataset.toolName) return widget.dataset.toolName;
    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    var base = window.location.pathname.split('/').pop();
    return base.replace(/\.html?$/i, '') || 'unknown';
  }

  // --- Confetti ---
  function fireConfetti(anchorEl) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var rect = anchorEl.getBoundingClientRect();
    var canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:' + rect.width + 'px',
      'height:' + rect.height + 'px',
      'pointer-events:none',
      'z-index:999'
    ].join(';');
    anchorEl.style.position = 'relative';
    anchorEl.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var colors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];
    var particles = [];

    for (var i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.4 + Math.random() * canvas.height * 0.2,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: -3 - Math.random() * 5,
        alpha: 1
      });
    }

    var frame = 0;
    var maxFrames = 80;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.99;
        p.alpha = Math.max(0, 1 - frame / maxFrames);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }

    requestAnimationFrame(draw);
  }

  // --- Build DOM ---
  function createElement(tag, className, attrs) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  function buildWidget() {
    var widget = createElement('div', 'feedback-widget');

    // Header
    var header = createElement('div', 'feedback-header');
    header.textContent = '\uD83D\uDCAC Was this tool helpful?';
    widget.appendChild(header);

    // Reactions row
    var reactions = createElement('div', 'feedback-reactions');

    var reactionData = [
      { rating: '1', emoji: '\uD83D\uDE1E', label: 'Not helpful' },
      { rating: '2', emoji: '\uD83D\uDE10', label: "It's okay" },
      { rating: '3', emoji: '\uD83D\uDE04', label: 'Love it!' }
    ];

    reactionData.forEach(function (rd) {
      var btn = createElement('button', 'reaction-btn');
      btn.setAttribute('data-rating', rd.rating);
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', rd.label);

      var emojiSpan = createElement('span', 'reaction-emoji');
      emojiSpan.textContent = rd.emoji;

      var labelSpan = createElement('span', 'reaction-label');
      labelSpan.textContent = rd.label;

      btn.appendChild(emojiSpan);
      btn.appendChild(labelSpan);
      reactions.appendChild(btn);
    });

    widget.appendChild(reactions);

    // Cooldown message (hidden)
    var cooldownMsg = createElement('div', 'feedback-cooldown-msg');
    cooldownMsg.style.display = 'none';
    widget.appendChild(cooldownMsg);

    // Comment section (hidden, slides down)
    var commentSection = createElement('div', 'feedback-comment');

    var textarea = createElement('textarea', 'feedback-textarea');
    textarea.setAttribute('placeholder', 'Tell us more (optional)...');
    textarea.setAttribute('maxlength', '500');
    textarea.setAttribute('rows', '2');
    textarea.setAttribute('aria-label', 'Feedback comment');

    var sendBtn = createElement('button', 'btn btn-primary');
    sendBtn.setAttribute('type', 'button');
    sendBtn.textContent = 'Send Feedback';

    commentSection.appendChild(textarea);
    commentSection.appendChild(sendBtn);
    widget.appendChild(commentSection);

    // Thank-you (hidden)
    var thankyou = createElement('div', 'feedback-thankyou');
    thankyou.style.display = 'none';
    var checkSpan = createElement('span', 'thankyou-check');
    checkSpan.textContent = '\u2713';
    thankyou.appendChild(checkSpan);
    thankyou.appendChild(document.createTextNode(' Thanks for your feedback!'));
    widget.appendChild(thankyou);

    // Divider
    var divider = createElement('hr', 'feedback-divider');
    widget.appendChild(divider);

    // Request toggle
    var requestToggle = createElement('div', 'feedback-request-toggle');
    var requestToggleBtn = createElement('button', 'feedback-request-btn');
    requestToggleBtn.setAttribute('type', 'button');
    requestToggleBtn.textContent = '\uD83D\uDCA1 Request a tool';
    requestToggle.appendChild(requestToggleBtn);
    widget.appendChild(requestToggle);

    // Request section (hidden)
    var requestSection = createElement('div', 'feedback-request');
    requestSection.style.display = 'none';

    var requestTextarea = createElement('textarea', 'feedback-textarea');
    requestTextarea.setAttribute('placeholder', 'What tool would you like to see?');
    requestTextarea.setAttribute('maxlength', '500');
    requestTextarea.setAttribute('rows', '2');
    requestTextarea.setAttribute('aria-label', 'Tool request');

    var submitBtn = createElement('button', 'btn btn-primary');
    submitBtn.setAttribute('type', 'button');
    submitBtn.textContent = 'Submit Request';

    requestSection.appendChild(requestTextarea);
    requestSection.appendChild(submitBtn);
    widget.appendChild(requestSection);

    // Request thank-you (hidden)
    var requestThankyou = createElement('div', 'feedback-request-thankyou');
    requestThankyou.style.display = 'none';
    var requestCheckSpan = createElement('span', 'thankyou-check');
    requestCheckSpan.textContent = '\u2713';
    requestThankyou.appendChild(requestCheckSpan);
    requestThankyou.appendChild(document.createTextNode(" Request submitted! We'll consider it."));
    widget.appendChild(requestThankyou);

    // Privacy note
    var privacyNote = createElement('p', 'privacy-note');
    privacyNote.style.cssText = 'font-size:0.75rem;color:var(--text-secondary);text-align:center;margin-top:0.5rem;';
    privacyNote.textContent = 'All processing happens in your browser. Your data never leaves your device.';
    widget.appendChild(privacyNote);

    return {
      widget: widget,
      reactions: reactions,
      cooldownMsg: cooldownMsg,
      commentSection: commentSection,
      textarea: textarea,
      sendBtn: sendBtn,
      thankyou: thankyou,
      divider: divider,
      requestToggleBtn: requestToggleBtn,
      requestSection: requestSection,
      requestTextarea: requestTextarea,
      submitBtn: submitBtn,
      requestThankyou: requestThankyou
    };
  }

  // --- Portal submission ---
  function sendToPortal(payload) {
    try {
      var url = 'https://portal.ayitcreativity.com/portal/api/v1/feedback';
      var body = JSON.stringify(Object.assign({ site: 'thisdevtool' }, payload));
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function() {});
      }
    } catch (e) { /* silent */ }
  }

  // --- Wire up events ---
  function initWidget(els) {
    var toolName = getToolName();
    var COOLDOWN_KEY = 'dt-feedback-' + toolName;
    var COOLDOWN_MS = 24 * 60 * 60 * 1000;
    var selectedRating = null;
    var autoSendTimer = null;

    function fireFeedbackGA(rating, comment) {
      if (typeof gtag === 'function') {
        gtag('event', 'tool_rating', {
          tool_name: toolName,
          rating: rating,
          comment: comment || '',
          page_path: window.location.pathname
        });
      }
    }

    function sendFeedback(comment) {
      if (selectedRating === null) return;
      clearTimeout(autoSendTimer);
      fireFeedbackGA(selectedRating, comment);
      sendToPortal({
        type: 'rating',
        tool_name: toolName,
        rating: selectedRating,
        comment: comment || '',
        page_path: window.location.pathname
      });
      localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
      els.reactions.style.display = 'none';
      els.cooldownMsg.style.display = 'none';
      els.commentSection.classList.remove('open');
      els.commentSection.style.display = 'none';
      els.thankyou.style.display = '';
    }

    // Reaction button click
    els.reactions.addEventListener('click', function (e) {
      var btn = e.target.closest('.reaction-btn');
      if (!btn) return;

      var lastRated = localStorage.getItem(COOLDOWN_KEY);
      if (lastRated && (Date.now() - parseInt(lastRated, 10)) < COOLDOWN_MS) {
        els.reactions.querySelectorAll('.reaction-btn').forEach(function (b) {
          b.classList.add('cooldown');
        });
        els.cooldownMsg.textContent = 'You already rated this \u2014 thanks!';
        els.cooldownMsg.style.display = '';
        return;
      }

      selectedRating = parseInt(btn.getAttribute('data-rating'), 10);

      els.reactions.querySelectorAll('.reaction-btn').forEach(function (b) {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');

      els.commentSection.style.display = '';
      void els.commentSection.offsetHeight;
      els.commentSection.classList.add('open');

      if (selectedRating === 3) {
        fireConfetti(els.widget);
      }

      clearTimeout(autoSendTimer);
      autoSendTimer = setTimeout(function () {
        sendFeedback('');
      }, 5000);
    });

    // Manual send
    els.sendBtn.addEventListener('click', function () {
      sendFeedback(els.textarea.value.trim());
    });

    // Request toggle
    els.requestToggleBtn.addEventListener('click', function () {
      var isOpen = els.requestSection.style.display !== 'none';
      els.requestSection.style.display = isOpen ? 'none' : '';
      if (!isOpen) {
        els.requestTextarea.focus();
      }
    });

    // Submit request
    els.submitBtn.addEventListener('click', function () {
      var text = els.requestTextarea.value.trim();
      if (text.length < 5) {
        els.requestTextarea.focus();
        return;
      }
      if (typeof gtag === 'function') {
        gtag('event', 'tool_request', {
          request_text: text,
          page_path: window.location.pathname
        });
      }
      sendToPortal({
        type: 'feature_request',
        tool_name: toolName,
        request_text: text,
        page_path: window.location.pathname
      });
      els.requestSection.style.display = 'none';
      els.requestThankyou.style.display = '';
      setTimeout(function () {
        els.requestThankyou.style.display = 'none';
      }, 3000);
    });
  }

  // --- Bootstrap ---
  function init() {
    // Guards: only run on tool pages (deferred to init so DOM is ready)
    var hasToolContainer = document.querySelector('.tool-container') || document.querySelector('.split-pane') || document.querySelector('.tool-card-page');
    if (!hasToolContainer) return;

    var existingWidget = document.querySelector('.feedback-widget');

    if (existingWidget) {
      var els = buildWidget();
      while (els.widget.firstChild) {
        existingWidget.appendChild(els.widget.firstChild);
      }
      var domEls = {
        widget: existingWidget,
        reactions: existingWidget.querySelector('.feedback-reactions'),
        cooldownMsg: existingWidget.querySelector('.feedback-cooldown-msg'),
        commentSection: existingWidget.querySelector('.feedback-comment'),
        textarea: existingWidget.querySelectorAll('.feedback-textarea')[0],
        sendBtn: existingWidget.querySelector('.feedback-comment .btn'),
        thankyou: existingWidget.querySelector('.feedback-thankyou'),
        divider: existingWidget.querySelector('.feedback-divider'),
        requestToggleBtn: existingWidget.querySelector('.feedback-request-btn'),
        requestSection: existingWidget.querySelector('.feedback-request'),
        requestTextarea: existingWidget.querySelectorAll('.feedback-textarea')[1],
        submitBtn: existingWidget.querySelector('.feedback-request .btn'),
        requestThankyou: existingWidget.querySelector('.feedback-request-thankyou')
      };
      initWidget(domEls);
    } else {
      var adSlot = document.querySelector('.ad-slot-inline');
      if (!adSlot) return;
      var els = buildWidget();
      adSlot.parentNode.insertBefore(els.widget, adSlot);
      initWidget(els);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

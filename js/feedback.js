/**
 * ThisDevTool — Feedback Widget
 * Self-contained IIFE. Injects a rating + request widget on every tool page.
 * No dependencies. Communicates via GA4 (gtag). Stores cooldown in localStorage.
 */

(function () {
  'use strict';

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

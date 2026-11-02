(function () {
  'use strict';
  try {
    var padInfo = null;
    var activePadIndex = null;
    var prevButtons = [];
    var currentFocus = null;

    var initialDelay = 380;
    var repeatInterval = 130;
    var dirTimer = null;
    var dirInterval = null;
    var activeDir = null;

    var toastTimeout = null;

    function injectCSS() {
      if (document.getElementById('rbx-pad-css')) return;
      var style = document.createElement('style');
      style.id = 'rbx-pad-css';
      style.type = 'text/css';
      var css = '.pad-focus { outline: 4px solid #fbbf24 !important; outline-offset: 2px !important; box-shadow: 0 0 18px #fbbf24 !important; border-radius: 4px; }\n' +
        '#rbx-pad-toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 10px 22px; border-radius: 30px; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 600; border: 1.5px solid #fbbf24; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); z-index: 2147483647; transition: opacity 0.3s ease, transform 0.3s ease; opacity: 0; pointer-events: none; }\n' +
        '#rbx-pad-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }\n' +
        '#rbx-pad-badge { position: fixed; bottom: 14px; left: 14px; background: rgba(15, 23, 42, 0.88); color: #cbd5e1; padding: 6px 14px; border-radius: 20px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 500; border: 1px solid rgba(251, 191, 36, 0.5); z-index: 2147483646; pointer-events: none; display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }\n' +
        '#rbx-pad-badge span.name { color: #fbbf24; font-weight: 700; margin-right: 6px; }\n' +
        '#rbx-pad-badge span.tips { color: #94a3b8; font-size: 11px; }';
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      (document.head || document.documentElement).appendChild(style);
    }

    function createUI() {
      injectCSS();
      if (!document.getElementById('rbx-pad-toast')) {
        var toast = document.createElement('div');
        toast.id = 'rbx-pad-toast';
        (document.body || document.documentElement).appendChild(toast);
      }
      if (!document.getElementById('rbx-pad-badge')) {
        var badge = document.createElement('div');
        badge.id = 'rbx-pad-badge';
        (document.body || document.documentElement).appendChild(badge);
      }
    }

    function detectType(id) {
      if (!id) return { tipo: 'generico', nome: 'Genérico', tips: 'A confirmar • B voltar' };
      var s = id.toLowerCase();
      if (s.indexOf('xbox') !== -1 || s.indexOf('xinput') !== -1 || s.indexOf('045e') !== -1) {
        return { tipo: 'xbox', nome: 'Xbox', tips: 'A confirmar • B voltar' };
      }
      if (s.indexOf('playstation') !== -1 || s.indexOf('dualshock') !== -1 || s.indexOf('dualsense') !== -1 || s.indexOf('054c') !== -1) {
        return { tipo: 'ps', nome: 'PlayStation', tips: '✕ confirmar • ○ voltar' };
      }
      if (s.indexOf('nintendo') !== -1 || s.indexOf('switch') !== -1 || s.indexOf('057e') !== -1) {
        return { tipo: 'switch', nome: 'Nintendo Switch', tips: 'B confirmar • A voltar' };
      }
      if (s.indexOf('8bitdo') !== -1) {
        return { tipo: 'generico', nome: '8BitDo', tips: 'A confirmar • B voltar' };
      }
      return { tipo: 'generico', nome: 'Genérico', tips: 'A confirmar • B voltar' };
    }

    function showToast(msg) {
      createUI();
      var toast = document.getElementById('rbx-pad-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.className = 'show';
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function () {
        toast.className = '';
      }, 4000);
    }

    function updateBadge(info) {
      createUI();
      var badge = document.getElementById('rbx-pad-badge');
      if (!badge) return;
      if (!info) {
        badge.style.display = 'none';
        return;
      }
      badge.innerHTML = '<span class="name">🎮 ' + info.nome + '</span><span class="tips">(' + info.tips + ')</span>';
      badge.style.display = 'block';
    }

    function setGamepad(gp) {
      if (!gp) {
        if (window.RBX_PAD) {
          window.RBX_PAD = null;
          showToast('Controle desconectado');
          updateBadge(null);
          clearFocus();
        }
        padInfo = null;
        activePadIndex = null;
        return;
      }

      var detected = detectType(gp.id);
      padInfo = {
        tipo: detected.tipo,
        nome: detected.nome,
        tips: detected.tips,
        rawId: gp.id
      };
      window.RBX_PAD = {
        tipo: padInfo.tipo,
        nome: padInfo.nome
      };
      activePadIndex = gp.index;
      showToast('🎮 Controle ' + padInfo.nome + ' conectado');
      updateBadge(padInfo);
    }

    function getActiveGamepad() {
      var gps = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
      if (!gps) return null;
      if (activePadIndex !== null && gps[activePadIndex]) {
        return gps[activePadIndex];
      }
      for (var i = 0; i < gps.length; i++) {
        if (gps[i]) return gps[i];
      }
      return null;
    }

    function isElementVisible(el) {
      if (!el || !el.getBoundingClientRect) return false;
      var rect = el.getBoundingClientRect();
      if (rect.width <= 4 || rect.height <= 4) return false;
      var style = window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
      if (!style) return false;
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      var vw = window.innerWidth || document.documentElement.clientWidth;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.right < -50 || rect.bottom < -50 || rect.left > vw + 50 || rect.top > vh + 50) return false;
      return true;
    }

    function getActiveOverlay() {
      var vw = window.innerWidth || document.documentElement.clientWidth;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var screenArea = vw * vh;

      var modals = document.querySelectorAll('#modal, .modal, dialog[open], [role="dialog"]');
      for (var i = modals.length - 1; i >= 0; i--) {
        if (isElementVisible(modals[i])) return modals[i];
      }

      var allElements = document.querySelectorAll('div, section, article, main, aside, header');
      var topOverlay = null;
      var maxZ = -1;

      for (var j = 0; j < allElements.length; j++) {
        var el = allElements[j];
        if (!isElementVisible(el)) continue;
        var style = window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
        if (style && (style.position === 'fixed' || style.position === 'absolute')) {
          var z = parseInt(style.zIndex, 10);
          if (isNaN(z)) z = 0;
          var rect = el.getBoundingClientRect();
          var area = rect.width * rect.height;
          if (area > screenArea * 0.4 && z > maxZ) {
            maxZ = z;
            topOverlay = el;
          }
        }
      }
      return topOverlay;
    }

    function isGameActive() {
      var canvasFixed = document.querySelectorAll('div, section, main, header, container');
      for (var i = 0; i < canvasFixed.length; i++) {
        var el = canvasFixed[i];
        if (isElementVisible(el)) {
          var style = window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
          if (style && style.position === 'fixed' && style.zIndex === '2147483000') {
            if (el.querySelector('canvas')) return true;
          }
        }
      }

      if ((window.RBX_RUN ? window.RBX_RUN() : window.run) === true) {
        var overlay = getActiveOverlay();
        if (!overlay) return true;
      }

      return false;
    }

    function getCandidates() {
      var selector = 'button, a[href], input, select, textarea, summary, [onclick], [role="button"], [tabindex]:not([tabindex="-1"])';
      var container = getActiveOverlay() || document;
      var raw = container.querySelectorAll(selector);
      var candidates = [];
      for (var i = 0; i < raw.length; i++) {
        if (isElementVisible(raw[i])) {
          candidates.push(raw[i]);
        }
      }
      return candidates;
    }

    function setFocus(el) {
      if (currentFocus && currentFocus !== el) {
        var oldClass = currentFocus.className || '';
        currentFocus.className = oldClass.replace(/\bpad-focus\b/g, '').trim();
      }
      currentFocus = el;
      if (el) {
        if (!/\bpad-focus\b/.test(el.className || '')) {
          el.className = ((el.className || '') + ' pad-focus').trim();
        }
        if (el.scrollIntoView) {
          try {
            el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } catch (err) {
            el.scrollIntoView(false);
          }
        }
      }
    }

    function clearFocus() {
      if (currentFocus) {
        currentFocus.className = (currentFocus.className || '').replace(/\bpad-focus\b/g, '').trim();
        currentFocus = null;
      }
    }

    function moveFocus(dir) {
      var candidates = getCandidates();
      if (candidates.length === 0) {
        clearFocus();
        return;
      }

      if (!currentFocus || !document.body.contains(currentFocus) || !isElementVisible(currentFocus)) {
        var bestFirst = candidates[0];
        var bestDist = Infinity;
        var vw = (window.innerWidth || document.documentElement.clientWidth) / 2;
        var vh = (window.innerHeight || document.documentElement.clientHeight) / 3;
        for (var c = 0; c < candidates.length; c++) {
          var rFirst = candidates[c].getBoundingClientRect();
          var cxFirst = rFirst.left + rFirst.width / 2;
          var cyFirst = rFirst.top + rFirst.height / 2;
          var dFirst = Math.pow(cxFirst - vw, 2) + Math.pow(cyFirst - vh, 2);
          if (dFirst < bestDist) {
            bestDist = dFirst;
            bestFirst = candidates[c];
          }
        }
        setFocus(bestFirst);
        return;
      }

      var curRect = currentFocus.getBoundingClientRect();
      var curX = curRect.left + curRect.width / 2;
      var curY = curRect.top + curRect.height / 2;

      var bestCandidate = null;
      var minScore = Infinity;

      for (var i = 0; i < candidates.length; i++) {
        var cand = candidates[i];
        if (cand === currentFocus) continue;

        var r = cand.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;

        var dx = cx - curX;
        var dy = cy - curY;

        var primary = 0;
        var secondary = 0;
        var valid = false;

        if (dir === 'up') {
          if (dy < -2) { primary = -dy; secondary = Math.abs(dx); valid = true; }
        } else if (dir === 'down') {
          if (dy > 2) { primary = dy; secondary = Math.abs(dx); valid = true; }
        } else if (dir === 'left') {
          if (dx < -2) { primary = -dx; secondary = Math.abs(dy); valid = true; }
        } else if (dir === 'right') {
          if (dx > 2) { primary = dx; secondary = Math.abs(dy); valid = true; }
        }

        if (valid) {
          var score = primary + secondary * 2.5;
          if (score < minScore) {
            minScore = score;
            bestCandidate = cand;
          }
        }
      }

      if (bestCandidate) {
        setFocus(bestCandidate);
      }
    }

    function startAutoRepeat(dir) {
      if (activeDir === dir) return;
      stopAutoRepeat();
      activeDir = dir;
      moveFocus(dir);
      dirTimer = setTimeout(function () {
        dirInterval = setInterval(function () {
          moveFocus(dir);
        }, repeatInterval);
      }, initialDelay);
    }

    function stopAutoRepeat() {
      if (dirTimer) clearTimeout(dirTimer);
      if (dirInterval) clearInterval(dirInterval);
      dirTimer = null;
      dirInterval = null;
      activeDir = null;
    }

    function handleConfirm() {
      if (!currentFocus) return;
      var tag = currentFocus.tagName.toLowerCase();
      var type = (currentFocus.type || '').toLowerCase();
      if (tag === 'input' && (type === 'text' || type === 'number' || type === 'search' || type === 'password' || type === 'email' || type === 'tel')) {
        currentFocus.focus();
      } else {
        currentFocus.click();
      }
    }

    function handleBack() {
      var closeSelectors = [
        '[data-close]',
        '.close',
        '.fechar',
        '[aria-label*="echar" i]',
        '[aria-label*="oltar" i]'
      ];

      for (var i = 0; i < closeSelectors.length; i++) {
        var el = document.querySelector(closeSelectors[i]);
        if (el && isElementVisible(el)) {
          el.click();
          return;
        }
      }

      var buttons = document.querySelectorAll('button, a, div[role="button"]');
      for (var j = 0; j < buttons.length; j++) {
        var b = buttons[j];
        if (!isElementVisible(b)) continue;
        var txt = (b.textContent || b.innerText || '').trim();
        if (txt === '×' || txt === '✕' || txt === 'X' || txt === 'Fechar' || txt === 'Voltar' || txt === 'Sair') {
          b.click();
          return;
        }
      }

      try {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('keydown', true, true);
        evt.keyCode = 27;
        evt.which = 27;
        document.dispatchEvent(evt);
      } catch (e) {}
    }

    function handleSearch() {
      var searchEl = document.querySelector('input[type="search"], #q, input[placeholder*="usca" i], input[placeholder*="esquisa" i]');
      if (searchEl && isElementVisible(searchEl)) {
        setFocus(searchEl);
        searchEl.focus();
      }
    }

    function handleTabSwitch(dir) {
      var tabContainers = document.querySelectorAll('#mb, .tabs, [role="tablist"]');
      var container = null;
      for (var i = 0; i < tabContainers.length; i++) {
        if (isElementVisible(tabContainers[i])) {
          container = tabContainers[i];
          break;
        }
      }
      if (!container) container = document.querySelector('#mb') || document;

      var tabs = container.querySelectorAll('button, a, [role="tab"], .tab');
      var visibleTabs = [];
      var activeIndex = -1;

      for (var j = 0; j < tabs.length; j++) {
        if (isElementVisible(tabs[j])) {
          visibleTabs.push(tabs[j]);
          var cls = tabs[j].className || '';
          var isSel = tabs[j].getAttribute('aria-selected') === 'true';
          if (/\b(on|active|selected)\b/.test(cls) || isSel) {
            activeIndex = visibleTabs.length - 1;
          }
        }
      }

      if (visibleTabs.length === 0) return;

      var nextIndex = 0;
      if (dir === 'prev') {
        nextIndex = activeIndex > 0 ? activeIndex - 1 : visibleTabs.length - 1;
      } else {
        nextIndex = activeIndex < visibleTabs.length - 1 ? activeIndex + 1 : 0;
      }

      visibleTabs[nextIndex].click();
      setFocus(visibleTabs[nextIndex]);
    }

    function handleHome() {
      var homeBtn = document.getElementById('bHome');
      if (homeBtn && isElementVisible(homeBtn)) {
        homeBtn.click();
      }
    }

    function getScrollContainer(el) {
      var cur = el ? el.parentElement : null;
      while (cur && cur !== document.body && cur !== document.documentElement) {
        var style = window.getComputedStyle(cur);
        var overflowY = style.overflowY || style.overflow || '';
        if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) {
          return cur;
        }
        cur = cur.parentElement;
      }
      return window;
    }

    function handleRightStickScroll(axisY) {
      if (Math.abs(axisY) < 0.25) return;
      var delta = axisY * 16;
      var scrollTarget = getScrollContainer(currentFocus);
      if (scrollTarget === window) {
        window.scrollBy(0, delta);
      } else {
        scrollTarget.scrollTop += delta;
      }
    }

    function pollGamepad() {
      try {
        var gp = getActiveGamepad();

        if (!gp) {
          if (padInfo) setGamepad(null);
          requestAnimationFrame(pollGamepad);
          return;
        }

        if (!padInfo || padInfo.rawId !== gp.id) {
          setGamepad(gp);
        }

        if (isGameActive()) {
          stopAutoRepeat();
          requestAnimationFrame(pollGamepad);
          return;
        }

        var buttons = gp.buttons || [];
        var axes = gp.axes || [];

        var isPressed = function (idx) {
          if (!buttons[idx]) return false;
          return typeof buttons[idx] === 'object' ? buttons[idx].pressed : buttons[idx] === 1.0;
        };

        var b0 = isPressed(0);
        var b1 = isPressed(1);
        var b3 = isPressed(3);
        var b4 = isPressed(4);
        var b5 = isPressed(5);
        var b9 = isPressed(9);

        var dUp = isPressed(12);
        var dDown = isPressed(13);
        var dLeft = isPressed(14);
        var dRight = isPressed(15);

        var ax0 = axes[0] || 0;
        var ax1 = axes[1] || 0;
        var deadzone = 0.5;

        var aLeft = ax0 < -deadzone;
        var aRight = ax0 > deadzone;
        var aUp = ax1 < -deadzone;
        var aDown = ax1 > deadzone;

        var goUp = dUp || aUp;
        var goDown = dDown || aDown;
        var goLeft = dLeft || aLeft;
        var goRight = dRight || aRight;

        if (goUp) startAutoRepeat('up');
        else if (goDown) startAutoRepeat('down');
        else if (goLeft) startAutoRepeat('left');
        else if (goRight) startAutoRepeat('right');
        else stopAutoRepeat();

        if (b0 && !prevButtons[0]) handleConfirm();
        if (b1 && !prevButtons[1]) handleBack();
        if (b3 && !prevButtons[3]) handleSearch();
        if (b4 && !prevButtons[4]) handleTabSwitch('prev');
        if (b5 && !prevButtons[5]) handleTabSwitch('next');
        if (b9 && !prevButtons[9]) handleHome();

        var rightStickY = axes[3] !== undefined ? axes[3] : (axes[2] !== undefined ? axes[2] : 0);
        handleRightStickScroll(rightStickY);

        prevButtons = [];
        for (var i = 0; i < buttons.length; i++) {
          prevButtons[i] = isPressed(i);
        }

        if (currentFocus && (!document.body.contains(currentFocus) || !isElementVisible(currentFocus))) {
          clearFocus();
          moveFocus('down');
        }

      } catch (e) {}

      requestAnimationFrame(pollGamepad);
    }

    window.addEventListener('gamepadconnected', function (e) {
      try {
        setGamepad(e.gamepad);
      } catch (err) {}
    });

    window.addEventListener('gamepaddisconnected', function (e) {
      try {
        if (activePadIndex === e.gamepad.index) {
          setGamepad(null);
        }
      } catch (err) {}
    });

    setInterval(function () {
      try {
        if (!padInfo) {
          var gp = getActiveGamepad();
          if (gp) setGamepad(gp);
        }
      } catch (e) {}
    }, 1000);

    createUI();
    requestAnimationFrame(pollGamepad);

  } catch (globalErr) {}
})();
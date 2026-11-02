(function () {
  'use strict';

  function norm(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function injectCSS() {
    if (document.getElementById('banco-apps-css')) return;
    var css = '' +
      '#phone .appbar{display:flex;gap:6px;padding:4px 8px 6px;width:100%;box-sizing:border-box;z-index:5}' +
      '#phone .appbar button{border:none;border-radius:18px;font-size:11px;padding:6px 10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;background:rgba(255,255,255,0.22);color:#fff;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font-family:inherit}' +
      '#phone .lnc.ios .appbar button{background:rgba(0,0,0,0.07);color:#000}' +
      '#phone .appbar .btn-srch{flex:1;justify-content:flex-start}' +
      '#phone .appbar .btn-all{flex:0 0 auto;font-weight:600}' +
      '#phone-app-overlay{position:absolute;inset:0;z-index:99999;display:flex;flex-direction:column;padding:12px;box-sizing:border-box;overflow:hidden;font-family:sans-serif}' +
      '#phone-app-overlay.and{background:rgba(18,18,18,0.88);color:#f0f0f0;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}' +
      '#phone-app-overlay.ios{background:rgba(245,245,247,0.92);color:#111;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}' +
      '#phone-app-overlay .ov-top{display:flex;gap:8px;align-items:center;margin-bottom:8px}' +
      '#phone-app-overlay .ov-inp{flex:1;height:34px;border-radius:12px;border:1px solid rgba(128,128,128,0.3);padding:0 10px;font-size:13px;outline:none;background:rgba(255,255,255,0.15);color:inherit;box-sizing:border-box}' +
      '#phone-app-overlay.ios .ov-inp{background:#fff;border-color:rgba(0,0,0,0.15);color:#000}' +
      '#phone-app-overlay .ov-close{background:none;border:none;font-size:18px;cursor:pointer;color:inherit;padding:4px 6px;line-height:1}' +
      '#phone-app-overlay .ov-body{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:12px}' +
      '#phone-app-overlay .ov-empty{text-align:center;padding:30px 10px;opacity:.6;font-size:13px}' +
      '#phone-app-overlay .ov-sec{font-size:11px;font-weight:700;opacity:.65;margin:10px 0 4px;padding-left:4px;border-bottom:1px solid rgba(128,128,128,0.2)}' +
      '#phone-app-overlay .ov-list{display:flex;flex-direction:column;gap:3px}' +
      '#phone-app-overlay .ov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}' +
      '@media (max-width:270px){#phone-app-overlay .ov-grid{grid-template-columns:repeat(3,1fr)}}' +
      '#phone-app-overlay .ov-item{background:none;border:none;color:inherit;cursor:pointer;display:flex;align-items:center;padding:6px;border-radius:8px;position:relative;font-family:inherit}' +
      '#phone-app-overlay .ov-item:focus,#phone-app-overlay .ov-item:hover{background:rgba(128,128,128,0.22);outline:none}' +
      '#phone-app-overlay .ov-list .ov-item{width:100%;flex-direction:row;gap:10px;text-align:left}' +
      '#phone-app-overlay .ov-grid .ov-item{flex-direction:column;gap:4px;text-align:center}' +
      '#phone-app-overlay .ov-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:1}' +
      '#phone-app-overlay .ov-grid .ov-icon{font-size:26px}' +
      '#phone-app-overlay .ov-name{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}' +
      '#phone-app-overlay .ov-grid .ov-name{font-size:10px;max-width:65px}' +
      '#phone-app-overlay .bdg{position:absolute;top:-3px;right:-7px;font-size:9px;background:#ff3b30;color:#fff;border-radius:10px;padding:1px 4px;font-weight:700;line-height:1.2}';
    var st = document.createElement('style');
    st.id = 'banco-apps-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  var currentMode = 'busca';
  var overlayEl = null;

  function collectApps(phone) {
    var buttons = phone.querySelectorAll('.lnc button[data-l], .wlnc button[data-l]');
    var map = {};
    var list = [];
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var key = btn.getAttribute('data-l');
      if (!key || map[key]) continue;
      map[key] = true;
      var em = btn.querySelector('em');
      var name = em ? em.textContent.trim() : btn.textContent.trim();
      var icon = btn.querySelector('.bi') || btn.querySelector('span') || btn.querySelector('svg');
      var iconHtml = icon ? icon.outerHTML : '<span class="bi bi-app"></span>';
      var bdg = btn.querySelector('.bdg');
      var bdgHtml = bdg ? bdg.outerHTML : '';
      list.push({ key: key, name: name, iconHtml: iconHtml, bdgHtml: bdgHtml });
    }
    return list;
  }

  function launchApp(key) {
    closeOverlay();
    var phone = document.getElementById('phone');
    if (!phone) return;
    var btn = phone.querySelector('button[data-l="' + key + '"]');
    if (btn) btn.click();
  }

  function renderOverlay(filterText) {
    if (!overlayEl) return;
    var phone = document.getElementById('phone');
    var apps = collectApps(phone);
    var q = norm(filterText);
    var body = overlayEl.querySelector('.ov-body');
    body.innerHTML = '';

    if (currentMode === 'busca') {
      var results = apps.filter(function (a) {
        return norm(a.name).indexOf(q) !== -1;
      });
      if (!results.length) {
        body.innerHTML = '<div class="ov-empty">Nenhum aplicativo encontrado</div>';
        return;
      }
      var listWrap = document.createElement('div');
      listWrap.className = 'ov-list';
      results.forEach(function (app) {
        var it = document.createElement('button');
        it.className = 'ov-item';
        it.setAttribute('data-target-l', app.key);
        it.innerHTML = '<div class="ov-icon">' + app.iconHtml + app.bdgHtml + '</div><span class="ov-name">' + app.name + '</span>';
        listWrap.appendChild(it);
      });
      body.appendChild(listWrap);
    } else {
      var filtered = apps.filter(function (a) {
        return !q || norm(a.name).indexOf(q) !== -1;
      });
      filtered.sort(function (a, b) {
        return a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' });
      });
      if (!filtered.length) {
        body.innerHTML = '<div class="ov-empty">Nenhum aplicativo encontrado</div>';
        return;
      }
      var groups = {};
      filtered.forEach(function (app) {
        var c = norm(app.name).charAt(0).toUpperCase() || '#';
        if (!groups[c]) groups[c] = [];
        groups[c].push(app);
      });
      var keys = Object.keys(groups).sort();
      keys.forEach(function (k) {
        var sec = document.createElement('div');
        sec.className = 'ov-sec';
        sec.textContent = k;
        body.appendChild(sec);
        var grid = document.createElement('div');
        grid.className = 'ov-grid';
        groups[k].forEach(function (app) {
          var it = document.createElement('button');
          it.className = 'ov-item';
          it.setAttribute('data-target-l', app.key);
          it.innerHTML = '<div class="ov-icon">' + app.iconHtml + app.bdgHtml + '</div><span class="ov-name">' + app.name + '</span>';
          grid.appendChild(it);
        });
        body.appendChild(grid);
      });
    }
  }

  function openOverlay(modo) {
    try {
      var phone = document.getElementById('phone');
      if (!phone) return;
      currentMode = modo === 'todos' ? 'todos' : 'busca';
      closeOverlay();

      var isIos = !!phone.querySelector('.lnc.ios');
      overlayEl = document.createElement('div');
      overlayEl.id = 'phone-app-overlay';
      overlayEl.className = isIos ? 'ios' : 'and';
      overlayEl.innerHTML =
        '<div class="ov-top">' +
          '<input type="search" class="ov-inp" placeholder="' +
            (currentMode === 'todos' ? 'Biblioteca de apps...' : 'Buscar aplicativo...') +
            '" autocomplete="off" enterkeyhint="search">' +
          '<button type="button" class="ov-close" title="Voltar">✕</button>' +
        '</div>' +
        '<div class="ov-body"></div>';

      phone.appendChild(overlayEl);
      var inp = overlayEl.querySelector('.ov-inp');
      inp.focus();

      inp.addEventListener('input', function () {
        renderOverlay(inp.value);
      });

      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var first = overlayEl.querySelector('.ov-item');
          if (first) {
            launchApp(first.getAttribute('data-target-l'));
          }
        }
      });

      renderOverlay('');
    } catch (e) {}
  }

  function closeOverlay() {
    if (overlayEl) {
      if (overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
      overlayEl = null;
    }
  }

  function ensureAppbar() {
    var phone = document.getElementById('phone');
    if (!phone) return;
    var lncs = phone.querySelectorAll('.lnc');
    for (var i = 0; i < lncs.length; i++) {
      var lnc = lncs[i];
      if (lnc.querySelector('.appbar')) continue;
      var gridl = lnc.querySelector('.gridl');
      if (!gridl) continue;
      var bar = document.createElement('div');
      bar.className = 'appbar';
      bar.innerHTML =
        '<button type="button" class="btn-srch">🔍 <span>Buscar aplicativos</span></button>' +
        '<button type="button" class="btn-all">▦ Todos</button>';
      gridl.parentNode.insertBefore(bar, gridl);
    }
  }

  function initObserver() {
    var phone = document.getElementById('phone');
    if (!phone) return;
    injectCSS();

    var isUpdating = false;
    var obs = new MutationObserver(function () {
      if (isUpdating) return;
      isUpdating = true;
      try {
        if (overlayEl && !phone.contains(overlayEl)) {
          overlayEl = null;
        } else if (overlayEl && !phone.querySelector('.lnc')) {
          closeOverlay();
        }
        ensureAppbar();
      } finally {
        isUpdating = false;
      }
    });

    obs.observe(phone, { childList: true, subtree: true });
    ensureAppbar();

    phone.addEventListener('click', function (e) {
      var itemBtn = e.target.closest('#phone-app-overlay .ov-item');
      if (itemBtn) {
        e.stopPropagation();
        launchApp(itemBtn.getAttribute('data-target-l'));
        return;
      }
      if (e.target.closest('#phone-app-overlay .ov-close')) {
        e.stopPropagation();
        closeOverlay();
        return;
      }
      if (e.target.closest('.appbar .btn-srch') || e.target.closest('.gsrch')) {
        e.preventDefault();
        e.stopPropagation();
        openOverlay('busca');
        return;
      }
      if (e.target.closest('.appbar .btn-all')) {
        e.preventDefault();
        e.stopPropagation();
        openOverlay('todos');
        return;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlayEl) {
        closeOverlay();
      }
    });
  }

  window.APPS_SEARCH = {
    open: function (modo) { openOverlay(modo); },
    close: function () { closeOverlay(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
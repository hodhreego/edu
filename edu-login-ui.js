/* Login DENTRO do app (Boletim/Classificação). window.EDU_LOGIN_UI.mostrar(container,{titulo,onOk,erro,cor})
   Usa EDU_AUTH.entrar(login,senha) se existir; senão faz o mesmo fluxo (hash SHA-256 + ação `entrar`) e grava localStorage.edu_sess. */
(function () {
  'use strict';
  var W = window, D = document, RE = /^\d{1,3}[a-z]{3}\d[a-z]$/, SESS_MIN = 100;   /* sessão de 1h40, igual a edu-auth.js e ao servidor */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sha(login, senha) {
    if (!(W.crypto && crypto.subtle)) return Promise.reject(new Error('nocrypto'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(login + ':' + senha + ':edu')).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  /* timeout 20 s + até 4 novas tentativas (1,5/3/5/8 s) quando não vier JSON, der timeout/rede ou o servidor pedir {tentar:1} */
  function getJ(url, prog) {
    var esp = [1500, 3000, 5000, 8000], n = 0;
    function um() {
      var ac = W.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort(); }, 20000);
      return fetch(url, ac ? { signal: ac.signal } : {}).then(function (r) { return r.text(); }).then(function (t) {
        clearTimeout(tm); var j = null; try { j = JSON.parse(t); } catch (e) { } return j && typeof j === 'object' ? j : { ok: 0, net: 1 };
      }, function () { clearTimeout(tm); return { ok: 0, net: 1 }; });
    }
    function vai() {
      return um().then(function (j) {
        if (!j.ok && (j.net || j.tentar) && n < esp.length) { var w = esp[n++]; try { if (prog) prog(n + 1); } catch (e) { } return new Promise(function (r) { setTimeout(r, w); }).then(vai); }
        return j;
      });
    }
    return vai();
  }
  function entrarProprio(u, p, prog) {
    if (!RE.test(u)) return Promise.resolve({ ok: 0, erro: 'Login inválido. Use o formato do RCO, ex.: 12cla6b.' });
    if (!p) return Promise.resolve({ ok: 0, erro: 'Digite a senha.' });
    var ep = W.EDU_ENDPOINT || '';
    if (!ep) return Promise.resolve({ ok: 0, erro: 'Sem endereço do servidor.' });
    var t0 = Date.now();
    return sha(u, p).then(function (h) {
      return getJ(ep + (ep.indexOf('?') < 0 ? '?' : '&') + 'acao=entrar&login=' + encodeURIComponent(u) + '&h=' + h, prog).then(function (j) {
        if (j && j.ok && j.token) {
          var min = +j.validadeMin > 0 ? +j.validadeMin : SESS_MIN;
          var s = { login: u, t: j.token, exp: t0 + min * 6e4 - 3e4, ini: t0, turma: j.turma || u.replace(/^\d+/, '') };
          try { localStorage.setItem('edu_sess', JSON.stringify(s)); localStorage.setItem('edu_login', u); } catch (e) {}
          return { ok: 1 };
        }
        if (j && !j.ok && (j.net || j.tentar)) return { ok: 0, net: 1, erro: 'Não foi possível falar com o servidor agora. Espere alguns segundos e tente de novo.' };
        return j || { ok: 0, erro: 'Resposta vazia.' };
      });
    }, function () { return { ok: 0, erro: 'Este navegador não permite entrar (precisa de https).' }; });
  }
  function entrar(u, p, prog) {
    u = String(u || '').trim().toLowerCase().replace(/\s+/g, '');
    if (W.EDU_AUTH && W.EDU_AUTH.entrar) return W.EDU_AUTH.entrar(u, p, prog);
    return entrarProprio(u, p, prog);
  }

  function mostrar(container, o) {
    o = o || {}; var cor = o.cor || '#0a8fb0';
    if (!container) return;
    /* um único lugar pede login: com o porteiro (edu-auth.js) presente e sem sessão de professor/teste, delega a ele */
    var A = W.EDU_AUTH, as = A && A.sessao ? A.sessao() : null;
    if (A && A.pedirLogin && !(as && (as.mestre || as.local))) {
      container.innerHTML = '<p style="text-align:center;padding:30px 14px;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#16213a">' + esc(o.erro || 'Entre na tela de login para continuar.') + '</p>';
      A.pedirLogin(o.erro || '', function () { if (o.onOk) o.onOk(); });
      return;
    }
    if (!D.getElementById('edu-login-ui-css')) {
      var st = D.createElement('style'); st.id = 'edu-login-ui-css';
      st.textContent = '.elu{max-width:340px;margin:18px auto;padding:18px 16px;background:#fff;border-radius:16px;box-shadow:0 1px 6px rgba(0,0,0,.12);text-align:center;color:#16213a;font-family:system-ui,Segoe UI,Arial,sans-serif;box-sizing:border-box}' +
        '.elu *{box-sizing:border-box}.elu h3{margin:0 0 4px;font-size:18px;text-transform:none;letter-spacing:0;color:#16213a}.elu p{margin:0 0 8px;font-size:13px;color:#555}' +
        '.elu label{display:block;text-align:left;font:700 13px Arial;margin:8px 0 3px}.elu input{width:100%;font:700 17px Arial;padding:9px;border:2px solid #cbd5e1;border-radius:10px;background:#fff;color:#111}' +
        '.elu .pw{position:relative}.elu .pw button{position:absolute;right:3px;top:3px;height:36px;width:40px;border:0;background:transparent;font-size:17px;cursor:pointer}' +
        '.elu .go{width:100%;margin-top:12px;padding:11px;border:0;border-radius:12px;color:#fff;font:800 16px Arial;cursor:pointer}.elu .go:disabled{opacity:.6;cursor:wait}.elu .er{color:#c62828;font:700 13px Arial;min-height:18px;margin-top:8px}';
      D.head.appendChild(st);
    }
    container.innerHTML = '<form class="elu" autocomplete="on"><h3>' + esc(o.titulo || 'Entre para continuar') + '</h3><p>Use o mesmo login e senha do site.</p>' +
      '<label>Login</label><input name="u" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="ex.: 12cla6b" maxlength="12">' +
      '<label>Senha</label><div class="pw"><input name="p" type="password" autocomplete="current-password"><button type="button" class="sh" aria-label="Mostrar senha">👁</button></div>' +
      '<button class="go" type="submit" style="background:' + cor + '">Entrar</button><div class="er" role="alert"></div></form>';
    var f = container.querySelector('form'), er = f.querySelector('.er'), go = f.querySelector('.go');
    er.textContent = o.erro || '';
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { f.addEventListener(t, function (e) { e.stopPropagation(); }); });
    f.querySelector('.sh').onclick = function () { var p = f.p; p.type = p.type === 'password' ? 'text' : 'password'; };
    try { var s = JSON.parse(localStorage.getItem('edu_sess') || 'null'); if (s && RE.test(s.login)) f.u.value = s.login; } catch (e) {}
    f.onsubmit = function (e) {
      e.preventDefault();
      var u = f.u.value.trim().toLowerCase().replace(/\s+/g, ''), p = f.p.value;
      if (!RE.test(u)) { er.textContent = 'Login inválido. Use o formato do RCO, ex.: 12cla6b.'; return; }
      if (!p) { er.textContent = 'Digite a senha.'; return; }
      go.disabled = true; er.textContent = 'Entrando…';
      Promise.resolve(entrar(u, p, function (n) { er.textContent = 'Conectando ao servidor… (tentativa ' + n + ')'; })).then(function (r) {
        go.disabled = false;
        if (r && r.ok && !r.mestre && !r.local) { er.textContent = ''; if (o.onOk) o.onOk(); }
        else if (r && r.ok) { er.textContent = 'Entre com um login de aluno (ex.: 12cla6b).'; }
        else er.textContent = (r && r.erro) || 'Não foi possível entrar. Confira login e senha.';
      }, function () { go.disabled = false; er.textContent = 'Não foi possível entrar. Tente de novo.'; });
    };
    setTimeout(function () { try { (f.u.value ? f.p : f.u).focus(); } catch (e) {} }, 50);
  }
  W.EDU_LOGIN_UI = { mostrar: mostrar };
})();

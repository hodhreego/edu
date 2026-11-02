(function () {
  var BASE = 'cenas/';
  var IMGS = {};

  function img(nome) {
    if (!IMGS[nome]) {
      var im = new Image();
      im.decoding = 'async';
      im.src = BASE + nome + '.webp';
      IMGS[nome] = im;
    }
    return IMGS[nome];
  }

  function pronto(nome) {
    var im = IMGS[nome];
    return !!(im && im.complete && im.naturalWidth);
  }

  function fundo(ctx, x, y, w, h, nome, focoY, alpha) {
    var im = img(nome);
    if (!im.complete || !im.naturalWidth) return false;
    var sw = im.naturalWidth, sh = im.naturalHeight;
    var escala = Math.max(w / sw, h / sh);
    var dw = sw * escala, dh = sh * escala;
    var dx = x + (w - dw) / 2;
    var fy = Math.max(0, Math.min(1, focoY == null ? 0.5 : focoY));
    var dy = y + (h - dh) * fy;
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.drawImage(im, dx, dy, dw, dh);
    ctx.restore();
    return true;
  }

  window.RBX_CENA = { pronto: pronto, fundo: fundo, IMGS: IMGS };
})();

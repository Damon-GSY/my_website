// Shared by the concept boards: scale the fixed 1600x1000 board to fit the window, centred.
// When the window is too short (fit below ~0.45) the board keeps fitting the width and scrolls vertically.
(function () {
  var W = 1600, H = 1000, MIN = 0.45;
  function fit() {
    var board = document.querySelector('body > .board');
    if (!board) return;
    var vw = document.documentElement.clientWidth || innerWidth, vh = innerHeight;
    var s = Math.min(vw / W, Math.max(vh / H, MIN));
    var x = Math.max(0, (vw - W * s) / 2), y = Math.max(0, (vh - H * s) / 2);
    board.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    document.body.style.height = Math.ceil(H * s + y) + 'px';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit);
  else fit();
  addEventListener('resize', fit);
})();

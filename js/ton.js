/* Monitor-Piep bei richtigen Antworten. Standardmäßig aus, Schalter in den Einstellungen. */
(function () {
  'use strict';
  var W = (window.W = window.W || {});
  var ctx = null;
  W.ton = {
    piep: function () {
      if (!W.state || !W.state.data.ton) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = ctx || new AC();
        if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.13);
      } catch (e) { /* kein Ton möglich */ }
    }
  };
})();

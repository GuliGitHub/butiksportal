// Auto-send patch - sparar auto_send_enabled till Supabase
window.addEventListener('load', function() {
  var orig = window.toggleAutoSend;
  if (!orig) return;
  window.toggleAutoSend = function(storeId) {
    orig.call(this, storeId);
    var sd = getSD(storeId);
    sbUpsert('store_settings', { store_id: storeId, auto_send_enabled: !!sd.autoSend })
      .catch(function(e) { console.error('[auto-send]', e); });
  };
});

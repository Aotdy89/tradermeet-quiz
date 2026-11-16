// Public (anon) key — safe to publish: every write goes through PIN/token-checked database functions.
window.TM_CONFIG = {
  url: "https://wcrimwxuutnhmljkzbkv.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjcmltd3h1dXRuaG1samt6Ymt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MTIyOTQsImV4cCI6MjExMDM4ODI5NH0.GI_R_P1QKxA3If3sTQwX5gCiKgX_KerVCnG8j_s-biQ"
};
window.TM = {
  sb: null,
  init() {
    this.sb = supabase.createClient(TM_CONFIG.url, TM_CONFIG.key, { auth: { persistSession: false } });
    return this.sb;
  },
  async rpc(name, args) {
    const { data, error } = await this.sb.rpc(name, args || {});
    if (error) throw error;
    return data;
  },
  // server clock offset (server_now - local_now), smoothed
  offset: null,
  syncClock(state) {
    if (!state || !state.server_now) return;
    const o = state.server_now - Date.now();
    this.offset = this.offset === null ? o : Math.round(this.offset * 0.7 + o * 0.3);
  },
  now() { return Date.now() + (this.offset || 0); },
  remaining(state) {
    if (!state || state.phase !== "question" || !state.started_ms) return 0;
    return Math.max(0, state.duration * 1000 - (this.now() - state.started_ms));
  },
  letters: ["A", "B", "C", "D"],
  partName(state, p) { const t = (state && state.parts) || []; return t[(p || 1) - 1] || ""; },
  partSize(state, p) { return ((state && state.part_sizes) || {})[String(p)] || 0; },
  // true when the question just played is the last one of its phase (and more questions follow)
  endOfPart(state) { return state && state.next_part != null && state.next_part !== state.part; },
  isLast(state) { return state && state.q_index + 1 >= state.q_total; },
  esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
};

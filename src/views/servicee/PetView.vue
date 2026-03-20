<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --orange: #FF6B35; --orange-light: #FFE0D4;
  --pink: #FF4E8A;   --pink-light: #FFD6E8;
  --yellow: #FFD166; --yellow-light: #FFF7D6;
  --teal: #06D6A0;   --teal-light: #D4F5EC;
  --purple: #7B5EA7; --purple-light: #EDE3F5;
  --bg: #FFF9F5; --card: #FFFFFF;
  --text: #2D2D2D; --muted: #9B9B9B; --border: #F0E8E0;
}
body {
  font-family: 'Nunito', sans-serif;
  background: #E8E0D8; color: var(--text);
  display: flex; justify-content: center;
  align-items: flex-start; min-height: 100vh; padding: 20px 0;
}
#app {
  background: var(--bg); width: 390px; min-height: 844px;
  position: relative; box-shadow: 0 0 40px rgba(0,0,0,0.18);
  border-radius: 40px; overflow: hidden;
  display: flex; flex-direction: column;
}

/* ── TOP NAV ── */
.top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px 10px; background: var(--card);
  border-bottom: 1.5px solid var(--border); flex-shrink: 0;
}
.app-logo {
  font-family: 'Jua', sans-serif; font-size: 21px;
  background: linear-gradient(90deg, var(--orange), var(--pink));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.top-points {
  display: flex; align-items: center; gap: 5px;
  background: var(--yellow-light); border: 1.5px solid var(--yellow);
  border-radius: 20px; padding: 4px 10px;
}
.top-points-icon { font-size: 14px; }
.top-points-val { font-size: 13px; font-weight: 900; color: #C07000; }

/* ── VIEWS ── */
.scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; }
.view { display: none; }
.view.active { display: block; }

/* ── PET VIEW ── */
.pet-header {
  background: linear-gradient(135deg, #FFF0E8 0%, #FFE8F3 100%);
  padding: 16px 20px 0; text-align: center; position: relative; overflow: hidden;
}
.pet-header::before {
  content: ''; position: absolute; top: -30px; right: -30px;
  width: 120px; height: 120px; border-radius: 50%;
  background: rgba(255,107,53,0.07);
}
.pet-name-row {
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 3px;
}
.pet-name { font-size: 20px; font-weight: 800; }
.level-badge {
  background: linear-gradient(90deg, var(--orange), var(--pink));
  color: white; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 20px;
}
.owner-name { font-size: 12px; color: var(--muted); margin-bottom: 10px; }

/* Pet scene with equippable bg */
.pet-scene {
  position: relative; height: 175px;
  display: flex; align-items: flex-end; justify-content: center;
  transition: background 0.5s;
}
.pet-scene-bg {
  position: absolute; inset: 0; border-radius: 0;
  transition: background 0.5s;
}
.pet-ground {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 38px; border-radius: 50% 50% 0 0;
  transition: background 0.5s;
}
.pet-emoji {
  font-size: 88px; position: relative; z-index: 2;
  animation: petBounce 2.5s ease-in-out infinite;
  cursor: pointer; user-select: none;
  filter: drop-shadow(0 6px 10px rgba(255,107,53,0.2));
  transition: font-size 0.4s, filter 0.4s;
}
.pet-emoji:active { transform: scale(0.88); }
.pet-accessory {
  position: absolute; z-index: 3; top: 14px;
  font-size: 30px; pointer-events: none;
  animation: petBounce 2.5s ease-in-out infinite;
}
.pet-sparkle  { position: absolute; top: 10px; right: 58px; font-size: 18px; opacity: 0; animation: sparkle 2.5s ease-in-out infinite 0.8s; }
.pet-sparkle2 { position: absolute; top: 24px; left: 52px; font-size: 14px; opacity: 0; animation: sparkle 2.5s ease-in-out infinite 1.4s; }

@keyframes petBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes sparkle   { 0%,100%{opacity:0;transform:scale(.5) rotate(0deg)} 30%,70%{opacity:1;transform:scale(1.2) rotate(20deg)} }
@keyframes pop       { 0%{transform:scale(1)} 40%{transform:scale(1.35) rotate(-8deg)} 100%{transform:scale(1)} }
.pop { animation: pop 0.45s ease !important; }

/* Stats */
.stats-row { display: flex; gap: 7px; padding: 12px 16px; }
.stat-pill {
  flex: 1; background: var(--card); border: 1.5px solid var(--border);
  border-radius: 14px; padding: 9px 6px; text-align: center; cursor: default;
}
.stat-pill.clickable { cursor: pointer; transition: transform 0.15s; }
.stat-pill.clickable:active { transform: scale(0.95); }
.stat-icon { font-size: 16px; }
.stat-value { font-size: 13px; font-weight: 800; }
.stat-label { font-size: 9px; color: var(--muted); font-weight: 600; margin-top: 1px; }

/* Intimacy bar */
.intimacy-section { padding: 0 16px 14px; }
.intimacy-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.intimacy-title { font-size: 12px; font-weight: 700; }
.intimacy-count { font-size: 12px; font-weight: 700; color: var(--orange); }
.bar-track { height: 11px; background: var(--border); border-radius: 20px; overflow: hidden; }
.bar-fill {
  height: 100%; border-radius: 20px;
  background: linear-gradient(90deg, var(--orange), var(--pink));
  transition: width 0.6s cubic-bezier(.34,1.56,.64,1);
}
.levelup-hint { font-size: 10px; color: var(--muted); margin-top: 4px; text-align: right; }
.levelup-hint span { color: var(--pink); font-weight: 700; }

/* Action buttons */
.action-section { padding: 0 16px 16px; }
.action-title { font-size: 12px; font-weight: 700; margin-bottom: 9px; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.action-btn {
  border: none; border-radius: 16px; padding: 13px 8px;
  cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  transition: transform 0.15s; position: relative; overflow: hidden;
}
.action-btn:active { transform: scale(0.95); }
.btn-icon { font-size: 24px; }
.btn-sub { font-size: 9px; }
.btn-pet    { background: linear-gradient(135deg,#FFE0D4,#FFDDE8); color: var(--orange); box-shadow: 0 4px 10px rgba(255,107,53,0.13); }
.btn-food   { background: linear-gradient(135deg,#FFF7D6,#FFF0C0); color: #C97A00; box-shadow: 0 4px 10px rgba(255,209,102,0.18); }
.btn-dress  { background: linear-gradient(135deg,var(--purple-light),#EDE3F5); color: var(--purple); box-shadow: 0 4px 10px rgba(123,94,167,0.1); }
.btn-reward { background: linear-gradient(135deg,var(--teal-light),#C0F0E5); color: #00956C; box-shadow: 0 4px 10px rgba(6,214,160,0.1); }
.btn-badge {
  position: absolute; top: 7px; right: 7px;
  background: var(--pink); color: white; font-size: 8px; font-weight: 800;
  padding: 2px 5px; border-radius: 8px;
}

/* Cooldown overlay on pat button */
.btn-pet.cooling { opacity: 0.6; cursor: not-allowed; }
.cooldown-text { font-size: 10px; color: #c05020; font-weight: 800; }

/* Snack log */
.snack-section {
  margin: 0 16px 16px; background: var(--card);
  border: 1.5px solid var(--border); border-radius: 18px; padding: 13px 14px;
}
.snack-title { font-size: 12px; font-weight: 700; margin-bottom: 9px; }
.snack-list { display: flex; flex-direction: column; gap: 7px; }
.snack-item { display: flex; align-items: center; gap: 9px; padding: 7px 9px; background: var(--bg); border-radius: 11px; }
.snack-emoji { font-size: 20px; }
.snack-info { flex: 1; }
.snack-name { font-size: 11px; font-weight: 700; }
.snack-time { font-size: 9px; color: var(--muted); margin-top: 1px; }
.snack-xp { font-size: 10px; font-weight: 800; color: var(--orange); background: var(--orange-light); padding: 2px 7px; border-radius: 9px; }

/* ── RANKING ── */
.ranking-header { padding: 18px 18px 8px; background: linear-gradient(135deg,#1a1a2e,#16213e); text-align: center; }
.ranking-title { font-size: 21px; font-weight: 900; color: white; }
.ranking-subtitle { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.ranking-tabs { display: flex; margin: 12px 0 0; background: rgba(255,255,255,0.08); border-radius: 11px; padding: 3px; }
.rtab { flex: 1; padding: 6px; border: none; border-radius: 8px; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; cursor:pointer; color:rgba(255,255,255,0.45); background:none; transition:all 0.2s; }
.rtab.active { background: var(--orange); color: white; }
.ranking-body { padding: 10px 14px; }
.top3 { display:flex; align-items:flex-end; justify-content:center; gap:6px; padding:18px 0 8px; background:linear-gradient(180deg,#1a1a2e,var(--bg)); }
.top3-item { display:flex; flex-direction:column; align-items:center; gap:3px; position:relative; }
.top3-item.rank1{order:2} .top3-item.rank2{order:1} .top3-item.rank3{order:3}
.podium-crown { font-size:15px; position:absolute; top:-17px; }
.podium-avatar { border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.18); }
.rank1 .podium-avatar{width:68px;height:68px;font-size:34px;background:linear-gradient(135deg,#FFD166,#FF9F43)}
.rank2 .podium-avatar,.rank3 .podium-avatar{width:52px;height:52px;font-size:26px}
.rank2 .podium-avatar{background:linear-gradient(135deg,#DDD,#AAA)}
.rank3 .podium-avatar{background:linear-gradient(135deg,#CD8B55,#A0622A)}
.podium-name{font-size:10px;font-weight:700;color:white} .rank1 .podium-name{font-size:11px}
.podium-level{font-size:9px;color:rgba(255,255,255,0.55)}
.podium-box{border-radius:9px 9px 0 0;width:76px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;color:white}
.rank1 .podium-box{height:52px;background:linear-gradient(180deg,#FFD166,#FF9F43)}
.rank2 .podium-box{height:38px;background:linear-gradient(180deg,#C0C0C0,#888)}
.rank3 .podium-box{height:26px;background:linear-gradient(180deg,#CD8B55,#8B6040)}
.rank-list{display:flex;flex-direction:column;gap:7px}
.rank-item{display:flex;align-items:center;gap:9px;background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:9px 12px;position:relative;overflow:hidden}
.rank-item.mine{border-color:var(--orange);background:linear-gradient(135deg,#FFF5F0,#FFF0F5)}
.rank-item.mine::before{content:'나';position:absolute;right:10px;top:7px;font-size:9px;font-weight:800;color:var(--orange);background:var(--orange-light);padding:2px 5px;border-radius:7px}
.rank-num{width:22px;text-align:center;font-size:13px;font-weight:800;color:var(--muted)}
.rank-avatar{width:40px;height:40px;border-radius:50%;background:var(--orange-light);font-size:20px;display:flex;align-items:center;justify-content:center}
.rank-info{flex:1}
.rank-name{font-size:12px;font-weight:700}
.rank-detail{font-size:10px;color:var(--muted);margin-top:1px}
.rank-level{font-size:15px;font-weight:900;color:var(--orange)}
.rank-pts{font-size:9px;color:var(--muted)}
.rank-change{font-size:9px;font-weight:700;padding:1px 4px;border-radius:5px}
.up{color:var(--teal);background:var(--teal-light)} .same{color:var(--muted);background:var(--border)} .down{color:var(--pink);background:var(--pink-light)}

/* ── REWARDS ── */
.rewards-header{padding:18px 18px 12px;background:linear-gradient(135deg,#FFF7D6,#FFE8D6)}
.rewards-title{font-size:19px;font-weight:900}
.my-points{display:flex;align-items:center;gap:5px;background:white;border-radius:13px;padding:7px 13px;margin-top:9px;width:fit-content;border:1.5px solid var(--yellow)}
.my-points-num{font-size:21px;font-weight:900;color:var(--orange)}
.my-points-label{font-size:10px;color:var(--muted);font-weight:600}
.reward-section-title{font-size:13px;font-weight:800;padding:12px 18px 7px}
.reward-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:0 18px}
.reward-card{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:13px 10px;text-align:center;position:relative;transition:transform 0.15s}
.reward-card:active{transform:scale(0.97)}
.reward-card.locked{opacity:0.55}
.reward-card.claimable{border-color:var(--orange);box-shadow:0 0 0 2px rgba(255,107,53,0.09)}
.reward-lv-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:var(--orange);color:white;font-size:8px;font-weight:800;padding:2px 7px;border-radius:0 0 7px 7px}
.reward-lv-badge.achieved{background:var(--teal)}
.reward-emoji{font-size:30px;margin:10px 0 5px;display:block}
.reward-name{font-size:11px;font-weight:700}
.reward-desc{font-size:9px;color:var(--muted);margin-top:2px}
.claim-btn{margin-top:7px;width:100%;border:none;border-radius:9px;padding:5px;font-family:'Nunito',sans-serif;font-size:10px;font-weight:800;cursor:pointer}
.claim-btn.ready{background:var(--orange);color:white}
.claim-btn.locked-btn{background:var(--border);color:var(--muted)}
.claim-btn.done{background:var(--teal-light);color:#00956C}
.history-section{padding:13px 18px 18px}
.history-title{font-size:13px;font-weight:800;margin-bottom:9px}
.history-item{display:flex;align-items:center;gap:9px;padding:9px;background:var(--card);border:1.5px solid var(--border);border-radius:13px;margin-bottom:7px}
.history-icon{font-size:18px;width:34px;height:34px;background:var(--yellow-light);border-radius:9px;display:flex;align-items:center;justify-content:center}
.history-info{flex:1}
.history-name{font-size:11px;font-weight:700}
.history-date{font-size:9px;color:var(--muted);margin-top:1px}
.history-value{font-size:12px;font-weight:900;color:var(--orange)}

/* ── SHOP ── */
.shop-header{padding:18px 18px 12px;background:linear-gradient(135deg,#1a1a2e,#2d1b4e);text-align:center}
.shop-title{font-size:22px;font-weight:900;color:white;font-family:'Jua',sans-serif}
.shop-subtitle{font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px}
.shop-points-row{display:flex;justify-content:center;margin-top:10px}
.shop-my-pts{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:20px;padding:6px 14px}
.shop-pts-icon{font-size:16px}
.shop-pts-val{font-size:15px;font-weight:900;color:var(--yellow)}
.shop-pts-label{font-size:10px;color:rgba(255,255,255,0.6)}

.shop-tabs{display:flex;gap:0;padding:12px 16px 4px;overflow-x:auto}
.shop-tabs::-webkit-scrollbar{display:none}
.shop-tab{flex-shrink:0;padding:7px 14px;border:none;border-radius:20px;font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;cursor:pointer;background:var(--border);color:var(--muted);transition:all 0.2s;margin-right:6px}
.shop-tab.active{background:linear-gradient(90deg,var(--purple),var(--pink));color:white}

.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:8px 16px 16px}
.shop-card{background:var(--card);border:1.5px solid var(--border);border-radius:18px;padding:14px 10px;text-align:center;position:relative;transition:transform 0.15s}
.shop-card:active{transform:scale(0.97)}
.shop-card.owned{border-color:var(--teal);background:linear-gradient(135deg,#F0FFF8,#E8FFF4)}
.shop-card.equipped{border-color:var(--orange);background:linear-gradient(135deg,#FFF5F0,#FFF0F8);box-shadow:0 0 0 2px rgba(255,107,53,0.12)}
.shop-item-preview{font-size:38px;margin-bottom:8px;display:block;line-height:1}
.shop-item-name{font-size:12px;font-weight:800;color:var(--text)}
.shop-item-desc{font-size:9px;color:var(--muted);margin-top:2px}
.shop-price{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:8px}
.shop-price-icon{font-size:12px}
.shop-price-val{font-size:13px;font-weight:900;color:#C07000}
.shop-btn{margin-top:8px;width:100%;border:none;border-radius:10px;padding:7px;font-family:'Nunito',sans-serif;font-size:11px;font-weight:800;cursor:pointer;transition:all 0.2s}
.shop-btn.buy{background:linear-gradient(90deg,var(--purple),var(--pink));color:white}
.shop-btn.equip{background:var(--orange);color:white}
.shop-btn.equipped-btn{background:var(--teal-light);color:#00956C}
.shop-btn.no-money{background:var(--border);color:var(--muted);cursor:not-allowed}
.new-badge{position:absolute;top:8px;right:8px;background:var(--pink);color:white;font-size:8px;font-weight:800;padding:2px 6px;border-radius:8px}

/* ── ATTENDANCE MODAL ── */
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:300;align-items:flex-end;justify-content:center}
.modal-overlay.open{display:flex}
.modal-sheet{background:white;width:100%;max-width:390px;border-radius:24px 24px 0 0;padding:20px;animation:slideUp 0.3s ease;max-height:90vh;overflow-y:auto}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.sheet-handle{width:38px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 14px}
.sheet-title{font-size:16px;font-weight:800;margin-bottom:4px}
.sheet-sub{font-size:11px;color:var(--muted);margin-bottom:14px}

/* Calendar */
.cal-month-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cal-month-label{font-size:14px;font-weight:800}
.cal-nav-btn{border:none;background:var(--border);border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px}
.cal-dow{font-size:9px;font-weight:700;color:var(--muted);text-align:center;padding:3px 0}
.cal-day{
  aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;cursor:default;position:relative;
}
.cal-day.attended{background:linear-gradient(135deg,var(--orange),var(--pink));color:white}
.cal-day.today{border:2px solid var(--orange);color:var(--orange)}
.cal-day.today.attended{border:none}
.cal-day.empty{opacity:0}
.cal-day.future{color:var(--border)}

/* Attendance rewards strip */
.att-rewards{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px}
.att-rewards::-webkit-scrollbar{display:none}
.att-reward-item{flex-shrink:0;text-align:center;width:52px}
.att-day-num{font-size:9px;font-weight:700;color:var(--muted);margin-bottom:3px}
.att-day-box{
  width:52px;height:52px;border-radius:14px;border:1.5px solid var(--border);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  background:var(--bg);transition:all 0.2s;
}
.att-day-box.done{background:linear-gradient(135deg,var(--orange-light),var(--pink-light));border-color:var(--orange)}
.att-day-box.today-box{border:2px solid var(--orange);background:var(--yellow-light)}
.att-day-box.special{background:linear-gradient(135deg,var(--yellow-light),#FFE0A0);border-color:var(--yellow)}
.att-reward-emoji{font-size:20px}
.att-reward-pts{font-size:8px;font-weight:800;color:var(--orange)}

.att-streak-info{
  display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--yellow-light),var(--orange-light));
  border-radius:14px;padding:12px 14px;margin-bottom:14px;
}
.att-streak-num{font-size:28px;font-weight:900;color:var(--orange)}
.att-streak-text{font-size:12px;font-weight:700}
.att-streak-sub{font-size:10px;color:var(--muted);margin-top:1px}

.att-checkin-btn{
  width:100%;padding:14px;border:none;border-radius:16px;
  background:linear-gradient(90deg,var(--orange),var(--pink));
  color:white;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;
  transition:opacity 0.2s;
}
.att-checkin-btn:disabled{background:var(--border);color:var(--muted);cursor:not-allowed}

/* Pet select sheet */
.pet-select-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;align-items:flex-end;justify-content:center}
.pet-select-overlay.open{display:flex}
.pet-select-sheet{background:white;width:100%;max-width:390px;border-radius:24px 24px 0 0;padding:20px;animation:slideUp 0.3s ease}
.pet-options{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:14px}
.pet-option{border:2px solid var(--border);border-radius:14px;padding:9px 5px;text-align:center;cursor:pointer;transition:all 0.2s}
.pet-option.selected{border-color:var(--orange);background:var(--orange-light)}
.pet-option-emoji{font-size:26px;display:block;margin-bottom:3px}
.pet-option-name{font-size:9px;font-weight:700}
.select-confirm-btn{width:100%;padding:13px;border:none;border-radius:14px;background:linear-gradient(90deg,var(--orange),var(--pink));color:white;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer}

/* ── BOTTOM NAV ── */
.bottom-nav{
  display:flex;background:var(--card);border-top:1.5px solid var(--border);
  padding:7px 0 14px;flex-shrink:0;
}
.bnav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  cursor:pointer;padding:3px 0;border:none;background:none;
  font-family:'Nunito',sans-serif;transition:transform 0.15s;
}
.bnav-item:active{transform:scale(0.88)}
.bnav-icon{font-size:20px}
.bnav-label{font-size:9px;font-weight:700;color:var(--muted)}
.bnav-item.active .bnav-label{color:var(--orange)}
.bnav-dot{width:4px;height:4px;border-radius:50%;background:var(--orange);margin-top:-1px;opacity:0}
.bnav-item.active .bnav-dot{opacity:1}

/* Toast */
.toast{
  position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(110px);
  background:#1a1a1a;color:white;font-size:12px;font-weight:700;
  padding:9px 18px;border-radius:28px;z-index:999;
  transition:transform 0.4s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;pointer-events:none;
}
.toast.show{transform:translateX(-50%) translateY(0)}

/* Points popup */
.pts-popup{
  position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
  background:white;border-radius:24px;padding:24px 32px;text-align:center;
  z-index:400;box-shadow:0 12px 40px rgba(0,0,0,0.18);
  transition:transform 0.4s cubic-bezier(.34,1.56,.64,1);
}
.pts-popup.show{transform:translate(-50%,-50%) scale(1)}
.pts-popup-emoji{font-size:44px;margin-bottom:8px}
.pts-popup-title{font-size:18px;font-weight:900;color:var(--text);margin-bottom:4px}
.pts-popup-pts{font-size:28px;font-weight:900;color:var(--orange);margin-bottom:6px}
.pts-popup-sub{font-size:11px;color:var(--muted)}

.spacer{height:20px}
</style>
<templete>
<div id="app">

  <!-- TOP NAV -->
  <div class="top-nav">
    <div class="app-logo">🍱 냠냠딜리버리</div>
    <div class="top-points" onclick="switchView('reward')" style="cursor:pointer">
      <span class="top-points-icon">🪙</span>
      <span class="top-points-val" id="top-pts-val">4,280</span>
      <span style="font-size:10px;color:#999">P</span>
    </div>
  </div>

  <!-- SCROLL AREA -->
  <div class="scroll-area">

  <!-- ===== MY PET VIEW ===== -->
  <div class="view active" id="view-pet">
    <div class="pet-header">
      <div class="pet-name-row">
        <span class="pet-name" id="pet-display-name">모찌</span>
        <span class="level-badge" id="pet-level-badge">Lv.5</span>
      </div>
      <div class="owner-name">김민준님의 펫 친구 🍀</div>
      <div class="pet-scene" id="pet-scene">
        <div class="pet-scene-bg" id="pet-scene-bg"></div>
        <div class="pet-sparkle">✨</div>
        <div class="pet-sparkle2">⭐</div>
        <div class="pet-accessory" id="pet-accessory" style="display:none"></div>
        <div class="pet-emoji" id="pet-emoji" onclick="petPat()">🐱</div>
        <div class="pet-ground" id="pet-ground" style="background:#FFE0C8"></div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-pill"><div class="stat-icon">🤝</div><div class="stat-value" id="stat-intimacy">72</div><div class="stat-label">친밀도</div></div>
      <div class="stat-pill"><div class="stat-icon">🍖</div><div class="stat-value" id="stat-meals">28</div><div class="stat-label">준 간식</div></div>
      <div class="stat-pill clickable" onclick="openAttendance()">
        <div class="stat-icon">📅</div>
        <div class="stat-value" id="stat-streak">12</div>
        <div class="stat-label">연속출석</div>
      </div>
      <div class="stat-pill"><div class="stat-icon">🏆</div><div class="stat-value">4위</div><div class="stat-label">전국순위</div></div>
    </div>

    <div class="intimacy-section">
      <div class="intimacy-header">
        <span class="intimacy-title">💕 친밀도 게이지</span>
        <span class="intimacy-count" id="intimacy-display">720 / 1000</span>
      </div>
      <div class="bar-track"><div class="bar-fill" id="intimacy-bar" style="width:72%"></div></div>
      <div class="levelup-hint">레벨업까지 <span id="levelup-remain">280</span>점 남음 🔥</div>
    </div>

    <div class="action-section">
      <div class="action-title">오늘 할 일</div>
      <div class="action-grid">
        <button class="action-btn btn-pet" id="pat-btn" onclick="petPat()">
          <span class="btn-icon">🫶</span>
          쓰다듬기
          <span class="btn-sub cooldown-text" id="pat-cooldown-label" style="display:none"></span>
          <span class="btn-sub" id="pat-ready-label" style="color:#FF8C60">+5 친밀도</span>
        </button>
        <button class="action-btn btn-food" onclick="giveSnack()">
          <span class="btn-badge">NEW</span>
          <span class="btn-icon">🍔</span>
          간식 주기
          <span class="btn-sub" style="color:#B8860B">주문 연동</span>
        </button>
        <button class="action-btn btn-dress" onclick="openPetSelect()">
          <span class="btn-icon">👗</span>
          펫 변경
          <span class="btn-sub" style="color:#7B5EA7">8종 선택</span>
        </button>
        <button class="action-btn btn-reward" onclick="switchView('reward')">
          <span class="btn-icon">🎁</span>
          보상함
          <span class="btn-sub" style="color:#00956C">2개 수령가능</span>
        </button>
      </div>
    </div>

    <div class="snack-section">
      <div class="snack-title">🍱 최근 먹인 간식</div>
      <div class="snack-list">
        <div class="snack-item"><span class="snack-emoji">🍕</span><div class="snack-info"><div class="snack-name">피자 마르게리따</div><div class="snack-time">오늘 12:34 · 도미노피자</div></div><span class="snack-xp">+30 XP</span></div>
        <div class="snack-item"><span class="snack-emoji">🍜</span><div class="snack-info"><div class="snack-name">짬뽕 곱배기</div><div class="snack-time">어제 18:10 · 중화반점</div></div><span class="snack-xp">+25 XP</span></div>
        <div class="snack-item"><span class="snack-emoji">🍗</span><div class="snack-info"><div class="snack-name">후라이드 치킨</div><div class="snack-time">어제 20:55 · BBQ치킨</div></div><span class="snack-xp">+20 XP</span></div>
      </div>
    </div>
    <div class="spacer"></div>
  </div><!-- /view-pet -->

  <!-- ===== RANKING VIEW ===== -->
  <div class="view" id="view-rank">
    <div class="ranking-header">
      <div class="ranking-title">🏆 펫 랭킹</div>
      <div class="ranking-subtitle">매주 월요일 00:00 초기화</div>
      <div class="ranking-tabs">
        <button class="rtab active" onclick="switchRankTab(this,'전국')">전국</button>
        <button class="rtab" onclick="switchRankTab(this,'친구')">친구</button>
        <button class="rtab" onclick="switchRankTab(this,'지역')">대구/경북</button>
      </div>
    </div>
    <div class="top3">
      <div class="top3-item rank2"><div class="podium-avatar">🐶</div><div class="podium-name">행복한하루</div><div class="podium-level">Lv.8</div><div class="podium-box">2</div></div>
      <div class="top3-item rank1"><div class="podium-crown">👑</div><div class="podium-avatar">🦊</div><div class="podium-name">먹부림왕</div><div class="podium-level">Lv.12</div><div class="podium-box">1</div></div>
      <div class="top3-item rank3"><div class="podium-avatar">🐰</div><div class="podium-name">달달한삶</div><div class="podium-level">Lv.7</div><div class="podium-box">3</div></div>
    </div>
    <div class="ranking-body">
      <div class="rank-list">
        <div class="rank-item"><div class="rank-num" style="color:#C0A000">4</div><div class="rank-avatar">🐱</div><div class="rank-info"><div class="rank-name">김민준 <span style="font-size:9px;color:var(--muted)">· 모찌</span></div><div class="rank-detail">연속주문 12일 · 간식 28개</div></div><div style="text-align:right"><div class="rank-level">Lv.5</div><div class="rank-pts">720 pts</div><div class="rank-change up">▲2</div></div></div>
        <div class="rank-item mine"><div class="rank-num" style="color:var(--orange);font-size:16px">★</div><div class="rank-avatar" style="background:var(--orange-light)">🐱</div><div class="rank-info"><div class="rank-name" style="color:var(--orange)">나 (모찌)</div><div class="rank-detail">현재 4위 · 전주 대비 +2</div></div><div style="text-align:right"><div class="rank-level" style="font-size:19px">5</div><div class="rank-pts">720 pts</div></div></div>
        <div class="rank-item"><div class="rank-num">5</div><div class="rank-avatar" style="background:#E8F5E9">🐹</div><div class="rank-info"><div class="rank-name">야식러버 <span style="font-size:9px;color:var(--muted)">· 콩이</span></div><div class="rank-detail">연속주문 9일 · 간식 24개</div></div><div style="text-align:right"><div class="rank-level">Lv.5</div><div class="rank-pts">680 pts</div><div class="rank-change same">–</div></div></div>
        <div class="rank-item"><div class="rank-num">6</div><div class="rank-avatar" style="background:#EDE3F5">🐻</div><div class="rank-info"><div class="rank-name">배달왕 <span style="font-size:9px;color:var(--muted)">· 포동이</span></div><div class="rank-detail">연속주문 7일 · 간식 20개</div></div><div style="text-align:right"><div class="rank-level">Lv.4</div><div class="rank-pts">590 pts</div><div class="rank-change down">▼1</div></div></div>
        <div class="rank-item"><div class="rank-num">7</div><div class="rank-avatar" style="background:#D4F5EC">🐸</div><div class="rank-info"><div class="rank-name">초록이좋아 <span style="font-size:9px;color:var(--muted)">· 개구리</span></div><div class="rank-detail">연속주문 5일 · 간식 15개</div></div><div style="text-align:right"><div class="rank-level">Lv.3</div><div class="rank-pts">420 pts</div><div class="rank-change up">▲3</div></div></div>
      </div>
    </div>
    <div class="spacer"></div>
  </div><!-- /view-rank -->

  <!-- ===== REWARDS VIEW ===== -->
  <div class="view" id="view-reward">
    <div class="rewards-header">
      <div class="rewards-title">🎁 레벨업 보상</div>
      <div class="my-points"><span class="my-points-num" id="reward-pts-val">4,280</span><span class="my-points-label">보유 포인트</span></div>
    </div>
    <div class="reward-section-title">레벨별 보상 목록</div>
    <div class="reward-grid">
      <div class="reward-card"><div class="reward-lv-badge achieved">Lv.1 ✓</div><span class="reward-emoji">☕</span><div class="reward-name">아메리카노 쿠폰</div><div class="reward-desc">스타벅스 Tall</div><button class="claim-btn done">수령완료</button></div>
      <div class="reward-card"><div class="reward-lv-badge achieved">Lv.2 ✓</div><span class="reward-emoji">🏷️</span><div class="reward-name">500원 할인쿠폰</div><div class="reward-desc">최소주문 5천원</div><button class="claim-btn done">수령완료</button></div>
      <div class="reward-card claimable"><div class="reward-lv-badge achieved">Lv.5 달성!</div><span class="reward-emoji">🍕</span><div class="reward-name">피자 1+1 쿠폰</div><div class="reward-desc">참여매장 전용</div><button class="claim-btn ready" onclick="claimReward(this)">수령하기</button></div>
      <div class="reward-card claimable"><div class="reward-lv-badge achieved">Lv.5 달성!</div><span class="reward-emoji">💎</span><div class="reward-name">VIP 배지</div><div class="reward-desc">프로필 전용</div><button class="claim-btn ready" onclick="claimReward(this)">수령하기</button></div>
      <div class="reward-card locked"><div class="reward-lv-badge">Lv.8 필요</div><span class="reward-emoji">🚀</span><div class="reward-name">무료배달 3회권</div><div class="reward-desc">전 매장 적용</div><button class="claim-btn locked-btn">잠금</button></div>
      <div class="reward-card locked"><div class="reward-lv-badge">Lv.10 필요</div><span class="reward-emoji">👑</span><div class="reward-name">5,000원 쿠폰</div><div class="reward-desc">전 메뉴 적용</div><button class="claim-btn locked-btn">잠금</button></div>
    </div>
    <div class="history-section">
      <div class="history-title">포인트 내역</div>
      <div id="points-history">
        <div class="history-item"><div class="history-icon">⬆️</div><div class="history-info"><div class="history-name">Lv.5 달성 보상</div><div class="history-date">2025.06.10</div></div><div class="history-value">+500P</div></div>
        <div class="history-item"><div class="history-icon">📅</div><div class="history-info"><div class="history-name">7일 연속출석</div><div class="history-date">2025.06.08</div></div><div class="history-value">+200P</div></div>
        <div class="history-item"><div class="history-icon">☕</div><div class="history-info"><div class="history-name">Lv.1 달성 보상</div><div class="history-date">2025.06.01</div></div><div class="history-value">+100P</div></div>
      </div>
    </div>
    <div class="spacer"></div>
  </div><!-- /view-reward -->

  <!-- ===== SHOP VIEW ===== -->
  <div class="view" id="view-shop">
    <div class="shop-header">
      <div class="shop-title">🛍️ 펫 상점</div>
      <div class="shop-subtitle">포인트로 특별한 아이템을 구매하세요</div>
      <div class="shop-points-row">
        <div class="shop-my-pts">
          <span class="shop-pts-icon">🪙</span>
          <span class="shop-pts-val" id="shop-pts-val">4,280</span>
          <span class="shop-pts-label">P 보유중</span>
        </div>
      </div>
    </div>

    <div class="shop-tabs">
      <button class="shop-tab active" onclick="switchShopTab(this,'acc')">🎀 액세서리</button>
      <button class="shop-tab" onclick="switchShopTab(this,'bg')">🌄 배경</button>
      <button class="shop-tab" onclick="switchShopTab(this,'ground')">🌿 바닥</button>
      <button class="shop-tab" onclick="switchShopTab(this,'effect')">✨ 효과</button>
    </div>

    <!-- ACCESSORIES -->
    <div class="shop-grid" id="shop-acc">
      <div class="shop-card owned" data-item="hat1" data-type="acc" data-emoji="🎩" data-price="0">
        <div class="new-badge">장착중</div>
        <span class="shop-item-preview">🎩</span>
        <div class="shop-item-name">마법사 모자</div>
        <div class="shop-item-desc">신비로운 분위기</div>
        <button class="shop-btn equipped-btn" onclick="equipItem(this,'acc','🎩')">장착됨 ✓</button>
      </div>
      <div class="shop-card" data-item="hat2" data-type="acc" data-emoji="👑" data-price="300">
        <span class="shop-item-preview">👑</span>
        <div class="shop-item-name">왕관</div>
        <div class="shop-item-desc">최고의 펫에게</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">300P</span></div>
        <button class="shop-btn buy" onclick="buyItem(this,'acc','👑',300,'왕관')">구매하기</button>
      </div>
      <div class="shop-card" data-item="hat3" data-type="acc" data-emoji="🎀" data-price="200">
        <div class="new-badge" style="background:var(--teal)">NEW</div>
        <span class="shop-item-preview">🎀</span>
        <div class="shop-item-name">리본</div>
        <div class="shop-item-desc">사랑스러운 리본</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">200P</span></div>
        <button class="shop-btn buy" onclick="buyItem(this,'acc','🎀',200,'리본')">구매하기</button>
      </div>
      <div class="shop-card" data-item="hat4" data-type="acc" data-emoji="😎" data-price="250">
        <span class="shop-item-preview">😎</span>
        <div class="shop-item-name">선글라스</div>
        <div class="shop-item-desc">쿨한 스타일</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">250P</span></div>
        <button class="shop-btn buy" onclick="buyItem(this,'acc','😎',250,'선글라스')">구매하기</button>
      </div>
      <div class="shop-card" data-item="hat5" data-type="acc" data-emoji="🌸" data-price="180">
        <span class="shop-item-preview">🌸</span>
        <div class="shop-item-name">꽃 머리띠</div>
        <div class="shop-item-desc">봄날의 산책</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">180P</span></div>
        <button class="shop-btn buy" onclick="buyItem(this,'acc','🌸',180,'꽃 머리띠')">구매하기</button>
      </div>
      <div class="shop-card" data-item="hat6" data-type="acc" data-emoji="🎓" data-price="320">
        <span class="shop-item-preview">🎓</span>
        <div class="shop-item-name">졸업 모자</div>
        <div class="shop-item-desc">똑똑한 내 펫</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">320P</span></div>
        <button class="shop-btn buy" onclick="buyItem(this,'acc','🎓',320,'졸업 모자')">구매하기</button>
      </div>
    </div>

    <!-- BACKGROUNDS -->
    <div class="shop-grid" id="shop-bg" style="display:none">
      <div class="shop-card owned" data-item="bg1">
        <span class="shop-item-preview">🌅</span>
        <div class="shop-item-name">기본 배경</div>
        <div class="shop-item-desc">따뜻한 오후</div>
        <button class="shop-btn equipped-btn" onclick="equipBg(this,'#FFF0E8','#FFE0C8','기본 배경')">장착됨 ✓</button>
      </div>
      <div class="shop-card" data-item="bg2">
        <span class="shop-item-preview">🌊</span>
        <div class="shop-item-name">해변 배경</div>
        <div class="shop-item-desc">시원한 바다</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">400P</span></div>
        <button class="shop-btn buy" onclick="buyBg(this,'#E8F5FF','#B0D8FF',400,'해변 배경')">구매하기</button>
      </div>
      <div class="shop-card" data-item="bg3">
        <div class="new-badge" style="background:var(--teal)">NEW</div>
        <span class="shop-item-preview">🌃</span>
        <div class="shop-item-name">야경 배경</div>
        <div class="shop-item-desc">반짝이는 밤하늘</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">500P</span></div>
        <button class="shop-btn buy" onclick="buyBg(this,'#1a1a3e','#2a0a4e',500,'야경 배경')">구매하기</button>
      </div>
      <div class="shop-card" data-item="bg4">
        <span class="shop-item-preview">🌸</span>
        <div class="shop-item-name">벚꽃 배경</div>
        <div class="shop-item-desc">봄날의 공원</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">450P</span></div>
        <button class="shop-btn buy" onclick="buyBg(this,'#FFE8F0','#FFCCE0',450,'벚꽃 배경')">구매하기</button>
      </div>
      <div class="shop-card" data-item="bg5">
        <span class="shop-item-preview">🌿</span>
        <div class="shop-item-name">숲속 배경</div>
        <div class="shop-item-desc">신선한 초록</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">350P</span></div>
        <button class="shop-btn buy" onclick="buyBg(this,'#E8F5E8','#C0E0C0',350,'숲속 배경')">구매하기</button>
      </div>
      <div class="shop-card" data-item="bg6">
        <span class="shop-item-preview">🏜️</span>
        <div class="shop-item-name">사막 배경</div>
        <div class="shop-item-desc">모험을 떠나요</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">420P</span></div>
        <button class="shop-btn buy" onclick="buyBg(this,'#FFF0C0','#FFD870',420,'사막 배경')">구매하기</button>
      </div>
    </div>

    <!-- GROUND -->
    <div class="shop-grid" id="shop-ground" style="display:none">
      <div class="shop-card owned">
        <span class="shop-item-preview">🟤</span>
        <div class="shop-item-name">기본 바닥</div>
        <div class="shop-item-desc">포근한 흙길</div>
        <button class="shop-btn equipped-btn">장착됨 ✓</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">🌱</span>
        <div class="shop-item-name">잔디 바닥</div>
        <div class="shop-item-desc">초록 잔디밭</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">200P</span></div>
        <button class="shop-btn buy" onclick="buyGround(this,'#7BC67E',200,'잔디 바닥')">구매하기</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">🏖️</span>
        <div class="shop-item-name">모래 바닥</div>
        <div class="shop-item-desc">해변 모래사장</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">250P</span></div>
        <button class="shop-btn buy" onclick="buyGround(this,'#F5DEB3',250,'모래 바닥')">구매하기</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">❄️</span>
        <div class="shop-item-name">눈 바닥</div>
        <div class="shop-item-desc">폭신폭신 눈밭</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">300P</span></div>
        <button class="shop-btn buy" onclick="buyGround(this,'#D0ECFF',300,'눈 바닥')">구매하기</button>
      </div>
    </div>

    <!-- EFFECTS -->
    <div class="shop-grid" id="shop-effect" style="display:none">
      <div class="shop-card">
        <div class="new-badge" style="background:var(--teal)">NEW</div>
        <span class="shop-item-preview">🌈</span>
        <div class="shop-item-name">무지개 효과</div>
        <div class="shop-item-desc">쓰다듬을 때 빛남</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">600P</span></div>
        <button class="shop-btn buy" onclick="showToast('준비 중인 아이템이에요 🔧')">구매하기</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">💫</span>
        <div class="shop-item-name">별똥별 효과</div>
        <div class="shop-item-desc">밤하늘의 별</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">550P</span></div>
        <button class="shop-btn buy" onclick="showToast('준비 중인 아이템이에요 🔧')">구매하기</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">🔥</span>
        <div class="shop-item-name">불꽃 효과</div>
        <div class="shop-item-desc">강렬한 에너지</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">700P</span></div>
        <button class="shop-btn buy" onclick="showToast('준비 중인 아이템이에요 🔧')">구매하기</button>
      </div>
      <div class="shop-card">
        <span class="shop-item-preview">💝</span>
        <div class="shop-item-name">하트 효과</div>
        <div class="shop-item-desc">사랑이 넘쳐요</div>
        <div class="shop-price"><span class="shop-price-icon">🪙</span><span class="shop-price-val">480P</span></div>
        <button class="shop-btn buy" onclick="showToast('준비 중인 아이템이에요 🔧')">구매하기</button>
      </div>
    </div>

    <div class="spacer"></div>
  </div><!-- /view-shop -->

  </div><!-- /scroll-area -->

  <!-- ── BOTTOM NAV ── -->
  <div class="bottom-nav">
    <button class="bnav-item active" id="bnav-pet"    onclick="switchView('pet')">   <span class="bnav-icon">🐾</span><span class="bnav-label">내 펫</span><div class="bnav-dot"></div></button>
    <button class="bnav-item"        id="bnav-order"  onclick="showToast('주문 화면으로 이동!')"><span class="bnav-icon">🍱</span><span class="bnav-label">주문</span><div class="bnav-dot"></div></button>
    <button class="bnav-item"        id="bnav-rank"   onclick="switchView('rank')">  <span class="bnav-icon">🏆</span><span class="bnav-label">랭킹</span><div class="bnav-dot"></div></button>
    <button class="bnav-item"        id="bnav-shop"   onclick="switchView('shop')">  <span class="bnav-icon">🛍️</span><span class="bnav-label">상점</span><div class="bnav-dot"></div></button>
    <button class="bnav-item"        id="bnav-reward" onclick="switchView('reward')"><span class="bnav-icon">🎁</span><span class="bnav-label">보상</span><div class="bnav-dot"></div></button>
  </div>

  <!-- TOAST -->
  <div class="toast" id="toast"></div>

  <!-- POINTS POPUP -->
  <div class="pts-popup" id="pts-popup">
    <div class="pts-popup-emoji" id="pts-popup-emoji">🎉</div>
    <div class="pts-popup-title" id="pts-popup-title">포인트 획득!</div>
    <div class="pts-popup-pts" id="pts-popup-pts">+100P</div>
    <div class="pts-popup-sub" id="pts-popup-sub">포인트로 펫을 꾸며보세요</div>
  </div>

  <!-- ATTENDANCE MODAL -->
  <div class="modal-overlay" id="attendanceOverlay" onclick="closeAttendance(event)">
    <div class="modal-sheet" id="attendanceSheet">
      <div class="sheet-handle"></div>
      <div class="sheet-title">📅 출석 달력</div>
      <div class="sheet-sub">출석할수록 더 많은 포인트를 받아요!</div>

      <div class="att-streak-info">
        <div>
          <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:2px">🔥 연속 출석</div>
          <div style="display:flex;align-items:baseline;gap:4px">
            <span class="att-streak-num" id="att-streak-num">12</span>
            <span style="font-size:14px;font-weight:800;color:var(--orange)">일째</span>
          </div>
        </div>
        <div style="flex:1;text-align:right">
          <div class="att-streak-text">이번 달 출석: <span id="att-month-count">12</span>일</div>
          <div class="att-streak-sub">연속 7일 달성 시 200P 보너스!</div>
        </div>
      </div>

      <!-- 누적 출석 보상 -->
      <div style="font-size:11px;font-weight:700;margin-bottom:7px;color:var(--text)">🎁 누적 출석 보상</div>
      <div class="att-rewards">
        <div class="att-reward-item"><div class="att-day-num">1일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">2일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">3일</div><div class="att-day-box done"><span class="att-reward-emoji">🧡</span><span class="att-reward-pts">+50P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">4일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">5일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">6일</div><div class="att-day-box done"><span class="att-reward-emoji">🧡</span><span class="att-reward-pts">+50P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">7일</div><div class="att-day-box done special"><span class="att-reward-emoji">🎁</span><span class="att-reward-pts">+200P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">8일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">9일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">10일</div><div class="att-day-box done special"><span class="att-reward-emoji">✨</span><span class="att-reward-pts">+100P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">11일</div><div class="att-day-box done"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">12일</div><div class="att-day-box today-box"><span class="att-reward-emoji">🪙</span><span class="att-reward-pts">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">13일</div><div class="att-day-box"><span class="att-reward-emoji" style="font-size:14px;opacity:.4">🪙</span><span class="att-reward-pts" style="opacity:.4">+30P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">14일</div><div class="att-day-box"><span class="att-reward-emoji" style="font-size:14px;opacity:.4">🧡</span><span class="att-reward-pts" style="opacity:.4">+50P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">15일</div><div class="att-day-box"><span class="att-reward-emoji" style="font-size:14px;opacity:.4">✨</span><span class="att-reward-pts" style="opacity:.4">+100P</span></div></div>
        <div class="att-reward-item"><div class="att-day-num">30일</div><div class="att-day-box special"><span class="att-reward-emoji" style="opacity:.5">🎖️</span><span class="att-reward-pts" style="opacity:.5">+500P</span></div></div>
      </div>

      <!-- Monthly calendar -->
      <div class="cal-month-nav">
        <button class="cal-nav-btn" onclick="changeCalMonth(-1)">‹</button>
        <div class="cal-month-label" id="cal-month-label">2025년 6월</div>
        <button class="cal-nav-btn" onclick="changeCalMonth(1)">›</button>
      </div>
      <div class="cal-grid" id="cal-grid"></div>

      <button class="att-checkin-btn" id="att-checkin-btn" onclick="doCheckIn()">오늘 출석 체크하기 ✅</button>
    </div>
  </div>

  <!-- PET SELECT -->
  <div class="pet-select-overlay" id="petSelectOverlay" onclick="closePetSelect(event)">
    <div class="pet-select-sheet">
      <div class="sheet-handle"></div>
      <div class="sheet-title" style="font-size:15px">✨ 나의 펫 선택</div>
      <div class="pet-options">
        <div class="pet-option selected" onclick="selectPet(this,'🐱','모찌')"><span class="pet-option-emoji">🐱</span><div class="pet-option-name">고양이</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐶','댕댕이')"><span class="pet-option-emoji">🐶</span><div class="pet-option-name">강아지</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐰','토순이')"><span class="pet-option-emoji">🐰</span><div class="pet-option-name">토끼</div></div>
        <div class="pet-option" onclick="selectPet(this,'🦊','여우')"><span class="pet-option-emoji">🦊</span><div class="pet-option-name">여우</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐹','햄찌')"><span class="pet-option-emoji">🐹</span><div class="pet-option-name">햄스터</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐻','곰돌이')"><span class="pet-option-emoji">🐻</span><div class="pet-option-name">곰</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐸','개구리')"><span class="pet-option-emoji">🐸</span><div class="pet-option-name">개구리</div></div>
        <div class="pet-option" onclick="selectPet(this,'🐼','판다')"><span class="pet-option-emoji">🐼</span><div class="pet-option-name">판다</div></div>
      </div>
      <button class="select-confirm-btn" onclick="confirmPetSelect()">이 친구로 결정! 🎉</button>
    </div>
  </div>

</div>
</templete>

<script>
// ── STATE ──────────────────────────────────────────
let intimacy = 720, maxIntimacy = 1000, level = 5, meals = 28;
let points = 4280;
let streak = 12, monthAttCount = 12;
let selectedPetEmoji = '🐱', selectedPetName = '모찌';
let tempEmoji = '🐱', tempName = '모찌';
let equippedAcc = '🎩';
let checkedInToday = true; // already checked in for demo

// Pat cooldown: 30 min = 1800000 ms. For demo, stored as timestamp.
let patCooldownUntil = 0;
let patTimerInterval = null;
let toastTimer, popupTimer;

// Calendar state
const today = new Date(2025, 5, 12); // June 12 2025
let calYear = today.getFullYear(), calMonth = today.getMonth();
// Which days in current demo month the user attended (1-indexed)
const attendedDays = new Set([1,2,3,4,5,6,7,8,9,10,11,12]);

// ── VIEW SWITCHING ──────────────────────────────────
const viewIds = ['pet','rank','reward','shop'];
const bnavIds = {pet:'bnav-pet',rank:'bnav-rank',reward:'bnav-reward',shop:'bnav-shop'};
const navTabMap = {pet:0,rank:1,reward:2};

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (bnavIds[name]) document.getElementById(bnavIds[name]).classList.add('active');
  document.querySelector('.scroll-area').scrollTop = 0;
}

// ── POINTS ──────────────────────────────────────────
function addPoints(amount, reason) {
  points += amount;
  updateAllPointsUI();
  showPointsPopup(amount, reason);
  addHistoryEntry(reason, '+' + amount + 'P');
}
function updateAllPointsUI() {
  const fmt = points.toLocaleString();
  document.getElementById('top-pts-val').textContent = fmt;
  document.getElementById('reward-pts-val').textContent = fmt;
  document.getElementById('shop-pts-val').textContent = fmt;
}
function spendPoints(amount) {
  if (points < amount) return false;
  points -= amount;
  updateAllPointsUI();
  return true;
}
function showPointsPopup(amount, reason) {
  const p = document.getElementById('pts-popup');
  document.getElementById('pts-popup-pts').textContent = '+' + amount + 'P';
  document.getElementById('pts-popup-sub').textContent = reason;
  if (amount >= 500) { document.getElementById('pts-popup-emoji').textContent = '🎉'; document.getElementById('pts-popup-title').textContent = '보너스 포인트!'; }
  else if (amount >= 200) { document.getElementById('pts-popup-emoji').textContent = '🌟'; document.getElementById('pts-popup-title').textContent = '포인트 획득!'; }
  else { document.getElementById('pts-popup-emoji').textContent = '🪙'; document.getElementById('pts-popup-title').textContent = '포인트 획득!'; }
  p.classList.add('show');
  clearTimeout(popupTimer);
  popupTimer = setTimeout(() => p.classList.remove('show'), 2000);
}
function addHistoryEntry(name, value) {
  const hist = document.getElementById('points-history');
  const now = new Date();
  const dateStr = now.getFullYear() + '.' + String(now.getMonth()+1).padStart(2,'0') + '.' + String(now.getDate()).padStart(2,'0');
  const item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `<div class="history-icon">🪙</div><div class="history-info"><div class="history-name">${name}</div><div class="history-date">${dateStr}</div></div><div class="history-value">${value}</div>`;
  hist.insertBefore(item, hist.firstChild);
}

// ── PAT WITH 30-MIN COOLDOWN ──────────────────────
function petPat() {
  const now = Date.now();
  if (now < patCooldownUntil) {
    const remain = patCooldownUntil - now;
    const m = Math.floor(remain / 60000), s = Math.floor((remain % 60000) / 1000);
    showToast('⏱️ 쓰다듬기 쿨타임: ' + m + '분 ' + s + '초 남음');
    return;
  }
  // Set 30-min cooldown
  patCooldownUntil = now + 30 * 60 * 1000;
  startPatCooldownTimer();

  intimacy = Math.min(maxIntimacy, intimacy + 5);
  updateIntimacyUI();
  showToast(selectedPetName + '가 기뻐해요! +5 친밀도 💕');

  const el = document.getElementById('pet-emoji');
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 500);

  if (intimacy >= maxIntimacy) setTimeout(levelUp, 600);
}

function startPatCooldownTimer() {
  clearInterval(patTimerInterval);
  const btn = document.getElementById('pat-btn');
  const cdLabel = document.getElementById('pat-cooldown-label');
  const rdLabel = document.getElementById('pat-ready-label');
  btn.classList.add('cooling');
  rdLabel.style.display = 'none';
  cdLabel.style.display = 'block';

  patTimerInterval = setInterval(() => {
    const remain = patCooldownUntil - Date.now();
    if (remain <= 0) {
      clearInterval(patTimerInterval);
      btn.classList.remove('cooling');
      cdLabel.style.display = 'none';
      rdLabel.style.display = 'block';
      return;
    }
    const m = Math.floor(remain / 60000), s = Math.floor((remain % 60000) / 1000);
    cdLabel.textContent = m + ':' + String(s).padStart(2,'0') + ' 후 가능';
  }, 1000);
}

// ── INTIMACY / SNACK / LEVELUP ──────────────────────
function updateIntimacyUI() {
  const pct = Math.min(100, Math.round(intimacy / maxIntimacy * 100));
  document.getElementById('intimacy-bar').style.width = pct + '%';
  document.getElementById('intimacy-display').textContent = intimacy + ' / ' + maxIntimacy;
  document.getElementById('levelup-remain').textContent = maxIntimacy - intimacy;
  document.getElementById('stat-intimacy').textContent = intimacy;
}
function giveSnack() {
  intimacy = Math.min(maxIntimacy, intimacy + 20);
  meals++;
  updateIntimacyUI();
  document.getElementById('stat-meals').textContent = meals;
  showToast('🍔 간식을 줬어요! +20 친밀도');
  if (intimacy >= maxIntimacy) setTimeout(levelUp, 600);
}
function levelUp() {
  level++;
  intimacy = 0;
  maxIntimacy = Math.round(maxIntimacy * 1.3);
  document.getElementById('pet-level-badge').textContent = 'Lv.' + level;
  const petEl = document.getElementById('pet-emoji');
  const newSize = Math.min(88 + (level - 5) * 4, 120);
  petEl.style.fontSize = newSize + 'px';
  updateIntimacyUI();
  showToast('🎉 레벨업! Lv.' + level + ' 달성!');
  const pts = level * 100;
  setTimeout(() => addPoints(pts, 'Lv.' + level + ' 달성 보상'), 600);
}

// ── ATTENDANCE ──────────────────────────────────────
function openAttendance() {
  renderCalendar();
  document.getElementById('att-streak-num').textContent = streak;
  document.getElementById('att-month-count').textContent = monthAttCount;
  const btn = document.getElementById('att-checkin-btn');
  if (checkedInToday) { btn.disabled = true; btn.textContent = '오늘 출석 완료 ✅'; }
  else { btn.disabled = false; btn.textContent = '오늘 출석 체크하기 ✅'; }
  document.getElementById('attendanceOverlay').classList.add('open');
}
function closeAttendance(e) {
  if (e.target === document.getElementById('attendanceOverlay'))
    document.getElementById('attendanceOverlay').classList.remove('open');
}

function doCheckIn() {
  if (checkedInToday) return;
  checkedInToday = true;
  streak++;
  monthAttCount++;
  attendedDays.add(today.getDate());
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('att-streak-num').textContent = streak;
  document.getElementById('att-month-count').textContent = monthAttCount;
  const btn = document.getElementById('att-checkin-btn');
  btn.disabled = true; btn.textContent = '오늘 출석 완료 ✅';
  renderCalendar();

  let pts = 30, reason = '일일 출석 체크';
  if (streak % 7 === 0) { pts = 200; reason = streak + '일 연속 출석 보너스!'; }
  else if (streak % 10 === 0) { pts = 100; reason = streak + '일 누적 출석 보상!'; }
  addPoints(pts, reason);
  showToast('출석 완료! +' + pts + 'P 획득 🎉');
}

// ── CALENDAR RENDER ──────────────────────────────────
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const DOWS = ['일','월','화','수','목','금','토'];

function changeCalMonth(d) { calMonth += d; if(calMonth<0){calMonth=11;calYear--} if(calMonth>11){calMonth=0;calYear++} renderCalendar(); }

function renderCalendar() {
  document.getElementById('cal-month-label').textContent = calYear + '년 ' + MONTHS[calMonth];
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  DOWS.forEach(d => { const el=document.createElement('div'); el.className='cal-dow'; el.textContent=d; grid.appendChild(el); });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  for (let i=0;i<firstDay;i++) { const el=document.createElement('div'); el.className='cal-day empty'; el.textContent=''; grid.appendChild(el); }
  for (let d=1; d<=daysInMonth; d++) {
    const el = document.createElement('div'); el.className = 'cal-day';
    el.textContent = d;
    const isToday = (calYear===today.getFullYear() && calMonth===today.getMonth() && d===today.getDate());
    const isFuture = new Date(calYear,calMonth,d) > today;
    const isAttended = (calYear===today.getFullYear() && calMonth===today.getMonth() && attendedDays.has(d));
    if (isAttended) el.classList.add('attended');
    else if (isToday) el.classList.add('today');
    else if (isFuture) el.classList.add('future');
    grid.appendChild(el);
  }
}

// ── RANKING ──────────────────────────────────────────
function switchRankTab(btn, name) {
  document.querySelectorAll('.rtab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  showToast(name + ' 랭킹 불러오는 중...');
}

// ── REWARDS ──────────────────────────────────────────
function claimReward(btn) {
  btn.textContent='수령완료'; btn.className='claim-btn done';
  btn.closest('.reward-card').classList.remove('claimable');
  showToast('🎁 보상 수령 완료! 쿠폰함을 확인하세요');
}

// ── SHOP ──────────────────────────────────────────────
function switchShopTab(btn, type) {
  document.querySelectorAll('.shop-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('shop-acc').style.display   = type==='acc'   ?'grid':'none';
  document.getElementById('shop-bg').style.display    = type==='bg'    ?'grid':'none';
  document.getElementById('shop-ground').style.display= type==='ground'?'grid':'none';
  document.getElementById('shop-effect').style.display= type==='effect'?'grid':'none';
}

function buyItem(btn, type, emoji, price, name) {
  if (!spendPoints(price)) { showToast('포인트가 부족해요 🪙'); return; }
  btn.textContent = '장착하기';
  btn.className = 'shop-btn equip';
  btn.onclick = function() { equipItem(this, type, emoji); };
  btn.closest('.shop-card').querySelector('.shop-price').style.display='none';
  showToast('✅ ' + name + ' 구매 완료!');
  addHistoryEntry(name + ' 구매', '-' + price + 'P');
}

function equipItem(btn, type, emoji) {
  // un-equip all acc cards
  document.querySelectorAll('#shop-acc .shop-btn').forEach(b => {
    if (b.classList.contains('equipped-btn')) { b.textContent='장착하기'; b.className='shop-btn equip'; b.onclick=function(){equipItem(this,'acc',b.closest('.shop-card').dataset.emoji||emoji);}; }
  });
  btn.textContent = '장착됨 ✓'; btn.className = 'shop-btn equipped-btn';
  equippedAcc = emoji;
  const acc = document.getElementById('pet-accessory');
  if (emoji === '') { acc.style.display='none'; }
  else { acc.textContent = emoji; acc.style.display='block'; }
  showToast('✨ 액세서리 장착 완료!');
  // remove new-badge from equipped card
  const nb = btn.closest('.shop-card').querySelector('.new-badge');
  if (nb) nb.textContent = '장착중';
}

function buyBg(btn, bgColor, groundColor, price, name) {
  if (!spendPoints(price)) { showToast('포인트가 부족해요 🪙'); return; }
  btn.textContent='장착하기'; btn.className='shop-btn equip';
  btn.onclick = function() { equipBg(this, bgColor, groundColor, name); };
  btn.closest('.shop-card').querySelector('.shop-price').style.display='none';
  showToast('✅ ' + name + ' 구매 완료!');
  addHistoryEntry(name + ' 구매', '-' + price + 'P');
}
function equipBg(btn, bgColor, groundColor, name) {
  document.querySelectorAll('#shop-bg .shop-btn').forEach(b => {
    if (b.classList.contains('equipped-btn')) { b.textContent='장착하기'; b.className='shop-btn equip'; }
  });
  btn.textContent='장착됨 ✓'; btn.className='shop-btn equipped-btn';
  document.getElementById('pet-scene-bg').style.background = 'linear-gradient(180deg, ' + bgColor + ' 0%, ' + bgColor + '88 100%)';
  document.getElementById('pet-ground').style.background = groundColor;
  showToast('🌄 배경 장착 완료!');
}

function buyGround(btn, color, price, name) {
  if (!spendPoints(price)) { showToast('포인트가 부족해요 🪙'); return; }
  btn.textContent='장착하기'; btn.className='shop-btn equip';
  btn.onclick = function() {
    document.querySelectorAll('#shop-ground .shop-btn').forEach(b=>{if(b.classList.contains('equipped-btn')){b.textContent='장착하기';b.className='shop-btn equip';}});
    btn.textContent='장착됨 ✓'; btn.className='shop-btn equipped-btn';
    document.getElementById('pet-ground').style.background = color;
    showToast('🌿 바닥 장착 완료!');
  };
  btn.closest('.shop-card').querySelector('.shop-price').style.display='none';
  showToast('✅ ' + name + ' 구매 완료!');
  addHistoryEntry(name + ' 구매', '-' + price + 'P');
}

// ── PET SELECT ──────────────────────────────────────
function openPetSelect() { document.getElementById('petSelectOverlay').classList.add('open'); }
function closePetSelect(e) { if(e.target===document.getElementById('petSelectOverlay')) document.getElementById('petSelectOverlay').classList.remove('open'); }
function selectPet(el, emoji, name) {
  document.querySelectorAll('.pet-option').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected'); tempEmoji=emoji; tempName=name;
}
function confirmPetSelect() {
  selectedPetEmoji=tempEmoji; selectedPetName=tempName;
  document.getElementById('pet-emoji').textContent=selectedPetEmoji;
  document.getElementById('pet-display-name').textContent=selectedPetName;
  document.getElementById('petSelectOverlay').classList.remove('open');
  showToast(selectedPetEmoji + ' ' + selectedPetName + '(이)가 내 펫이 됐어요!');
}

// ── TOAST ────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ── INIT ─────────────────────────────────────────────
renderCalendar();
// Equip default accessory
const accEl = document.getElementById('pet-accessory');
accEl.textContent = equippedAcc; accEl.style.display = 'block';
</script>

export const popoverCss = `
:host{
  --sr-text-primary:rgba(17,24,39,.94);
  --sr-text-secondary:rgba(75,85,99,.62);
  --sr-accent:#2459d6;
  --sr-danger:rgba(145,32,24,.88);
  --sr-sans:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  --sr-serif:Georgia,"Times New Roman",serif;
  color:var(--sr-text-primary);
}
*{box-sizing:border-box}
[hidden]{display:none!important}
button{font:inherit}
.sr-trigger{
  pointer-events:auto;
  position:fixed;
  width:34px;
  height:34px;
  padding:0;
  border:1px solid rgba(255,255,255,.18);
  border-radius:11px;
  background:rgba(24,24,27,.88);
  -webkit-backdrop-filter:blur(10px) saturate(120%);
  backdrop-filter:blur(10px) saturate(120%);
  color:rgba(255,255,255,.96);
  font:600 13px/32px var(--sr-sans);
  text-align:center;
  cursor:pointer;
  box-shadow:0 8px 20px rgba(15,23,42,.18),0 1px 0 rgba(255,255,255,.18) inset;
  animation:sr-trigger-in 120ms ease-out;
  transition:transform 120ms ease,background 120ms ease;
}
.sr-trigger:hover{transform:translateY(-1px);background:rgba(17,17,20,.94)}
.sr-trigger:focus-visible{outline:2px solid rgba(36,89,214,.72);outline-offset:2px}
.sr-popover{
  pointer-events:auto;
  isolation:isolate;
  position:fixed;
  width:min(clamp(440px,29vw,500px),calc(100vw - 24px));
  max-width:500px;
  min-height:190px;
  max-height:min(620px,calc(100vh - 32px));
  margin:0;
  padding:0;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.64);
  border-radius:18px;
  background:rgba(252,252,250,.97);
  color:var(--sr-text-primary);
  box-shadow:0 16px 40px rgba(15,23,42,.11),0 3px 10px rgba(15,23,42,.05),inset 0 1px 0 rgba(255,255,255,.72);
  font:14px/1.65 var(--sr-sans);
  animation:sr-popover-in 180ms cubic-bezier(.2,.8,.2,1);
}
@supports ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){
  .sr-popover{
    background:rgba(252,252,250,.88);
    -webkit-backdrop-filter:blur(18px) saturate(120%);
    backdrop-filter:blur(18px) saturate(120%);
  }
}
.sr-popover::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  border-radius:inherit;
  background:linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.08) 24%,rgba(255,255,255,0) 50%);
  opacity:.66;
  pointer-events:none;
}
.sr-popover::after{
  content:"";
  position:absolute;
  top:-70px;
  left:-50px;
  z-index:0;
  width:220px;
  height:120px;
  border-radius:50%;
  background:rgba(255,255,255,.20);
  filter:blur(34px);
  opacity:.34;
  pointer-events:none;
}
.sr-header,.sr-body{position:relative;z-index:1}
.sr-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  height:50px;
  padding:0 14px 0 18px;
  border-bottom:1px solid rgba(255,255,255,.48);
  background:rgba(255,255,255,.20);
  box-shadow:0 1px 0 rgba(15,23,42,.035);
  cursor:grab;
  user-select:none;
  touch-action:none;
}
.sr-dragging{animation:none}
.sr-dragging .sr-header{cursor:grabbing}
.sr-title{color:rgba(17,24,39,.92);font-size:14px;font-weight:650;letter-spacing:.01em}
.sr-tools{display:flex;gap:6px}
.sr-icon{
  height:30px;
  min-width:32px;
  padding:0 10px;
  border:1px solid transparent;
  border-radius:9px;
  background:transparent;
  color:rgba(55,65,81,.68);
  font-size:12px;
  font-weight:500;
  cursor:pointer;
  transition:background 140ms ease,border-color 140ms ease,color 140ms ease,transform 140ms ease;
}
.sr-icon:hover{border-color:rgba(255,255,255,.42);background:rgba(255,255,255,.40);color:rgba(17,24,39,.92)}
.sr-icon:active{background:rgba(255,255,255,.52);transform:translateY(.5px)}
.sr-icon:focus-visible,.sr-action:focus-visible{outline:2px solid rgba(36,89,214,.62);outline-offset:1px}
.sr-body{
  min-height:140px;
  max-height:calc(min(620px,calc(100vh - 32px)) - 50px);
  padding:18px 18px 20px;
  overflow-x:hidden;
  overflow-y:auto;
  scrollbar-gutter:stable;
  scrollbar-width:thin;
  scrollbar-color:rgba(71,85,105,.16) transparent;
}
.sr-body::-webkit-scrollbar{width:4px}
.sr-body::-webkit-scrollbar-track{background:transparent}
.sr-body::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(71,85,105,.16)}
.sr-body::-webkit-scrollbar-thumb:hover{background:rgba(71,85,105,.25)}
.sr-status{
  display:flex;
  align-items:center;
  min-height:90px;
  padding:0;
  color:rgba(75,85,99,.66);
  font-size:13px;
}
.sr-dots{letter-spacing:.12em;animation:sr-fade 1600ms ease-in-out infinite}
.sr-error{
  padding:12px 14px;
  border:1px solid rgba(180,35,24,.11);
  border-radius:12px;
  background:rgba(180,35,24,.055);
  color:var(--sr-danger);
  line-height:1.65;
}
.sr-section{margin:0;padding:2px 2px 0}
.sr-section+.sr-section{margin-top:18px}
.sr-section-chinese{
  padding:14px 15px;
  border:1px solid rgba(255,255,255,.24);
  border-radius:12px;
  background:rgba(255,255,255,.18);
}
.sr-section-summary{padding-top:16px;border-top:1px solid rgba(255,255,255,.36)}
.sr-section-english{padding-top:16px;border-top:1px solid rgba(255,255,255,.28)}
.sr-label{
  margin:0 0 8px;
  color:rgba(75,85,99,.62);
  font-size:11px;
  font-weight:600;
  letter-spacing:.06em;
}
.sr-section-english .sr-label{color:rgba(75,85,99,.58)}
.sr-chinese{margin:0;color:rgba(17,24,39,.95);font-size:16px;font-weight:520;line-height:1.82;letter-spacing:.01em;white-space:pre-line}
.sr-english{margin:0;color:rgba(31,41,55,.68);font:400 14.5px/1.72 var(--sr-serif)}
.sr-summary{margin:0;color:rgba(55,65,81,.78);font-size:14px;line-height:1.75}
.sr-actions{display:flex;gap:8px;margin-top:20px}
.sr-action{
  height:36px;
  padding:0 14px;
  border:1px solid rgba(255,255,255,.38);
  border-radius:10px;
  background:rgba(255,255,255,.18);
  color:rgba(55,65,81,.78);
  font:500 13px var(--sr-sans);
  cursor:pointer;
  transition:background 140ms ease,border-color 140ms ease,transform 140ms ease;
}
.sr-action:hover{border-color:rgba(255,255,255,.52);background:rgba(255,255,255,.38)}
.sr-action:active{transform:translateY(.5px)}
.sr-action-primary{border-color:rgba(36,89,214,.16);background:rgba(36,89,214,.09);color:var(--sr-accent);font-weight:600}
.sr-action-primary:hover{border-color:rgba(36,89,214,.24);background:rgba(36,89,214,.14)}
.sr-action:disabled{opacity:.5;cursor:default}
.sr-analysis{
  margin-top:20px;
  padding-top:16px;
  border-top:1px solid rgba(255,255,255,.36);
  animation:sr-content-in 180ms ease-out;
}
.sr-analysis-title,.sr-learning-heading{color:rgba(17,24,39,.90);font-size:13px;font-weight:650}
.sr-analysis-title{margin:0 0 8px}
.sr-learning-heading{margin:20px 0 4px}
.sr-sentence-frame{padding:12px 0 16px;border-bottom:1px solid rgba(71,85,105,.09)}
.sr-sentence-frame+.sr-sentence-frame{padding-top:16px}
.sr-sentence-source,.sr-learning-source{
  margin:0;
  overflow-wrap:anywhere;
  color:rgba(31,41,55,.76);
  font:400 13.5px/1.65 var(--sr-serif);
}
.sr-sentence-source{margin-bottom:12px}
.sr-skeleton-grid{display:grid;grid-template-columns:88px minmax(0,1fr);gap:8px 12px;margin:0}
.sr-skeleton-grid dt{color:rgba(75,85,99,.60);font-size:11px;font-weight:600}
.sr-skeleton-grid dd{min-width:0;margin:0;overflow-wrap:anywhere;color:rgba(31,41,55,.82);font:400 13.5px/1.65 var(--sr-serif)}
.sr-accordion{width:100%}
.sr-accordion-item{border-bottom:1px solid rgba(71,85,105,.09)}
.sr-accordion-trigger{
  display:grid;
  grid-template-columns:auto minmax(0,1fr) auto auto;
  align-items:center;
  width:100%;
  min-height:54px;
  padding:13px 0;
  border:0;
  background:transparent;
  color:inherit;
  text-align:left;
  cursor:pointer;
}
.sr-accordion-trigger:hover .sr-accordion-title{color:rgba(17,24,39,.98)}
.sr-accordion-trigger:focus-visible{outline:2px solid rgba(36,89,214,.45);outline-offset:2px;border-radius:6px}
.sr-accordion-index{align-self:start;width:30px;padding-top:2px;color:rgba(75,85,99,.45);font-size:11px;font-variant-numeric:tabular-nums}
.sr-accordion-heading{display:flex;min-width:0;flex-direction:column;gap:2px}
.sr-accordion-title{overflow-wrap:anywhere;color:rgba(17,24,39,.90);font-size:13px;font-weight:650;line-height:1.45}
.sr-accordion-subtitle{overflow-wrap:anywhere;color:rgba(75,85,99,.56);font-size:11px;font-weight:400;line-height:1.45}
.sr-accordion-meta{align-self:start;margin-left:12px;padding-top:2px;color:rgba(75,85,99,.56);font-size:11px}
.sr-accordion-arrow{display:block;margin-left:12px;color:rgba(75,85,99,.48);font-size:16px;line-height:1;transition:transform 160ms ease}
.sr-accordion-trigger[aria-expanded="true"] .sr-accordion-arrow{transform:rotate(180deg)}
.sr-accordion-panel{padding:0 0 16px 30px;animation:sr-learning-in 170ms ease-out}
.sr-learning-field+.sr-learning-field{margin-top:12px}
.sr-learning-label{margin-bottom:4px;color:rgba(75,85,99,.58);font-size:11px;font-weight:600;letter-spacing:.02em}
.sr-learning-copy{overflow-wrap:anywhere;color:rgba(31,41,55,.82);font-size:13.5px;line-height:1.75}
.sr-breakdown-row,.sr-collocation-row{padding:8px 0}
.sr-breakdown-row+.sr-breakdown-row,.sr-collocation-row+.sr-collocation-row{border-top:1px solid rgba(71,85,105,.07)}
.sr-breakdown-row .sr-learning-copy,.sr-collocation-row .sr-learning-copy{margin-top:2px}
.sr-saved{margin:16px 0 0;color:rgba(75,85,99,.58);font-size:11px;letter-spacing:.01em}
@keyframes sr-trigger-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes sr-popover-in{from{opacity:0;transform:translateY(8px) scale(.975)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes sr-content-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes sr-fade{0%,100%{opacity:.52}50%{opacity:1}}
@keyframes sr-learning-in{from{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:420px){
  .sr-skeleton-grid{grid-template-columns:1fr;gap:3px}
  .sr-skeleton-grid dd+dt{margin-top:8px}
  .sr-accordion-panel{padding-left:0}
}
@media(prefers-reduced-motion:reduce){
  .sr-trigger,.sr-popover,.sr-analysis,.sr-dots,.sr-accordion-panel{animation:none}
  .sr-trigger,.sr-icon,.sr-action{transition:none}
}
`;

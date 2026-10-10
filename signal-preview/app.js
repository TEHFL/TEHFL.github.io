const KEY="signalPreviewV1";
function q(id){return document.getElementById(id)}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function savePatch(p){localStorage.setItem(KEY,JSON.stringify({...load(),...p}))}
function hydrate(){const d=load();document.querySelectorAll("[data-field]").forEach(el=>{const k=el.dataset.field;if(d[k]!=null){if(el.type==="checkbox")el.checked=d[k];else el.value=d[k]}});const tri=d.triage;if(tri)document.querySelectorAll("[data-choice]").forEach(b=>b.classList.toggle("selected",b.dataset.choice===tri))}
document.addEventListener("input",e=>{if(e.target.dataset.field){const k=e.target.dataset.field;savePatch({[k]:e.target.type==="checkbox"?e.target.checked:e.target.value})}})
document.addEventListener("click",e=>{const b=e.target.closest("[data-choice]");if(!b)return;document.querySelectorAll("[data-choice]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");savePatch({triage:b.dataset.choice})})
function requireField(id,next){const el=q(id);if(!el||!el.value.trim()){el&&el.focus();return false}location.href=next;return true}
function buildSummary(){const d=load();const map={sumNotice:d.notice||"Still forming.",sumWisdom:d.wisdom||"Still forming.",sumTriage:((d.triage||"Still deciding.")+(d.why?" "+d.why:"")),sumNurture:d.nurture||"Still forming.",sumAction:d.action||"Still forming.",sumLesson:d.lesson||"Still forming."};Object.entries(map).forEach(([id,v])=>{if(q(id))q(id).textContent=v})}
function fakeRegister(){const d=load(),s=q("status");for(const k of ["first","last","email","mobile"]){if(!d[k]){s.style.display="block";s.textContent="Please complete your contact information.";return}}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)){s.style.display="block";s.textContent="Please enter a valid email address.";return}location.href="confirmation.html"}
function resetPreview(){localStorage.removeItem(KEY);location.href="index.html"}
document.addEventListener("DOMContentLoaded",()=>{hydrate();buildSummary()});

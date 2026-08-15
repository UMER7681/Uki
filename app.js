const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="uki_v1_state";
const initial={name:"Umer",tasks:[],events:[],notes:[],memories:[],messages:[]};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||initial;
const save=()=>{localStorage.setItem(KEY,JSON.stringify(state));renderAll()};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now=()=>new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
function speak(text){if(!("speechSynthesis"in window))return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); const sel=$("#voiceSelect")?.value; if(sel&&sel!=="auto"){const v=speechSynthesis.getVoices().find(x=>x.name===sel);if(v)u.voice=v;} u.rate=.98;u.pitch=1; speechSynthesis.speak(u)}
function addMessage(role,text){state.messages.push({role,text,time:now()}); if(state.messages.length>20)state.messages=state.messages.slice(-20); save();}
function reply(text){addMessage("uki",text); speak(text)}
function renderChat(){const c=$("#chat"); c.innerHTML=state.messages.map(m=>`<div class="bubble ${m.role}">${m.role==="uki"?'<strong>UKI</strong><br>':''}${esc(m.text)}<small>${esc(m.time||"")}</small></div>`).join(""); c.scrollTop=c.scrollHeight}
function renderAll(){renderChat();$("#profileName").textContent=state.name;$("#nameTitle").textContent=state.name;$("#settingsName").value=state.name;
 $("#taskCount").textContent=state.tasks.filter(t=>!t.done).length; $("#eventCount").textContent=state.events.length; $("#memoryCount").textContent=state.memories.length;
 $("#tasksList").innerHTML=state.tasks.map((t,i)=>`<div class="list-item ${t.done?"done":""}"><span>${esc(t.text)}</span><button onclick="toggleTask(${i})">${t.done?"↶":"✓"}</button></div>`).join("")||'<p class="muted">No tasks yet.</p>';
 $("#sideTasks").innerHTML=state.tasks.filter(t=>!t.done).slice(0,4).map(t=>`<div class="side-task">○ ${esc(t.text)}</div>`).join("")||'<div class="muted">No open tasks.</div>';
 $("#eventsList").innerHTML=state.events.slice().sort((a,b)=>new Date(a.time)-new Date(b.time)).map((e,i)=>`<div class="list-item"><span><b>${esc(e.text)}</b><br><small>${new Date(e.time).toLocaleString()}</small></span><button onclick="deleteEvent(${i})">×</button></div>`).join("")||'<p class="muted">No events.</p>';
 $("#notesList").innerHTML=state.notes.map((n,i)=>`<div class="list-item"><span><b>${esc(n.title)}</b><br><small>${esc(n.body.slice(0,120))}</small></span><button onclick="deleteNote(${i})">×</button></div>`).join("")||'<p class="muted">No notes.</p>';
 $("#memoryList").innerHTML=state.memories.map((m,i)=>`<div class="list-item"><span>${esc(m.text)}<br><small>${esc(m.date)}</small></span><button onclick="deleteMemory(${i})">×</button></div>`).join("")||'<p class="muted">No memories.</p>';
 const upcoming=state.events.filter(e=>new Date(e.time)>=new Date()).sort((a,b)=>new Date(a.time)-new Date(b.time))[0];
 $("#nextEvent").innerHTML=upcoming?`<strong>${esc(upcoming.text)}</strong>${new Date(upcoming.time).toLocaleString()}`:"Nothing scheduled.";
 $("#todayDate").textContent=new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});
 $("#todayCards").innerHTML=`<div class="panel"><h3>Open Tasks</h3><div class="stat"><b>${state.tasks.filter(t=>!t.done).length}</b><span>remaining</span></div></div><div class="panel"><h3>Memories</h3><p class="muted">${state.memories.length} things UKI has been asked to remember.</p></div>`;
}
function go(view){$$(".view").forEach(x=>x.classList.remove("active"));$("#view-"+view).classList.add("active");$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view))}
$$(".nav-btn").forEach(b=>b.onclick=()=>go(b.dataset.view));
function addTask(text){if(!text.trim())return;state.tasks.push({text:text.trim(),done:false});save();reply(`Added the task: ${text.trim()}.`)}
window.toggleTask=i=>{state.tasks[i].done=!state.tasks[i].done;save()};
window.deleteEvent=i=>{state.events.splice(i,1);save()};
window.deleteNote=i=>{state.notes.splice(i,1);save()};
window.deleteMemory=i=>{state.memories.splice(i,1);save()};

function agent(input){
 const q=input.trim(), l=q.toLowerCase();
 if(/^(hi|hey|hello|yo|sup)\b/.test(l)) return `Hey ${state.name}. What are we doing?`;
 if(l.includes("what time")||l==="time") return `It's ${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}.`;
 if(l.includes("what date")||l.includes("today's date")) return `Today is ${new Date().toLocaleDateString([], {weekday:"long",year:"numeric",month:"long",day:"numeric"})}.`;
 if(/^(remember|save to memory|don't forget)/.test(l)){
   let fact=q.replace(/^(remember|save to memory|don't forget)\s*/i,"").replace(/^that\s+/i,"").trim();
   if(fact){state.memories.push({text:fact,date:new Date().toLocaleDateString()});save();return `Remembered: ${fact}.`; }
 }
 if(/^(add|create|make)\s+(a\s+)?task\b/.test(l)||l.startsWith("task ")){
   let t=q.replace(/^(add|create|make)\s+(a\s+)?task\s*/i,"").replace(/^task\s*/i,"").trim(); if(t){addTask(t);return null}
 }
 if(l.includes("my tasks")||l.includes("what are my tasks")||l.includes("what do i need to do")){
   const open=state.tasks.filter(t=>!t.done); return open.length?`You have ${open.length} open task${open.length===1?"":"s"}: ${open.slice(0,5).map(t=>t.text).join("; ")}.`:"You have no open tasks.";
 }
 if(l.includes("my memories")||l.includes("what do you remember")) return state.memories.length?`I remember ${state.memories.length} thing${state.memories.length===1?"":"s"}: ${state.memories.map(m=>m.text).join("; ")}.`:"I don't have any saved memories yet.";
 if(l.startsWith("search ")||l.startsWith("google ")||l.includes("look up ")){
   const term=q.replace(/^(search|google|look up)\s*/i,"").trim(); if(term){window.open("https://www.google.com/search?q="+encodeURIComponent(term),"_blank");return `I opened a web search for ${term}. I won't pretend I've read the results yet.`}
 }
 if(l.includes("brief me")||l.includes("today overview")){
   const open=state.tasks.filter(t=>!t.done).length, ev=state.events.length; return `Brief: ${open} open task${open===1?"":"s"} and ${ev} saved event${ev===1?"":"s"}.`;
 }
 if(l.includes("help")||l.includes("what can you do")) return "I can chat, remember facts, manage local tasks and events, save notes, tell the time, and open web searches. More integrations come in V2.";
 return "I can handle that in a later version. For V1, try asking me to remember something, add a task, check your tasks, tell the time, or search the web.";
}
function send(){
 const input=$("#messageInput"), text=input.value.trim(); if(!text)return;
 addMessage("me",text); input.value="";
 const result=agent(text); if(result)reply(result);
}
$("#sendBtn").onclick=send; $("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter")send()});
$("#addTask").onclick=()=>{const x=$("#taskText");addTask(x.value);x.value=""};
$("#addEvent").onclick=()=>{if(!$("#eventText").value||!$("#eventTime").value)return;state.events.push({text:$("#eventText").value,time:$("#eventTime").value});$("#eventText").value="";$("#eventTime").value="";save()};
$("#saveNote").onclick=()=>{if(!$("#noteTitle").value)return;state.notes.push({title:$("#noteTitle").value,body:$("#noteBody").value,date:new Date().toLocaleDateString()});$("#noteTitle").value="";$("#noteBody").value="";save()};
$("#saveMemory").onclick=()=>{const x=$("#memoryText");if(x.value.trim()){state.memories.push({text:x.value.trim(),date:new Date().toLocaleDateString()});x.value="";save();reply(`Remembered: ${state.memories[state.memories.length-1].text}.`)}};
$("#webSearch").onclick=()=>{const q=$("#searchText").value.trim();if(q)window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank")};
$("#saveSettings").onclick=()=>{state.name=$("#settingsName").value.trim()||"Umer";save();reply(`Okay. I'll call you ${state.name}.`)};
$("#resetData").onclick=()=>{if(confirm("Reset all UKI local data?")){localStorage.removeItem(KEY);location.reload()}};
$("#quickVoice").onclick=()=>$("#voiceBtn").click();$("#quickTask").onclick=()=>{go("tasks");$("#taskText").focus()};$("#quickNote").onclick=()=>{go("notes");$("#noteTitle").focus()};$("#quickSearch").onclick=()=>{go("search");$("#searchText").focus()};
$("#fileInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>$("#filePreview").textContent=r.result.slice(0,12000);r.readAsText(f)};

function loadVoices(){const sel=$("#voiceSelect");sel.innerHTML='<option value="auto">Auto</option>';speechSynthesis?.getVoices().forEach(v=>{const o=document.createElement("option");o.value=v.name;o.textContent=v.name;sel.appendChild(o)})}
if("speechSynthesis"in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
let recognition=null;
$("#voiceBtn").onclick=()=>{
 if(!("webkitSpeechRecognition"in window||"SpeechRecognition"in window)){reply("Voice input isn't available in this browser. You can still type to me.");return}
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(recognition){recognition.stop();return}
 recognition=new R(); recognition.lang="en-US"; recognition.interimResults=false; recognition.maxAlternatives=1;
 $("#voiceBtn").textContent="■";
 recognition.onresult=e=>{$("#messageInput").value=e.results[0][0].transcript;send()};
 recognition.onerror=()=>reply("I couldn't access voice input. Check the browser microphone permission.");
 recognition.onend=()=>{recognition=null;$("#voiceBtn").textContent="🎙"};
 recognition.start();
};
if(!state.messages.length){state.messages=[{role:"uki",text:`Hey ${state.name}. I'm UKI V1. I run locally in this browser. Ask me to remember something, add a task, check your tasks, tell the time, or search the web.`,time:now()}];localStorage.setItem(KEY,JSON.stringify(state))}
renderAll();

'use strict';
const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
  columns:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18m6-18v18"/>',
  check:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m-11 4h4"/>',
  form:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8m-8 4h5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  briefcase:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 12h18m-10 0v3h2v-3"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 6 9 7 9-7"/>',
  phone:'<path d="M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2z"/>',
  edit:'<path d="m15 5 4 4M4 20l4-1L20 7a3 3 0 0 0-4-4L4 15z"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
};
const icon=(name)=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.grid}</svg>`;
const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(value)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',maximumFractionDigits:0}).format(value);
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateLabel=(date,full=false)=>new Intl.DateTimeFormat('en-PH',{month:full?'long':'short',day:'numeric',...(full?{year:'numeric'}:{})}).format(new Date(`${date}T12:00:00+08:00`));
const timeLabel=(time)=>new Intl.DateTimeFormat('en-PH',{hour:'numeric',minute:'2-digit'}).format(new Date(`2026-01-01T${time}:00`));
const initials=(name)=>name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();
const stages=['New lead','Contacted','Quote sent','Booked','Completed'];
const services=['Home cleaning','Deep cleaning','Move-out cleaning','Office cleaning'];
const views={overview:['Overview','grid'],contacts:['Contacts','users'],pipeline:['Pipeline','columns'],tasks:['Tasks','check'],appointments:['Appointments','calendar'],inquiry:['Inquiry form','form']};
let state=null,view='overview',contactQuery='',contactStage='All stages',taskFilter='Open',appointmentFilter='Upcoming',toastTimer;
const main=document.querySelector('#main'),dialog=document.querySelector('#editor');
const deleteDialog=document.querySelector('#delete-confirmation');
let pendingDeletion=null,deletingContact=false;
const contactById=(id)=>state.contacts.find(c=>c.id===id);
const stageBadge=(stage)=>`<span class="badge stage-${stages.indexOf(stage)}">${esc(stage)}</span>`;
const avatar=(name,idx=0)=>`<span class="contact-avatar tint-${idx%4}">${esc(initials(name))}</span>`;
const button=(label,action,kind='secondary',ico='')=>`<button class="button ${kind}" data-action="${action}">${ico?icon(ico):''}${label}</button>`;
const empty=(title,text)=>`<div class="empty-state">${icon('spark')}<strong>${title}</strong><p>${text}</p></div>`;
const apiBase=document.querySelector('meta[name="cleardesk-api"]')?.content||'';
const demoKeyName='cleardesk-demo-v1:'+apiBase;
let demoToken=null,openingDemo=null;
async function openRemoteDemo(){
 if(demoToken)return;
 if(openingDemo)return openingDemo;
 openingDemo=(async()=>{
  let saved;
  try{saved=localStorage.getItem(demoKeyName);localStorage.setItem(demoKeyName+':probe','1');localStorage.removeItem(demoKeyName+':probe');}
  catch{throw new Error('Enable browser storage so your sample workspace can be kept between visits.');}
  if(saved){if(!/^[a-f0-9]{64}$/.test(saved))throw new Error('Your saved demo key is invalid. Use another browser for a fresh sample workspace.');demoToken=saved;return;}
  // A browser-wide lock avoids two tabs creating different workspaces at once.
  const create=async()=>{
   const existing=localStorage.getItem(demoKeyName);if(existing){demoToken=existing;return;}
   const response=await fetch(apiBase+'/api/session',{method:'POST',credentials:'omit'});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Your demo could not open. Please try again.');
   if(!/^[a-f0-9]{64}$/.test(data.token))throw new Error('Your demo returned an invalid workspace key.');
   localStorage.setItem(demoKeyName,data.token);demoToken=data.token;
  };
  if(navigator.locks)await navigator.locks.request(demoKeyName,create);else await create();
 })();
 try{await openingDemo;}finally{openingDemo=null;}
}
async function request(path,method='GET',body){
 if(apiBase)await openRemoteDemo();
 const response=await fetch(apiBase+path,{method,credentials:apiBase?'omit':'same-origin',headers:{...(body?{'Content-Type':'application/json'}:{}),...(apiBase?{Authorization:'Bearer '+demoToken}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'The request could not be completed.');
 return data;
}
async function load(){
 state=await request('/api/state');
 document.querySelector('#connection-status').textContent='Your demo';
 document.querySelector('#connection-status').classList.remove('offline');
 render();
}
function toast(message){
 const el=document.querySelector('#toast');el.textContent=message;el.hidden=false;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,4200);
}
function setView(){
 view=Object.hasOwn(views,location.hash.slice(1))?location.hash.slice(1):'overview';
 document.querySelector('#breadcrumb-current').textContent=views[view][0];
 document.title=`${views[view][0]} · ClearDesk`;
 document.querySelector('#navigation').innerHTML=Object.entries(views).map(([key,[label,ico]])=>`<a href="#${key}" ${key===view?'aria-current="page"':''}>${icon(ico)}<span>${label}</span>${key==='tasks'&&state?`<span class="nav-count">${state.tasks.filter(t=>t.status==='Open').length}</span>`:''}</a>`).join('');
 closeMenu();if(state)renderContent();
}
function render(){setView()}
function pageHead(title,description,actions){return `<div class="page-heading"><div><p class="eyebrow">CLEARNEST CLEANING</p><h1>${title}</h1><p class="description">${description}</p></div><div class="heading-actions">${actions}</div></div>`}
function metrics(){
 const open=state.contacts.filter(c=>c.stage!=='Completed');
 const upcoming=state.appointments.filter(a=>a.status==='Scheduled'&&a.date>=today());
 const tasks=state.tasks.filter(t=>t.status==='Open');
 const cards=[['New leads',state.contacts.filter(c=>c.stage==='New lead').length,'Ready for a first conversation','users','blue'],['Open pipeline',money(open.reduce((sum,c)=>sum+c.value,0)),'Estimated value · not revenue','briefcase','mint'],['Upcoming visits',upcoming.length,'Scheduled from today','calendar','amber'],['Open follow-ups',tasks.length,`${tasks.filter(t=>t.dueDate<today()).length} overdue · keep things moving`,'check','violet']];
 return `<section class="metrics" aria-label="Workspace summary">${cards.map(([label,value,sub,ico,color])=>`<article class="metric"><div class="metric-label">${label}<span class="metric-icon ${color}">${icon(ico)}</span></div><strong>${value}</strong><span>${sub}</span></article>`).join('')}</section>`;
}
function contactRows(contacts){return contacts.map((c,i)=>`<tr><td><button class="person-button" data-action="contact-detail" data-id="${esc(c.id)}">${avatar(c.name,i)}<span><strong>${esc(c.name)}</strong><small>${esc(c.email)}</small></span></button></td><td>${esc(c.service)}</td><td>${stageBadge(c.stage)}</td><td class="amount">${money(c.value)}</td><td><div class="row-actions"><button class="icon-button" data-action="edit-contact" data-id="${esc(c.id)}" aria-label="Edit ${esc(c.name)}" title="Edit contact">${icon('edit')}</button><button class="icon-button delete-icon" data-action="delete-contact" data-id="${esc(c.id)}" aria-label="Delete ${esc(c.name)}" title="Delete contact">${icon('trash')}</button></div></td></tr>`).join('')}
function contactTable(contacts){return contacts.length?`<div class="table-scroll"><table><thead><tr><th>Contact</th><th>Service</th><th>Stage</th><th>Est. value</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${contactRows(contacts)}</tbody></table></div>`:empty('No contacts found','Try a different search or add a contact.');}
function taskRow(t){
 const contact=contactById(t.contactId);
 return `<div class="task-row"><button class="task-checkbox ${t.status==='Done'?'checked':''}" data-action="toggle-task" data-id="${esc(t.id)}" aria-label="${t.status==='Done'?'Reopen':'Complete'} ${esc(t.title)}" aria-pressed="${t.status==='Done'}">${t.status==='Done'?icon('check'):''}</button><div><button class="text-button ${t.status==='Done'?'task-done':''}" data-action="edit-task" data-id="${esc(t.id)}">${esc(t.title)}</button><span class="task-meta">${esc(contact?.name||'Unknown contact')} <span>·</span> <span class="${t.status==='Open'&&t.dueDate<today()?'overdue':''}">${t.dueDate===today()?'Today':dateLabel(t.dueDate)}${t.status==='Open'&&t.dueDate<today()?' · Overdue':''}</span></span></div></div>`;
}
function appointmentCard(a){
 const c=contactById(a.contactId);
 return `<button class="appointment-card" data-action="edit-appointment" data-id="${esc(a.id)}"><span class="appointment-date"><strong>${new Date(`${a.date}T12:00:00`).getDate()}</strong><span>${dateLabel(a.date).split(' ')[0]}</span></span><span class="appointment-info"><strong>${esc(c?.name||'Unknown contact')}</strong><span>${esc(c?.service||'')} · ${timeLabel(a.time)}</span><span class="appointment-status status-${a.status.toLowerCase()}">${esc(a.status)}</span></span>${icon('calendar')}</button>`;
}
function overview(){
 const upcoming=state.appointments.filter(a=>a.status==='Scheduled'&&a.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3);
 const due=state.tasks.filter(t=>t.status==='Open').sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,3);
 const max=Math.max(1,...stages.map(s=>state.contacts.filter(c=>c.stage===s).length));
 const recent=[...state.contacts].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5);
 main.innerHTML=pageHead('Your day, a little clearer.',new Intl.DateTimeFormat('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'Asia/Shanghai'}).format(new Date()),button('Refresh','refresh','secondary','refresh')+button('Add contact','add-contact','primary','plus'))+metrics()+
 `<div class="overview-grid"><div class="overview-primary"><section class="panel pipeline-summary"><div class="panel-header"><div><h2>Your pipeline</h2><p>Every conversation has a next step.</p></div><a class="text-link" href="#pipeline">View pipeline</a></div><div class="stage-chart" aria-label="Contact count by pipeline stage">${stages.map((s,i)=>{const count=state.contacts.filter(c=>c.stage===s).length;return `<a href="#pipeline" class="stage-chart-item"><div class="chart-top"><span>${s}</span><strong>${count}</strong></div><div class="chart-track"><span class="chart-bar stage-fill-${i}" style="width:${count/max*100}%"></span></div></a>`}).join('')}</div><div class="pipeline-footer"><span>${state.contacts.length} total contacts</span><span>${state.contacts.filter(c=>c.stage==='Completed').length} completed jobs</span></div></section><section class="panel"><div class="panel-header"><div><h2>Recent contacts</h2><p>A fresh start for every new inquiry.</p></div><a class="text-link" href="#contacts">All contacts</a></div>${contactTable(recent)}</section></div><div class="overview-secondary"><section class="panel"><div class="panel-header"><h2>Next on the calendar</h2><span class="section-icon">${icon('calendar')}</span></div><div class="panel-body compact">${upcoming.length?upcoming.map(appointmentCard).join(''):empty('No upcoming visits','Book a visit from Appointments.')}</div><a class="panel-link" href="#appointments">Open appointments</a></section><section class="panel"><div class="panel-header"><h2>Follow-ups to focus on</h2><span class="section-icon">${icon('check')}</span></div><div class="panel-body compact">${due.length?due.map(taskRow).join(''):empty('All caught up','No open follow-ups.')}</div><a class="panel-link" href="#tasks">See all tasks</a></section></div></div><section class="activity-strip"><span class="activity-label">${icon('clock')} Latest activity</span><span>${esc(state.activity[0]?.message||'No activity yet')}</span><span class="activity-date">${state.activity[0]?new Date(state.activity[0].createdAt).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):''}</span></section>`;
}
function contacts(){
 const filtered=state.contacts.filter(c=>(contactStage==='All stages'||c.stage===contactStage)&&`${c.name} ${c.email} ${c.phone} ${c.service}`.toLowerCase().includes(contactQuery.toLowerCase()));
 main.innerHTML=pageHead('Good relationships start here.','Keep every contact, conversation, and cleaning request in one place.',button('Add contact','add-contact','primary','plus'))+`<section class="panel"><div class="list-toolbar"><label class="search-box">${icon('search')}<input id="contact-search" type="search" placeholder="Search contacts" aria-label="Search contacts" value="${esc(contactQuery)}"></label><label class="filter-select"><span class="sr-only">Filter by stage</span><select id="contact-stage">${['All stages',...stages].map(s=>`<option ${s===contactStage?'selected':''}>${s}</option>`).join('')}</select></label><span class="result-count" id="contact-count">${filtered.length} contacts</span></div><div id="contacts-results">${contactTable(filtered)}</div></section>`;
}
function pipeline(){
 main.innerHTML=pageHead('From hello to happily booked.','Move a contact through each stage. Choose a stage on any card to save it.',button('Add lead','add-contact','primary','plus'))+
 `<div class="pipeline-board">${stages.map((stage,index)=>{const entries=state.contacts.filter(c=>c.stage===stage);return `<section class="pipeline-column"><div class="column-header"><span class="stage-dot stage-fill-${index}"></span><h2>${stage}</h2><span class="column-count">${entries.length}</span></div><div class="column-total">${money(entries.reduce((s,c)=>s+c.value,0))} estimated</div><div class="pipeline-cards">${entries.map((c,i)=>`<article class="lead-card"><button class="lead-name" data-action="contact-detail" data-id="${esc(c.id)}">${avatar(c.name,i)}<strong>${esc(c.name)}</strong></button><p>${esc(c.service)}</p><strong class="lead-value">${money(c.value)}</strong><span class="lead-source">${esc(c.source)}</span><label class="stage-picker"><span class="sr-only">Stage for ${esc(c.name)}</span><select data-stage-id="${esc(c.id)}">${stages.map(s=>`<option ${s===stage?'selected':''}>${s}</option>`).join('')}</select></label></article>`).join('')||'<div class="empty-column">No contacts in this stage</div>'}</div></section>`}).join('')}</div>`;
}
function tasks(){
 const entries=state.tasks.filter(t=>taskFilter==='All'||t.status===taskFilter).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
 main.innerHTML=pageHead('Make room for the next step.','Small follow-ups that keep your customer relationships moving.',button('Add task','add-task','primary','plus'))+`<section class="panel"><div class="list-toolbar"><div class="segmented" aria-label="Task status">${['Open','Done','All'].map(s=>`<button data-task-filter="${s}" aria-pressed="${taskFilter===s}">${s}</button>`).join('')}</div><span class="result-count">${entries.length} tasks</span></div><div class="task-list">${entries.length?entries.map(taskRow).join(''):empty('Nothing on this list','Add a follow-up or change the filter.')}</div></section>`;
}
function appointments(){
 const entries=state.appointments.filter(a=>appointmentFilter==='All'||(appointmentFilter==='Upcoming'?a.status==='Scheduled'&&a.date>=today():a.status===appointmentFilter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 main.innerHTML=pageHead('A place for every appointment.','Keep cleaning visits organized. Appointment times use Philippine time (UTC+8).',button('Book visit','add-appointment','primary','plus'))+`<section class="panel"><div class="list-toolbar"><div class="segmented" aria-label="Appointment status">${['Upcoming','Completed','Cancelled','All'].map(s=>`<button data-appointment-filter="${s}" aria-pressed="${appointmentFilter===s}">${s}</button>`).join('')}</div><span class="result-count">${entries.length} visits</span></div><div class="appointment-grid">${entries.length?entries.map(appointmentCard).join(''):empty('No visits here yet','Book a cleaning visit or choose another filter.')}</div></section>`;
}
const options=(list,selected)=>list.map(s=>`<option value="${esc(s)}" ${s===selected?'selected':''}>${esc(s)}</option>`).join('');
const input=(label,name,type='text',value='',required=true,extra='')=>`<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} ${extra}></label>`;
const selectField=(label,name,list,selected)=>`<label class="field"><span>${label}</span><select name="${name}" required>${options(list,selected)}</select></label>`;
const notesField=(value='',label='Notes',max=3000)=>`<label class="field full"><span>${label} <small>Optional</small></span><textarea name="notes" rows="3" maxlength="${max}">${esc(value)}</textarea></label>`;
function inquiry(){
 main.innerHTML=pageHead('An inquiry. A new opportunity.','A working example of how a website form becomes a CRM lead.','')+`<div class="inquiry-layout"><section class="inquiry-context"><span class="inquiry-brand">${icon('spark')} CLEARNEST</span><h2>Come home to<br>a fresh start.</h2><p>Tell us a little about the cleaning you have in mind.</p><div class="inquiry-services">${services.map(s=>`<span>${icon('check')}${s}</span>`).join('')}</div><div class="inquiry-disclaimer"><strong>Sample inquiry form</strong><p>Use fictional details for your walkthrough. This form saves a lead in this demo workspace.</p></div></section><section class="panel inquiry-panel"><div class="panel-header"><div><h2>Request a cleaning</h2><p>All fields marked optional can be left blank.</p></div></div><form id="inquiry-form" class="editor-form"><div class="form-grid">${input('Full name','name','text','',true,'maxlength="100" autocomplete="name"')}${input('Email address','email','email','',true,'maxlength="150" autocomplete="email"')}${input('Phone number <small>Optional</small>','phone','tel','',false,'maxlength="40" autocomplete="tel"')}${selectField('Cleaning service','service',services,services[0])}${notesField('','What should we know?')}</div><p class="form-error" role="alert" hidden></p><div class="form-actions"><span>Creates a New lead · saves to your demo</span><button class="button primary" type="submit">Submit inquiry</button></div><div id="inquiry-success" class="inquiry-success" role="status" hidden></div></form></section></div>`;
}
function renderContent(){
 ({overview,contacts,pipeline,tasks,appointments,inquiry}[view])();
}
function dialogShell(title,subtitle,content){
 document.querySelector('#dialog-content').innerHTML=`<div class="dialog-header"><div><h2 id="dialog-title">${title}</h2><p>${subtitle}</p></div><button class="icon-button" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${content}`;
 if(!dialog.open)dialog.showModal();
 dialog.querySelector('input,select,textarea,button:not([data-action="close-dialog"])')?.focus();
}
function editorFooter(label,deleteId){return `<p class="form-error" role="alert" hidden></p><div class="form-actions ${deleteId?'with-delete':''}">${deleteId?`<button class="button danger delete-from-editor" type="button" data-action="delete-contact" data-id="${esc(deleteId)}">${icon('trash')}Delete contact</button>`:''}<button class="button secondary" type="button" data-action="close-dialog">Cancel</button><button class="button primary" type="submit">${label}</button></div>`;}
function contactEditor(id){
 const c=id?contactById(id):{name:'',email:'',phone:'',service:services[0],stage:stages[0],source:'Manual entry',value:0,notes:''};
 dialogShell(id?'Edit contact':'Add a contact','Keep the details that make a conversation personal.',`<form class="editor-form" data-kind="contacts" data-id="${esc(id||'')}"><div class="form-grid">${input('Full name','name','text',c.name,true,'maxlength="100"')}${input('Email address','email','email',c.email,true,'maxlength="150"')}${input('Phone number <small>Optional</small>','phone','tel',c.phone,false,'maxlength="40"')}${selectField('Service','service',services,c.service)}${selectField('Pipeline stage','stage',stages,c.stage)}${input('Estimated value (PHP)','value','number',c.value,true,'min="0" max="1000000" step="0.01"')}${input('Lead source','source','text',c.source,true,'maxlength="60"')}${notesField(c.notes)}</div>${editorFooter(id?'Save changes':'Save contact',id)}</form>`);
}
function contactDetail(id){
 const c=contactById(id);if(!c)return;
 const linkedTasks=state.tasks.filter(t=>t.contactId===id),visits=state.appointments.filter(a=>a.contactId===id);
 dialogShell('Contact details',c.service,`<div class="contact-detail"><div class="detail-person">${avatar(c.name)}<div><h3>${esc(c.name)}</h3>${stageBadge(c.stage)}</div></div><div class="detail-links"><span>${icon('mail')}${esc(c.email)}</span><span>${icon('phone')}${esc(c.phone||'No phone number')}</span></div><div class="detail-grid"><div><span>Estimated job value</span><strong>${money(c.value)}</strong></div><div><span>Lead source</span><strong>${esc(c.source)}</strong></div></div><h3>Notes</h3><p class="detail-notes">${esc(c.notes||'No notes yet.')}</p><div class="detail-section"><h3>Follow-ups <span>${linkedTasks.length}</span></h3>${linkedTasks.length?linkedTasks.map(taskRow).join(''):'<p class="muted">No follow-ups yet.</p>'}</div><div class="detail-section"><h3>Appointments <span>${visits.length}</span></h3>${visits.length?visits.map(appointmentCard).join(''):'<p class="muted">No appointments yet.</p>'}</div><div class="detail-actions">${button('Add task','contact-task','secondary','plus')}${button('Book visit','contact-appointment','secondary','calendar')}${button('Edit contact','detail-edit','primary','edit')}</div></div>`);
 dialog.dataset.contactId=id;
 dialog.querySelector('.contact-detail').insertAdjacentHTML('beforeend',`<div class="detail-delete"><button type="button" class="button danger" data-action="delete-contact" data-id="${esc(id)}">${icon('trash')}Delete contact</button></div>`);
}
async function confirmContactDeletion(id){
 await load();
 const c=contactById(id);
 if(!c){if(dialog.open)dialog.close();toast('This contact no longer exists.');return}
 const taskIds=state.tasks.filter(t=>t.contactId===id).map(t=>t.id);
 const appointmentIds=state.appointments.filter(a=>a.contactId===id).map(a=>a.id);
 pendingDeletion={id,name:c.name,expectedUpdatedAt:c.updatedAt,expectedTaskIds:taskIds,expectedAppointmentIds:appointmentIds};
 deleteDialog.innerHTML=`<div class="dialog-header"><div><h2 id="delete-title">Delete this contact?</h2><p>Review the contact before removing it.</p></div></div><div class="delete-body"><div class="delete-person">${avatar(c.name)}<div><strong>${esc(c.name)}</strong><span>${esc(c.email)}</span></div></div><p id="delete-description">This removes the contact from your workspace${taskIds.length||appointmentIds.length?` along with <strong>${taskIds.length} linked ${taskIds.length===1?'task':'tasks'}</strong> and <strong>${appointmentIds.length} ${appointmentIds.length===1?'appointment':'appointments'}</strong>`:'. It has no linked tasks or appointments'}.</p><p class="form-error" role="alert" hidden></p><div class="form-actions"><button type="button" class="button secondary" data-action="cancel-delete">Cancel</button><button type="button" class="button danger-solid" data-action="confirm-delete">${icon('trash')}Delete contact</button></div></div>`;
 deleteDialog.showModal();deleteDialog.querySelector('[data-action="cancel-delete"]').focus();
}
async function deleteContact(){
 if(!pendingDeletion||deletingContact)return;
 const pending=pendingDeletion,confirmButton=deleteDialog.querySelector('[data-action="confirm-delete"]');
 const errorEl=deleteDialog.querySelector('.form-error');errorEl.hidden=true;deletingContact=true;
 deleteDialog.querySelectorAll('button').forEach(b=>b.disabled=true);confirmButton.textContent='Deleting…';
 try{
  await request('/api/contacts/'+pending.id,'DELETE',{confirm:true,expectedUpdatedAt:pending.expectedUpdatedAt,expectedTaskIds:pending.expectedTaskIds,expectedAppointmentIds:pending.expectedAppointmentIds});
  deleteDialog.close();if(dialog.open)dialog.close();
  state.contacts=state.contacts.filter(c=>c.id!==pending.id);state.tasks=state.tasks.filter(t=>t.contactId!==pending.id);state.appointments=state.appointments.filter(a=>a.contactId!==pending.id);render();
  try{await load();toast(`${pending.name} was deleted.`)}catch{toast('Contact deleted. Refresh the workspace to load the latest activity.');}
 }catch(error){errorEl.textContent=error.message;errorEl.hidden=false;}
 finally{deletingContact=false;deleteDialog.querySelectorAll('button').forEach(b=>b.disabled=false);confirmButton.innerHTML=icon('trash')+'Delete contact';}
}
function contactOptions(selected){return state.contacts.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}</option>`).join('')}
function taskEditor(id,contactId){
 if(!state.contacts.length){toast('Add a contact first.');return}
 const t=id?state.tasks.find(t=>t.id===id):{title:'',contactId:contactId||state.contacts[0].id,dueDate:today(),status:'Open'};
 dialogShell(id?'Edit follow-up':'Add a follow-up','Give the next step a name and a date.',`<form class="editor-form" data-kind="tasks" data-id="${esc(id||'')}"><div class="form-grid"><label class="field full"><span>Task</span><input name="title" value="${esc(t.title)}" maxlength="150" required></label><label class="field full"><span>Contact</span><select name="contactId" required>${contactOptions(t.contactId)}</select></label>${input('Due date','dueDate','date',t.dueDate)}${selectField('Status','status',['Open','Done'],t.status)}</div>${editorFooter(id?'Save task':'Add task')}</form>`);
}
function appointmentEditor(id,contactId){
 if(!state.contacts.length){toast('Add a contact first.');return}
 const a=id?state.appointments.find(a=>a.id===id):{contactId:contactId||state.contacts[0].id,date:today(),time:'09:00',duration:120,status:'Scheduled',notes:''};
 dialogShell(id?'Edit appointment':'Book a cleaning visit','Times use Philippine time (UTC+8).',`<form class="editor-form" data-kind="appointments" data-id="${esc(id||'')}"><div class="form-grid"><label class="field full"><span>Contact</span><select name="contactId" required>${contactOptions(a.contactId)}</select></label>${input('Date','date','date',a.date)}${input('Time','time','time',a.time)}<label class="field"><span>Duration</span><select name="duration">${[60,120,180,240].map(d=>`<option value="${d}" ${d===a.duration?'selected':''}>${d/60} ${d===60?'hour':'hours'}</option>`).join('')}</select></label>${selectField('Status','status',['Scheduled','Completed','Cancelled'],a.status)}${notesField(a.notes,'Visit notes',1500)}</div><p class="form-hint">Scheduled visits move the contact to Booked. Completed visits move it to Completed.</p>${editorFooter(id?'Save appointment':'Book visit')}</form>`);
}
async function saveForm(form){
 const errorEl=form.querySelector('.form-error'),submit=form.querySelector('[type="submit"]');
 const body=Object.fromEntries(new FormData(form));
 errorEl.hidden=true;submit.disabled=true;const original=submit.textContent;submit.textContent='Saving…';
 try{
  const inquiryForm=form.id==='inquiry-form',kind=inquiryForm?'inquiries':form.dataset.kind;
  const id=form.dataset.id;
  const result=await request(`/api/${kind}${id?'/'+id:''}`,id?'PUT':'POST',body);
  await load();
  if(inquiryForm){
   const success=document.querySelector('#inquiry-success');success.hidden=false;success.innerHTML=`<strong>Inquiry saved.</strong><p>${esc(result.record.name)} is now a New lead.</p><a class="text-link" href="#contacts">View your contacts</a>`;document.querySelector('#inquiry-form').reset();
  }else{dialog.close()}
  toast(inquiryForm?'Inquiry saved as a new lead.':'Saved to your demo workspace.');
 }catch(error){
  errorEl.textContent=error.message;errorEl.hidden=false;
 }finally{submit.disabled=false;submit.textContent=original}
}
async function toggleTask(id){
 const t=state.tasks.find(t=>t.id===id);if(!t)return;
 await request('/api/tasks/'+id,'PUT',{...t,status:t.status==='Open'?'Done':'Open'});await load();
 if(dialog.open&&dialog.dataset.contactId)contactDetail(dialog.dataset.contactId);
 toast(t.status==='Open'?'Follow-up completed.':'Follow-up reopened.');
}
function closeMenu(){document.body.classList.remove('menu-open');document.querySelector('.nav-backdrop').hidden=true;document.querySelector('#menu-toggle').setAttribute('aria-expanded','false');}
document.querySelector('#menu-toggle').innerHTML=icon('menu');
document.querySelector('#menu-toggle').addEventListener('click',()=>{const open=!document.body.classList.contains('menu-open');document.body.classList.toggle('menu-open',open);document.querySelector('.nav-backdrop').hidden=!open;document.querySelector('#menu-toggle').setAttribute('aria-expanded',String(open));});
document.querySelector('.nav-backdrop').addEventListener('click',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
window.addEventListener('hashchange',setView);
dialog.addEventListener('close',()=>{delete dialog.dataset.contactId;});
deleteDialog.addEventListener('close',()=>{if(!deleteDialog.open)pendingDeletion=null;});
deleteDialog.addEventListener('cancel',e=>{if(deletingContact)e.preventDefault();});
document.addEventListener('submit',e=>{if(e.target.matches('.editor-form')){e.preventDefault();saveForm(e.target);}});
document.addEventListener('click',async e=>{
 const control=e.target.closest('[data-action],[data-task-filter],[data-appointment-filter]');if(!control)return;
 if(control.dataset.taskFilter){taskFilter=control.dataset.taskFilter;renderContent();return}
 if(control.dataset.appointmentFilter){appointmentFilter=control.dataset.appointmentFilter;renderContent();return}
 const id=control.dataset.id,contactId=dialog.dataset.contactId;
 try{
  switch(control.dataset.action){
   case 'refresh':control.disabled=true;try{await load();toast('Workspace refreshed.')}finally{control.disabled=false}break;
   case 'add-contact':contactEditor();break;
   case 'edit-contact':contactEditor(id);break;
   case 'contact-detail':contactDetail(id);break;
   case 'close-dialog':dialog.close();break;
   case 'detail-edit':contactEditor(contactId);break;
   case 'delete-contact':control.disabled=true;try{await confirmContactDeletion(id)}finally{control.disabled=false}break;
   case 'cancel-delete':if(!deletingContact)deleteDialog.close();break;
   case 'confirm-delete':await deleteContact();break;
   case 'add-task':taskEditor();break;
   case 'edit-task':taskEditor(id);break;
   case 'contact-task':taskEditor(undefined,contactId);break;
   case 'toggle-task':control.disabled=true;try{await toggleTask(id)}finally{control.disabled=false}break;
   case 'add-appointment':appointmentEditor();break;
   case 'edit-appointment':appointmentEditor(id);break;
   case 'contact-appointment':appointmentEditor(undefined,contactId);break;
  }
 }catch(error){toast(error.message)}
});
document.addEventListener('input',e=>{
 if(e.target.id==='contact-search'){
  contactQuery=e.target.value;
  const filtered=state.contacts.filter(c=>(contactStage==='All stages'||c.stage===contactStage)&&`${c.name} ${c.email} ${c.phone} ${c.service}`.toLowerCase().includes(contactQuery.toLowerCase()));
  document.querySelector('#contacts-results').innerHTML=contactTable(filtered);document.querySelector('#contact-count').textContent=`${filtered.length} contacts`;
 }
});
document.addEventListener('change',async e=>{
 if(e.target.id==='contact-stage'){contactStage=e.target.value;contacts()}
 if(e.target.dataset.stageId){
  const select=e.target,c=contactById(select.dataset.stageId);select.disabled=true;
  try{await request('/api/contacts/'+c.id,'PUT',{...c,stage:select.value});await load();toast('Pipeline stage saved.')}catch(error){select.value=c.stage;toast(error.message)}finally{select.disabled=false}
 }
});
setView();
load().catch(error=>{
 document.querySelector('#connection-status').textContent='Server unavailable';document.querySelector('#connection-status').classList.add('offline');
 main.innerHTML=`<section class="panel connection-error"><h1>Let’s reconnect.</h1><p>${esc(error.message)} Reload this page, then try again.</p>${button('Try again','refresh','primary','refresh')}</section>`;
});

// Optional browser WebMCP bridge. Normal CRM controls work without this API.
const modelContext=document.modelContext;
if(modelContext?.registerTool){
 const lifecycle=new AbortController();
 const tools=[{
  name:'read_crm_workspace',title:'Read CRM workspace',
  description:'Read saved visitor demo contacts, tasks, and appointments without changing records.',
  inputSchema:{type:'object',properties:{},additionalProperties:false},
  annotations:{readOnlyHint:true,untrustedContentHint:true},
  async execute(input){
   if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('No arguments are accepted.');
   await load();return {contacts:state.contacts,tasks:state.tasks,appointments:state.appointments};
  }
 },{
  name:'update_contact_pipeline_stage',title:'Update contact stage',
  description:'Save a new pipeline stage for an existing visitor demo contact and refresh the workspace.',
  inputSchema:{type:'object',properties:{contactId:{type:'string'},stage:{type:'string',enum:stages}},required:['contactId','stage'],additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:true},
  async execute(input){
   if(!input||typeof input.contactId!=='string'||!stages.includes(input.stage)||Object.keys(input).some(k=>!['contactId','stage'].includes(k)))throw new Error('Supply a contactId and a listed stage.');
   await load();const c=contactById(input.contactId);if(!c)throw new Error('Contact not found.');
   const result=await request('/api/contacts/'+c.id,'PUT',{...c,stage:input.stage});await load();
   return {id:result.record.id,stage:result.record.stage,saved:true};
  }
 }];
 for(const tool of tools){try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>console.info('WebMCP registration unavailable.'));}catch{console.info('WebMCP registration unavailable.');}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

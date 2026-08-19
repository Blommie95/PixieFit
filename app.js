const KEY="pixiefit-v1";
const defaultFoods=[
["Egg","1 large egg","piece",70,"Breakfast"],["White bread","1 slice","slice",80,"Breakfast"],["Butter","1 tsp","tsp",34,"Breakfast"],
["Coco Pops","30 g","g",115,"Breakfast"],["Oats","40 g","g",150,"Breakfast"],["Milk","250 ml","ml",120,"Breakfast"],["Plain yogurt","150 g","g",95,"Breakfast"],
["Chicken breast","100 g","g",165,"Protein"],["Chicken thigh","100 g","g",209,"Protein"],["Steak","100 g","g",250,"Protein"],["Mince","100 g","g",250,"Protein"],
["Fish","100 g","g",140,"Protein"],["Tuna","100 g","g",116,"Protein"],["Sausage","1 sausage","piece",180,"Protein"],
["White rice","1 cup cooked","cup",205,"Carbohydrates"],["Brown rice","1 cup cooked","cup",215,"Carbohydrates"],["Pasta","1 cup cooked","cup",220,"Carbohydrates"],
["Potato","1 medium","piece",160,"Carbohydrates"],["Sweet potato","1 medium","piece",135,"Carbohydrates"],["Wrap","1 wrap","piece",180,"Carbohydrates"],
["Pap","1 cup","cup",180,"Carbohydrates"],["Fries","100 g","g",312,"Carbohydrates"],["Banana","1 medium","piece",105,"Fruit"],["Apple","1 medium","piece",95,"Fruit"],
["Orange","1 medium","piece",62,"Fruit"],["Pear","1 medium","piece",101,"Fruit"],["Grapes","100 g","g",69,"Fruit"],["Strawberries","100 g","g",32,"Fruit"],
["Watermelon","100 g","g",30,"Fruit"],["Lettuce","1 cup","cup",5,"Vegetables"],["Tomato","1 medium","piece",22,"Vegetables"],["Cucumber","100 g","g",15,"Vegetables"],
["Carrot","1 medium","piece",25,"Vegetables"],["Spinach","1 cup","cup",7,"Vegetables"],["Broccoli","100 g","g",34,"Vegetables"],
["Mixed vegetables","1 cup","cup",100,"Vegetables"],["Mixed salad","1 bowl","serving",100,"Vegetables"],["Popcorn","3 cups popped","serving",93,"Snacks"],
["Crackers","4 crackers","serving",70,"Snacks"],["Chocolate","20 g","g",107,"Snacks"],["Mixed nuts","30 g","g",180,"Snacks"],
["Peanut butter","1 tbsp","tbsp",94,"Snacks"],["Coffee with milk","1 cup","serving",60,"Drinks"],["Tea with milk","1 cup","serving",30,"Drinks"],
["Orange juice","250 ml","ml",110,"Drinks"],["Soft drink","330 ml","ml",139,"Drinks"],["Lasagna","1 serving","serving",350,"Meals"]
];
const notes=[["Consistency can be quiet.","You don’t have to do everything. Just keep coming back to yourself."],["Progress counts, even when it feels small.","One ordinary choice can still move you forward."],["Today doesn't need to be perfect.","Aim for helpful, not perfect."]];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{target:1850,waterTarget:2000,weight:null,weights:[],customFoods:[],days:{},profile:{name:"",height:null,goalWeight:null,activity:1.2,onboarded:false}};
state.profile=Object.assign({name:"",height:null,goalWeight:null,activity:1.2,onboarded:false},state.profile||{});\nconst todayKey=()=>new Date().toISOString().slice(0,10);
function day(){const k=todayKey(); if(!state.days[k]) state.days[k]={foods:[],water:0}; return state.days[k]}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function kcal(){return day().foods.reduce((s,f)=>s+f.calories,0)}
function fmtL(ml){return (ml/1000).toFixed(2)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const d=day(), eaten=kcal(), rem=Math.max(0,state.target-eaten), pct=Math.min(100,Math.round(eaten/state.target*100));
 document.getElementById("todayDate").textContent=new Intl.DateTimeFormat(undefined,{weekday:"long",month:"long",day:"numeric"}).format(new Date());
 document.getElementById("targetValue").textContent=state.target;
 document.getElementById("eatenValue").textContent=Math.round(eaten);
 document.getElementById("remainingValue").textContent=Math.round(rem);
 document.getElementById("percentValue").textContent=pct+"%";
 document.getElementById("calorieRing").style.background=`conic-gradient(var(--pink) ${pct*3.6}deg,#f3e1e8 0deg)`;
 document.getElementById("energyMessage").textContent=eaten===0?"A little progress is progress.":pct<75?"You're building your day gently.":pct<=100?"You're staying mindful of your target.":"You've gone over target — no judgment.";
 document.getElementById("waterTotal").textContent=fmtL(d.water);
 document.getElementById("waterTarget").textContent=(state.waterTarget/1000).toFixed(1);
 const wp=Math.min(100,Math.round(d.water/state.waterTarget*100)); document.getElementById("waterPercent").textContent=wp+"%";document.getElementById("waterBar").style.width=wp+"%";
 document.getElementById("weightValue").textContent=state.weight?state.weight.toFixed(1)+" kg":"Not set";
 const start=state.weights.length?state.weights[0].weight:(state.weight||null), goal=state.profile.goalWeight;
 document.getElementById("startWeight").textContent=start?start.toFixed(1)+" kg":"—";
 document.getElementById("goalWeight").textContent=goal?goal.toFixed(1)+" kg":"—";
 const lost=start&&state.weight?Math.max(0,start-state.weight):0; document.getElementById("lostWeight").textContent=lost.toFixed(1);
 const gp=start&&goal&&start>goal?Math.max(0,Math.min(100,((start-(state.weight||start))/(start-goal))*100)):0;
 document.getElementById("goalBar").style.width=gp+"%";
 document.getElementById("dailyNote").textContent=notes[new Date().getDate()%notes.length][0];document.querySelector(".note-card p").textContent=notes[new Date().getDate()%notes.length][1];
 renderFoods();
}
function renderFoods(){
 const box=document.getElementById("foodLog"), foods=day().foods;
 if(!foods.length){box.innerHTML=`<div class="empty"><div class="big">Your day is still wide open.</div><p>Add your first meal whenever you’re ready. No perfect logging needed.</p><button class="primary-btn" onclick="openFood()">Log a first bite</button></div>`;return}
 const meals=["Breakfast","Lunch","Dinner","Snack"], labels={Snack:"Snacks"};
 box.innerHTML=meals.map(m=>{const fs=foods.filter(f=>f.meal===m);if(!fs.length)return "";return `<div class="meal"><div class="meal-title"><span>${labels[m]||m}</span><span>${Math.round(fs.reduce((s,f)=>s+f.calories,0))} kcal</span></div>${fs.map((f,i)=>`<div class="food-row"><div><div class="food-name">${esc(f.name)}</div><div class="food-meta">${esc(f.quantity)}</div></div><div><span class="food-kcal">${Math.round(f.calories)} kcal</span><button class="tiny-delete" onclick="deleteFood('${f.id}')">×</button></div></div>`).join("")}</div>`}).join("");
}
function openModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modalBackdrop").hidden=false}
function closeModal(){document.getElementById("modalBackdrop").hidden=true}
function openFood(){
 const all=[...defaultFoods.map(x=>({name:x[0],serving:x[1],unit:x[2],base:x[3],cat:x[4],built:true})),...state.customFoods.map(x=>({...x,built:false}))];
 openModal(`<h2>Add food</h2><input class="search" id="foodSearch" placeholder="Search chicken, rice, Coco Pops..." oninput="filterFoods()"><div id="foodResults"></div><button class="outline-btn wide" onclick="openCustomFood()">＋ Create Custom Food</button>`);
 window._foods=all;filterFoods();
}
function filterFoods(){const q=(document.getElementById("foodSearch").value||"").toLowerCase();const foods=window._foods.filter(f=>f.name.toLowerCase().includes(q)).slice(0,30);document.getElementById("foodResults").innerHTML=foods.map((f,i)=>`<button class="food-choice" onclick="selectFood(${window._foods.indexOf(f)})"><span><strong>${esc(f.name)}</strong><small>${esc(f.serving)}</small></span><b>${f.base} kcal</b></button>`).join("")||`<p class="muted">No food found.</p>`}
function selectFood(i){
 const f=window._foods[i];
 openModal(`<h2>${esc(f.name)}</h2><div class="form-grid">
 <div class="field"><label>Quantity (${esc(f.unit)})</label><input id="qty" type="number" min="0.1" step="0.1" value="1"></div>
 <div class="field"><label>Meal</label><select id="meal"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></div>
 <p class="muted">Base: ${f.base} kcal per ${esc(f.serving)}. Calories scale with quantity.</p>
 <button class="primary-btn wide" onclick='addSelected(${JSON.stringify(f).replace(/'/g,"&#39;")})'>Add to today's log</button></div>`);
}
function addSelected(f){const q=Math.max(.1,Number(document.getElementById("qty").value)||1);const meal=document.getElementById("meal").value;day().foods.push({id:crypto.randomUUID(),name:f.name,quantity:`${q} × ${f.serving}`,calories:f.base*q,meal});closeModal();save()}
function openCustomFood(){openModal(`<h2>Create custom food</h2><div class="form-grid">
<div class="field"><label>Food name</label><input id="cfName" placeholder="e.g. My protein shake"></div>
<div class="field"><label>Serving description</label><input id="cfServing" placeholder="e.g. 300 ml"></div>
<div class="field"><label>Unit</label><select id="cfUnit"><option>serving</option><option>g</option><option>ml</option><option>piece</option><option>slice</option><option>cup</option><option>tbsp</option><option>tsp</option></select></div>
<div class="field"><label>Calories per serving</label><input id="cfKcal" type="number" min="0" placeholder="220"></div>
<button class="primary-btn wide" onclick="saveCustomFood()">Save to My Foods</button></div>`)}
function saveCustomFood(){const name=document.getElementById("cfName").value.trim(),serv=document.getElementById("cfServing").value.trim(),unit=document.getElementById("cfUnit").value,kcal=Number(document.getElementById("cfKcal").value);if(!name||!serv||!kcal)return alert("Please complete the food name, serving and calories.");state.customFoods.push({name,serving:serv,unit,base:kcal});save();openFood()}
function openWater(){openModal(`<h2>Add water</h2><div class="choice-grid">${[250,350,500,750,1000].map(v=>`<button class="choice" onclick="addWater(${v})">${v===1000?"1 L":v+" ml"}</button>`).join("")}</div><button class="outline-btn wide" onclick="customWater()">Custom amount</button>`)}
function addWater(v){day().water=Math.max(0,day().water+v);closeModal();save()}
function customWater(){openModal(`<h2>Custom water amount</h2><div class="field"><label>Millilitres</label><input id="waterCustom" type="number" min="1" placeholder="600"></div><button class="primary-btn wide" onclick="addCustomWater()">Add water</button>`)}
function addCustomWater(){const v=Number(document.getElementById("waterCustom").value);if(v>0){day().water+=v;closeModal();save()}}
function subtractWater(){if(day().water<=0)return;openModal(`<h2>Remove water</h2><div class="choice-grid">${[250,350,500,750,1000].map(v=>`<button class="choice" onclick="removeWater(${v})">${v===1000?"1 L":v+" ml"}</button>`).join("")}</div>`)}
function removeWater(v){day().water=Math.max(0,day().water-v);closeModal();save()}
function openWeight(){openModal(`<h2>Update weight</h2><div class="field"><label>Current weight (kg)</label><input id="weightInput" type="number" min="20" max="300" step="0.1" value="${state.weight||""}" placeholder="70.0"></div><button class="primary-btn wide" onclick="saveWeight()">Save weight</button>`)}
function saveWeight(){const v=Number(document.getElementById("weightInput").value);if(v>=20&&v<=300){state.weight=v;state.weights.push({date:todayKey(),weight:v});closeModal();save()}}
function openProfile(){
 const p=state.profile;
 openModal(`<h2>Your PixieFit profile</h2><div class="form-grid">
 <div class="field"><label>Name</label><input id="profName" value="${esc(p.name||"")}"></div>
 <div class="field"><label>Height (cm)</label><input id="profHeight" type="number" value="${p.height||""}"></div>
 <div class="field"><label>Goal weight (kg)</label><input id="profGoal" type="number" step="0.1" value="${p.goalWeight||""}"></div>
 <div class="field"><label>Activity level</label><select id="profActivity"><option value="1.2">Mostly sedentary</option><option value="1.375">Lightly active</option><option value="1.55">Moderately active</option><option value="1.725">Very active</option></select></div>
 <button class="primary-btn wide" onclick="saveProfile()">Save profile</button>
 <button class="outline-btn wide" onclick="openSettings()">Calorie & water targets</button></div>`);
 document.getElementById("profActivity").value=String(p.activity||1.2);
}
function saveProfile(){
 const p=state.profile;p.name=document.getElementById("profName").value.trim();p.height=Number(document.getElementById("profHeight").value)||null;p.goalWeight=Number(document.getElementById("profGoal").value)||null;p.activity=Number(document.getElementById("profActivity").value)||1.2;p.onboarded=true;closeModal();save();
}
function openProgress(){
 const start=state.weights.length?state.weights[0].weight:state.weight, goal=state.profile.goalWeight, current=state.weight;
 const rows=state.weights.slice().reverse().slice(0,12);
 openModal(`<h2>Progress</h2><div class="progress-grid"><div><strong>${start?start.toFixed(1):"—"}</strong><span>starting kg</span></div><div><strong>${current?current.toFixed(1):"—"}</strong><span>current kg</span></div><div><strong>${goal?goal.toFixed(1):"—"}</strong><span>goal kg</span></div></div><div class="goal-track"><div style="width:${start&&goal&&current?Math.max(0,Math.min(100,((start-current)/(start-goal))*100)):0}%"></div></div><h3>Recent weigh-ins</h3>${rows.length?rows.map(r=>`<div class="history-item"><span>${new Date(r.date+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short"})}</span><b>${r.weight.toFixed(1)} kg</b></div>`).join(""):`<p class="muted">Your weigh-ins will appear here.</p>`}`);
}
function openSettings(){openModal(`<h2>PixieFit settings</h2><div class="form-grid">
<div class="field"><label>Daily calorie target</label><input id="targetInput" type="number" min="800" max="5000" value="${state.target}"></div>
<div class="field"><label>Daily water target (ml)</label><input id="waterTargetInput" type="number" min="500" max="10000" value="${state.waterTarget}"></div>
<button class="primary-btn wide" onclick="saveSettings()">Save settings</button></div>`)}
function saveSettings(){const t=Number(document.getElementById("targetInput").value),w=Number(document.getElementById("waterTargetInput").value);if(t>=800&&w>=500){state.target=t;state.waterTarget=w;closeModal();save()}}
function openHistory(){const entries=Object.entries(state.days).sort((a,b)=>b[0].localeCompare(a[0]));openModal(`<h2>History</h2>${entries.length?entries.map(([date,d])=>`<div class="history-item"><div><strong>${new Date(date+"T12:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</strong><div class="muted">${d.foods.length} food entries · ${(d.water/1000).toFixed(2)} L water</div></div><b>${Math.round(d.foods.reduce((s,f)=>s+f.calories,0))} kcal</b></div>`).join(""):`<p class="muted">Your history will appear here as you log your days.</p>`}`)}
function openMyFoods(){openModal(`<h2>My Foods</h2>${state.customFoods.length?state.customFoods.map((f,i)=>`<div class="food-row"><div><div class="food-name">${esc(f.name)}</div><div class="food-meta">${esc(f.serving)}</div></div><div><b>${f.base} kcal</b><button class="tiny-delete" onclick="deleteCustomFood(${i})">×</button></div></div>`).join(""):`<p class="muted">Create a custom food and it will live here.</p>`}<button class="primary-btn wide" onclick="openCustomFood()">＋ Create Custom Food</button>`)}
function deleteFood(id){day().foods=day().foods.filter(f=>f.id!==id);save()}
function deleteCustomFood(i){state.customFoods.splice(i,1);save();openMyFoods()}
document.getElementById("addFoodBtn").onclick=openFood;document.getElementById("addWaterBtn").onclick=openWater;document.getElementById("subtractWater").onclick=subtractWater;document.getElementById("weightBtn").onclick=openWeight;document.getElementById("progressBtn").onclick=openProgress;document.getElementById("profileBtn").onclick=openProfile;document.getElementById("historyBtn").onclick=openHistory;document.getElementById("foodsBtn").onclick=openMyFoods;document.getElementById("closeModal").onclick=closeModal;document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
render();
function showOnboarding(){document.getElementById("onboarding").hidden=!!state.profile.onboarded}
document.getElementById("finishOnboarding").onclick=()=>{
 const name=document.getElementById("pName").value.trim(),h=Number(document.getElementById("pHeight").value),w=Number(document.getElementById("pWeight").value),g=Number(document.getElementById("pGoal").value),a=Number(document.getElementById("pActivity").value);
 if(!name||!h||!w||!g){alert("Please complete your name, height, current weight and goal weight.");return}
 state.profile={name,height:h,goalWeight:g,activity:a,onboarded:true}; state.weight=w; if(!state.weights.length)state.weights.push({date:todayKey(),weight:w});
 document.getElementById("onboarding").hidden=true;save();
};
document.getElementById("skipOnboarding").onclick=()=>{state.profile.onboarded=true;save();document.getElementById("onboarding").hidden=true};
showOnboarding();
if("serviceWorker" in navigator){ window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{})); }

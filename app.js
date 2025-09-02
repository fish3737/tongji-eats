
(async function(){
  const $ = (sel)=>document.querySelector(sel);
  const listEl = $("#list");
  const qEl = $("#q"), cuisineEl=$("#cuisine"), areaEl=$("#area"), sortEl=$("#sort");
  let data = [];
  try{
    const res = await fetch("data/restaurants.json?ts="+Date.now());
    data = await res.json();
  }catch(e){
    listEl.innerHTML = "<p class='no-result'>数据加载失败。</p>";
    return;
  }
  const cuisines = [...new Set(data.map(d=>d.cuisine))].sort();
  const areas = [...new Set(data.map(d=>d.area))].sort();
  for(const c of cuisines){ const o=document.createElement('option'); o.value=o.textContent=c; cuisineEl.appendChild(o); }
  for(const a of areas){ const o=document.createElement('option'); o.value=o.textContent=a; areaEl.appendChild(o); }
  function render(){
    const kw = qEl.value.trim().toLowerCase();
    let rows = data.filter(d=>{
      const inKw = !kw || (d.name+d.cuisine+d.address+d.area).toLowerCase().includes(kw);
      const inCuisine = !cuisineEl.value || d.cuisine===cuisineEl.value;
      const inArea = !areaEl.value || d.area===areaEl.value;
      return inKw && inCuisine && inArea;
    });
    const key = sortEl.value;
    rows.sort((a,b)=> (a[key]||'').localeCompare(b[key]||''));
    if(rows.length===0){
      listEl.innerHTML = "<p class='no-result'>没有匹配的结果。</p>";
      return;
    }
    listEl.innerHTML = rows.map(r=>`
      <article class="card">
        <h3>${r.name}</h3>
        <div class="meta">
          <span class="chip">${r.cuisine}</span>
          <span class="chip">${r.area}</span>
        </div>
        <div class="addr">📍 ${r.address}</div>
        <div class="actions">
          <a class="btn" href="${r.nav_amap}" target="_blank" rel="noopener">高德导航</a>
          <a class="btn" href="${r.nav_baidu}" target="_blank" rel="noopener">百度导航</a>
          <a class="btn secondary" href="${r.dp_url}" target="_blank" rel="noopener">查看人均 · 点评/美团</a>
        </div>
      </article>
    `).join("");
  }
  qEl.addEventListener('input', render);
  cuisineEl.addEventListener('change', render);
  areaEl.addEventListener('change', render);
  sortEl.addEventListener('change', render);
  render();
})();

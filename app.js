(() => {
  const COLORS = {
    black:'#17181a', red:'#d4302b', yellow:'#f2c230', white:'#f4f4f2', 'pale blue':'#cfe4f0',
    teal:'#0f5870', maroon:'#4a1f2e', green:'#1f5a45', denim:'#24578a', silver:'#a9afb5', ruby:'#b3242f'
  };
  const SLOT_LABEL = { outer:'Outerwear', top:'Top', bottom:'Bottom', belt:'Belt', extra:'Extras' };
  const CATS = [['all','All'],['tops','Tops'],['bottoms','Bottoms'],['accessories','Accessories']];

  const ITEMS = [
    { id:'hw',  name:'Hot Wheels racing tee', cat:'tops', slot:'top', front:'hotwheels-tee-front.webp', back:'hotwheels-tee-back.webp',
      colors:['black','red','yellow'], tags:['Graphic','Oversized','Racing'] },
    { id:'mb',  name:'Layered racing tee', cat:'tops', slot:'top', front:'marlboro-layered-tee-front.webp', back:'marlboro-layered-tee-back.webp',
      colors:['black','pale blue'], tags:['Graphic','Layered sleeves','Racing'] },
    { id:'rc',  name:'Red check shirt', cat:'tops', slot:'top', front:'red-check-shirt-front.webp', back:'red-check-shirt-back.webp',
      colors:['red','white'], tags:['Check','Short sleeve','Script print'] },
    { id:'bz',  name:'Teal blazer', cat:'tops', slot:'top', front:'teal-blazer-front.webp', back:'teal-blazer-back.webp',
      colors:['teal'], tags:['Tailored','Two button','Satin lining'] },
    { id:'jn',  name:'Barrel wide jeans', cat:'bottoms', slot:'bottom', front:'wide-jeans-front.webp', back:'wide-jeans-back.webp',
      colors:['denim'], tags:['Wide leg','Faded wash','Curved seams'] },
    { id:'tr',  name:'Teal trousers', cat:'bottoms', slot:'bottom', front:'teal-trousers-front.webp', back:'teal-trousers-back.webp',
      colors:['teal'], tags:['Tailored','Straight leg'] },
    { id:'sp',  name:'Black wide-leg sweatpants', cat:'bottoms', slot:'bottom', front:'black-sweatpants-front.webp', back:'black-sweatpants-back.webp',
      colors:['black'], tags:['Wide leg','Drawstring','Relaxed'] },
    { id:'mg',  name:'Maroon graphic long sleeve', cat:'tops', slot:'top', front:'maroon-graphic-tee-front.webp', back:'maroon-graphic-tee-back.webp',
      colors:['maroon','yellow','teal'], tags:['Long sleeve','Graphic','Relaxed'] },
    { id:'pj',  name:'Portugal home jersey, 7', cat:'tops', slot:'top', front:'portugal-jersey-front.webp', back:'portugal-jersey-back.webp',
      colors:['red','green','white'], tags:['Football','Striped','Name and number back'] },
    { id:'bt',  name:'Eyelet belt', cat:'accessories', slot:'belt', front:'eyelet-belt.webp',
      colors:['black','silver'], tags:['Double prong','Eyelets'] },
    { id:'ch',  name:'Wallet chain set', cat:'accessories', slot:'extra', front:'chain-set.webp',
      colors:['silver'], tags:['Two chains','Silver tone'] },
    { id:'r1',  name:'Studded band ring', cat:'accessories', slot:'extra', front:'ring-band.webp',
      colors:['silver','ruby'], tags:['Ring','Ruby stone'] },
    { id:'r2',  name:'Shield ring', cat:'accessories', slot:'extra', front:'ring-shield.webp',
      colors:['silver','black'], tags:['Ring','Statement'] }
  ];
  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));

  /* storage */
  const store = {
    get(k, d){ try { const v = localStorage.getItem('wd:'+k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v){ try { localStorage.setItem('wd:'+k, JSON.stringify(v)); } catch {} }
  };

  const S = {
    cat:'all', q:'', fav:false, color:null, side:'front',
    board: store.get('board', {}),
    favs: new Set(store.get('favs', [])),
    worn: store.get('worn', {}),
    looks: store.get('looks', [])
  };
  S.board = { outer:S.board.outer||null, top:S.board.top||null, bottom:S.board.bottom||null, belt:S.board.belt||null,
    extra:(S.board.extra||[]).filter(id => byId[id]) };
  ['outer','top','bottom','belt'].forEach(k => { if (S.board[k] && !byId[S.board[k]]) S.board[k] = null; });

  const $ = s => document.querySelector(s);
  const grid = $('#grid'), boardEl = $('#board');
  const ICON = {
    heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9.2C1.8 7.6 3.8 4.5 7 4.5c2 0 3.4 1 5 3 1.6-2 3-3 5-3 3.2 0 5.2 3.1 4 6.3C19 15.600 12 20 12 20z"/></svg>',
    expand:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>'
  };

  const onBoard = id => { const it = byId[id]; return it.slot === 'extra' ? S.board.extra.includes(id) : it.slot === 'top' ? (S.board.top === id || S.board.outer === id) : S.board[it.slot] === id; };
  const save = () => { store.set('board', S.board); store.set('favs', [...S.favs]); store.set('worn', S.worn); store.set('looks', S.looks); };
  let tt;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800); };

  function toggle(id){
    const it = byId[id];
    if (it.slot === 'extra'){
      const i = S.board.extra.indexOf(id);
      if (i > -1) S.board.extra.splice(i,1);
      else { if (S.board.extra.length >= 3) S.board.extra.shift(); S.board.extra.push(id); }
    } else if (it.slot === 'top'){
      // first top goes to Top; the next one layers on automatically as Outerwear
      if (S.board.top === id) S.board.top = null;
      else if (S.board.outer === id) S.board.outer = null;
      else if (!S.board.top) S.board.top = id;
      else S.board.outer = id;
    } else S.board[it.slot] = S.board[it.slot] === id ? null : id;
    save(); renderCloset(); renderBoard();
  }

  /* closet */
  function visible(){
    const q = S.q.trim().toLowerCase();
    return ITEMS.filter(i =>
      (S.cat === 'all' || i.cat === S.cat) &&
      (!S.fav || S.favs.has(i.id)) &&
      (!S.color || i.colors.includes(S.color)) &&
      (!q || [i.name, i.cat, ...i.tags, ...i.colors].join(' ').toLowerCase().includes(q)));
  }
  function renderCloset(){
    const list = visible();
    grid.dataset.side = S.side;
    grid.innerHTML = list.map(i => `
      <article class="tile${onBoard(i.id) ? ' on' : ''}" data-id="${i.id}">
        <button class="stage" data-act="pick" aria-label="${onBoard(i.id) ? 'Remove' : 'Add'} ${i.name} ${onBoard(i.id) ? 'from' : 'to'} outfit">
          <img class="f${i.back ? ' has-b' : ''}" src="${i.front}" alt="${i.name}, front" loading="lazy">
          ${i.back ? `<img class="b" src="${i.back}" alt="${i.name}, back" loading="lazy">` : ''}
        </button>
        <span class="badge">In outfit</span>
        <div class="corner">
          <button class="icon" data-act="fav" aria-pressed="${S.favs.has(i.id)}" aria-label="Favorite ${i.name}">${ICON.heart}</button>
          <button class="icon" data-act="open" aria-label="Details for ${i.name}">${ICON.expand}</button>
        </div>
        <div class="cap"><b>${i.name}</b><span>${S.worn[i.id] ? 'Worn ' + S.worn[i.id].n + '×' : ''}</span></div>
      </article>`).join('');
    $('#empty').hidden = list.length > 0;
    const worn = Object.entries(S.worn).sort((a,b) => b[1].n - a[1].n)[0];
    $('#summary').textContent = `${ITEMS.length} pieces, ${S.favs.size} favorite${S.favs.size === 1 ? '' : 's'}` +
      (worn ? `, most worn: ${byId[worn[0]].name}` : '');
  }

  /* board */
  function renderBoard(){
    boardEl.innerHTML = Object.keys(SLOT_LABEL).map(slot => {
      const ids = slot === 'extra' ? S.board.extra : (S.board[slot] ? [S.board[slot]] : []);
      return `<div class="slot" data-slot="${slot}">
        <span class="lbl">${SLOT_LABEL[slot]}</span>
        ${ids.length
          ? `<button class="x" data-slot="${slot}" aria-label="Clear ${SLOT_LABEL[slot]}">×</button>
             <div class="fill">${ids.map(id => `<img src="${byId[id].front}" alt="${byId[id].name}">`).join('')}</div>`
          : `<div class="ph"><span>${slot === 'outer' ? 'Next top layers here' : 'Pick from closet'}</span></div>`}
      </div>`;
    }).join('');
    const all = allBoardIds();
    $('#palette').innerHTML = [...new Set(all.flatMap(id => byId[id].colors))]
      .map(c => `<i style="background:${COLORS[c]}" title="${c}"></i>`).join('');
    $('#dockCount').textContent = all.length;
    renderLooks();
  }
  const allBoardIds = () => ['outer','top','bottom','belt'].map(k => S.board[k]).filter(Boolean).concat(S.board.extra);

  function renderLooks(){
    $('#looksSaved').innerHTML = S.looks.length ? S.looks.map((l, n) => `
      <li data-n="${n}">
        <div class="thumbs">${l.ids.filter(id => byId[id]).slice(0,4).map(id => `<img src="${byId[id].front}" alt="">`).join('')}</div>
        <div class="nm">${l.name.replace(/[<>&]/g, '')}<small>${l.ids.length} pieces</small></div>
        <button data-act="load">Wear</button><button data-act="del" aria-label="Delete ${l.name.replace(/[<>&"]/g, '')}">Delete</button>
      </li>`).join('') : '<li class="none">Nothing saved yet. Build an outfit and name it above.</li>';
  }

  /* filters */
  $('#cats').innerHTML = CATS.map(([k, l]) => `<button data-cat="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('');
  $('#colors').innerHTML = Object.entries(COLORS)
    .filter(([c]) => ITEMS.some(i => i.colors.includes(c)))
    .map(([c, h]) => `<button class="sw" data-color="${c}" style="background:${h}" title="${c}" aria-label="${c}" aria-pressed="false"></button>`).join('');

  $('#cats').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.cat = b.dataset.cat;
    document.querySelectorAll('#cats button').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderCloset();
  });
  $('#colors').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.color = S.color === b.dataset.color ? null : b.dataset.color;
    document.querySelectorAll('#colors button').forEach(x => x.setAttribute('aria-pressed', x.dataset.color === S.color));
    renderCloset();
  });
  $('#q').addEventListener('input', e => { S.q = e.target.value; renderCloset(); });
  $('#side').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    S.side = b.dataset.side;
    document.querySelectorAll('#side button').forEach(x => x.setAttribute('aria-pressed', x === b));
    renderCloset();
  });
  $('#favOnly').addEventListener('click', e => {
    S.fav = !S.fav; e.currentTarget.setAttribute('aria-pressed', S.fav); renderCloset();
  });

  /* closet actions */
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const id = b.closest('.tile').dataset.id;
    if (b.dataset.act === 'pick') toggle(id);
    if (b.dataset.act === 'fav'){ S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); save(); renderCloset(); }
    if (b.dataset.act === 'open') openModal(id);
  });

  /* board actions */
  boardEl.addEventListener('click', e => {
    const x = e.target.closest('.x'); if (!x) return;
    const s = x.dataset.slot;
    if (s === 'extra') S.board.extra = []; else S.board[s] = null;
    save(); renderCloset(); renderBoard();
  });
  $('#clear').addEventListener('click', () => {
    S.board = { outer:null, top:null, bottom:null, belt:null, extra:[] };
    save(); renderCloset(); renderBoard();
  });
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  $('#shuffle').addEventListener('click', () => {
    const of = slot => ITEMS.filter(i => i.slot === slot).map(i => i.id);
    const tops = of('top').sort(() => Math.random() - .5);
    const b = { outer:null, top:tops[0], bottom:pick(of('bottom')), belt:null, extra:[] };
    if (Math.random() < .45) b.outer = tops[1];
    if (Math.random() < .7) b.belt = pick(of('belt'));
    const ex = of('extra').sort(() => Math.random() - .5).slice(0, Math.floor(Math.random() * 3));
    b.extra = ex; S.board = b;
    save(); renderCloset(); renderBoard();
  });
  $('#worn').addEventListener('click', () => {
    const ids = allBoardIds();
    if (!ids.length) return toast('Add pieces to the outfit first');
    const d = new Date().toISOString().slice(0, 10);
    ids.forEach(id => { const w = S.worn[id] || { n:0 }; S.worn[id] = { n:w.n + 1, last:d }; });
    save(); renderCloset(); toast(`Logged ${ids.length} pieces as worn`);
  });
  $('#saveForm').addEventListener('submit', e => {
    e.preventDefault();
    const ids = allBoardIds();
    if (!ids.length) return toast('Add pieces to the outfit first');
    const inp = $('#lookName');
    S.looks.unshift({ name: inp.value.trim() || `Look ${S.looks.length + 1}`, ids, board: JSON.parse(JSON.stringify(S.board)) });
    inp.value = ''; save(); renderLooks(); toast('Look saved');
  });
  $('#looksSaved').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const n = +b.closest('li').dataset.n;
    if (b.dataset.act === 'load'){ S.board = JSON.parse(JSON.stringify(S.looks[n].board)); save(); renderCloset(); renderBoard(); toast('Outfit loaded'); }
    if (b.dataset.act === 'del'){ S.looks.splice(n, 1); save(); renderLooks(); }
  });
  $('#dock').addEventListener('click', () => $('#builder').scrollIntoView());

  /* modal */
  const modal = $('#modal');
  function openModal(id){
    const i = byId[id];
    $('#mBody').innerHTML = `
      <div class="m-views">
        <div class="stage"><img class="f" src="${i.front}" alt="${i.name}, front"></div>
        ${i.back ? `<div class="stage"><img class="f" src="${i.back}" alt="${i.name}, back"></div>` : ''}
      </div>
      <div class="m-info">
        <h2>${i.name}</h2>
        <dl>
          <dt>Category</dt><dd>${CATS.find(c => c[0] === i.cat)[1]}</dd>
          <dt>Colors</dt><dd>${i.colors.map(c => `<span class="tag">${c}</span>`).join('')}</dd>
          <dt>Details</dt><dd>${i.tags.map(t => `<span class="tag">${t}</span>`).join('')}</dd>
          <dt>Worn</dt><dd>${S.worn[id] ? `${S.worn[id].n} times, last ${S.worn[id].last}` : 'Not yet'}</dd>
        </dl>
        <div class="m-actions">
          <button class="btn solid" data-m="pick">${onBoard(id) ? 'Remove from outfit' : 'Add to outfit'}</button>
          <button class="btn" data-m="fav">${S.favs.has(id) ? 'Unfavorite' : 'Favorite'}</button>
          <button class="btn ghost" data-m="close">Close</button>
        </div>
      </div>`;
    modal.classList.remove('narrow'); modal.dataset.id = id; modal.showModal();
  }
  modal.addEventListener('click', e => {
    if (e.target === modal) return modal.close();
    const b = e.target.closest('[data-m]'); if (!b) return;
    const id = modal.dataset.id;
    if (b.dataset.m === 'close') modal.close();
    if (b.dataset.m === 'open') openModal(b.dataset.id);
    if (b.dataset.m === 'pick'){ toggle(id); modal.close(); }
    if (b.dataset.m === 'fav'){ S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); save(); renderCloset(); openModal(id); }
  });


  /* ---------- looks (worn outfits) ---------- */
  const E = (top, outer, bottom, extra = ['ch']) => ({ top, outer, bottom, belt:null, extra });
  const LOOKS = [
    { name:'Racing layers',   img:'look-1.webp', d:'Hot Wheels tee over a maroon long sleeve, wide denim and a wallet chain.', board:E('mg','hw','jn') },
    { name:'Maroon on black', img:'look-2.webp', d:'The graphic long sleeve with loose wide-leg drawstring trousers.',        board:E('mg',null,'sp',[]) },
    { name:'Maroon denim',    img:'look-3.webp', d:'Graphic long sleeve, wide faded denim and a wallet chain.',               board:E('mg',null,'jn') },
    { name:'Portugal 7',      img:'look-4.webp', d:'The home jersey with baggy denim and a wallet chain.',                    board:E('pj',null,'jn') },
    { name:'Red check',       img:'look-5.webp', d:'Short sleeve red check shirt with script print, worn loose over denim.', board:E('rc',null,'jn') },
    { name:'Sleeve layer',    img:'look-6.webp', d:'Black logo tee over light sleeves, wide denim and a wallet chain.',       board:E('mb',null,'jn') },
    { name:'Hot Wheels tee',  img:'look-7.webp', d:'Racing graphic tee, wide denim and a wallet chain.',                      board:E('hw',null,'jn') }
  ];
  const N = LOOKS.length, pad2 = n => String(n).padStart(2, '0');
  const lookIds = l => [l.board.top, l.board.outer, l.board.bottom, l.board.belt, ...l.board.extra].filter(Boolean);

  /* hero */
  const heroStage = $('#heroStage'), heroDots = $('#heroDots');
  heroStage.innerHTML = LOOKS.map((l, i) => `<div class="hero-slide" aria-hidden="true"><img src="${l.img}" alt="${l.name}" ${i ? 'loading="lazy"' : ''}></div>`).join('');
  heroDots.innerHTML = LOOKS.map((l, i) => `<button role="tab" aria-label="${l.name}" data-i="${i}"></button>`).join('');
  let hi = -1, htimer;
  function hero(i){
    const sl = heroStage.children, prev = hi; hi = (i + N) % N;
    [...sl].forEach((el, k) => { el.classList.toggle('on', k === hi); el.classList.toggle('off', k === prev && k !== hi); });
    [...heroDots.children].forEach((d, k) => d.setAttribute('aria-selected', k === hi));
    $('#heroTag').textContent = `Look ${pad2(hi + 1)} · ${LOOKS[hi].name}`;
  }
  const heroPlay = () => { clearInterval(htimer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) htimer = setInterval(() => { if (!document.hidden) hero(hi + 1); }, 4500); };
  heroDots.addEventListener('click', e => { const b = e.target.closest('button'); if (b){ hero(+b.dataset.i); heroPlay(); } });
  hero(0); heroPlay();

  /* shelf */
  const cnt = c => ITEMS.filter(i => i.cat === c).length;
  $('#shelf').innerHTML = [
    ['tops','Tops', 'hotwheels-tee-front.webp', cnt('tops') + ' pieces'],
    ['bottoms','Bottoms', 'wide-jeans-front.webp', cnt('bottoms') + ' pieces'],
    ['accessories','Accessories', 'chain-set.webp', cnt('accessories') + ' pieces'],
    ['looks','Looks', 'look-4.webp', N + ' outfits']
  ].map(([k, l, img, c]) => `<a href="${k === 'looks' ? '#looks' : '#closet'}" data-cat="${k}"><img src="${img}" alt=""><span>${l}<small>${c}</small></span></a>`).join('');
  $('#shelf').addEventListener('click', e => {
    const a = e.target.closest('a[data-cat]'); if (!a || a.dataset.cat === 'looks') return;
    S.cat = a.dataset.cat;
    document.querySelectorAll('#cats button').forEach(x => x.setAttribute('aria-pressed', x.dataset.cat === S.cat));
    renderCloset();
  });

  /* carousel */
  const car = $('#car'), track = $('#carTrack');
  track.innerHTML = LOOKS.map((l, i) => `<div class="sl" data-i="${i}"><img src="${l.img}" alt="${l.name}" draggable="false" ${i > 2 && i < N - 1 ? 'loading="lazy"' : ''}></div>`).join('');
  $('#carDots').innerHTML = LOOKS.map((l, i) => `<button aria-label="${l.name}" data-i="${i}"></button>`).join('');
  let ci = 0;
  function layout(){
    const W = car.clientWidth, sw = Math.min(300, W * (W < 700 ? .58 : .42)), step = sw * .92;
    [...track.children].forEach((el, i) => {
      let o = ((i - ci + N + Math.floor(N / 2)) % N) - Math.floor(N / 2);
      el.classList.toggle('act', o === 0);
      el.style.transform = `translateX(calc(-50% + ${o * step}px)) scale(${o === 0 ? 1 : .76})`;
      el.style.opacity = o === 0 ? 1 : Math.abs(o) === 1 ? .4 : 0;
      el.style.zIndex = 5 - Math.abs(o);
      el.style.pointerEvents = Math.abs(o) > 1 ? 'none' : 'auto';
      el.setAttribute('aria-hidden', o !== 0);
    });
    [...$('#carDots').children].forEach((d, k) => d.setAttribute('aria-selected', k === ci));
  }
  function info(){
    const l = LOOKS[ci];
    $('#carInfo').innerHTML = `
      <div class="tagline"><span class="nw">Look ${pad2(ci + 1)}</span></div>
      <h3>${l.name}</h3><div class="count"><b>${pad2(ci + 1)}</b> / ${pad2(N)}</div>
      <p>${l.d}</p>
      <div class="car-btns" aria-live="polite">
        <button class="btn" data-a="pieces">See pieces</button>
        <button class="btn solid" data-a="try">Try in builder</button>
      </div>`;
  }
  function go(i){ ci = (i + N) % N; layout(); info(); }
  $('#prev').addEventListener('click', () => go(ci - 1));
  $('#next').addEventListener('click', () => go(ci + 1));
  $('#carDots').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); });
  track.addEventListener('click', e => { const sl = e.target.closest('.sl'); if (sl && !sl.classList.contains('act') && !drag.moved) go(+sl.dataset.i); });
  car.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(ci - 1); if (e.key === 'ArrowRight') go(ci + 1); });
  const drag = { x:null, moved:false };
  car.addEventListener('pointerdown', e => { if (e.target.closest('.car-btn,.car-dots')) return; drag.x = e.clientX; drag.moved = false; });
  car.addEventListener('pointerup', e => {
    if (drag.x === null) return;
    const dx = e.clientX - drag.x; drag.x = null;
    if (Math.abs(dx) > 40){ drag.moved = true; go(ci + (dx < 0 ? 1 : -1)); setTimeout(() => drag.moved = false, 50); }
  });
  car.addEventListener('pointercancel', () => drag.x = null);
  window.addEventListener('resize', layout);
  $('#carInfo').addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const l = LOOKS[ci];
    if (b.dataset.a === 'try'){
      S.board = JSON.parse(JSON.stringify(l.board)); save(); renderCloset(); renderBoard();
      $('#builder').scrollIntoView(); toast(`${l.name} loaded in builder`);
    } else {
      $('#mBody').innerHTML = `<div class="m-info list"><h2>${l.name}</h2><p>${lookIds(l).length} pieces</p>
        <div class="pcs">${lookIds(l).map(id => `<button class="pc" data-m="open" data-id="${id}"><img src="${byId[id].front}" alt=""><div><b>${byId[id].name}</b><span>${CATS.find(c => c[0] === byId[id].cat)[1]}</span></div></button>`).join('')}</div>
        <div class="m-actions"><button class="btn ghost" data-m="close">Close</button></div></div>`;
      modal.classList.add('narrow'); modal.showModal();
    }
  });
  go(0);
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => document.body.classList.toggle('at-top', en.isIntersecting), { threshold:.3 }).observe($('#home'));

  /* share, install, offline */
  $('#share').addEventListener('click', async () => {
    const data = { title:'Brainless', text:'Brainless but never clothless.', url:location.href.split('#')[0] };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); toast('Link copied'); }
    } catch {}
  });
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#install').hidden = false; });
  window.addEventListener('appinstalled', () => { $('#install').hidden = true; deferred = null; toast('Installed'); });
  $('#install').addEventListener('click', async () => {
    if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; $('#install').hidden = true;
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});

  /* save outfit as image */
  $('#img').addEventListener('click', async () => {
    const ids = allBoardIds(); if (!ids.length) return toast('Add pieces to the outfit first');
    try {
      const W = 1080, H = 1350, P = 40, G = 20, FH = 96, dark = matchMedia('(prefers-color-scheme: dark)').matches;
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      const bg = dark ? '#17191C' : '#E6E8EA', hi = dark ? '#363A3F' : '#FAFBFB', mid = dark ? '#2A2D31' : '#EEF0F2', lo = dark ? '#1E2023' : '#D8DBDE', ink = dark ? '#F1F2F3' : '#15171A';
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      const col1 = (W - 2 * P - G) * 1.35 / 2.35, col2 = W - 2 * P - G - col1, ih = H - P - FH, u = (ih - 3 * G) / 3.2, X2 = P + col1 + G;
      const R = { top:[P, P, col1, u * 1.6 + G], bottom:[P, P + u * 1.6 + 2 * G, col1, u * 1.6 + G], outer:[X2, P, col2, u], belt:[X2, P + u + G, col2, u * .6], extra:[X2, P + u * 1.6 + 2 * G, col2, u * 1.6 + G] };
      const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const panel = ([a, b, w, h]) => { const g = x.createRadialGradient(a + w / 2, b + h * .2, 10, a + w / 2, b + h * .2, h); g.addColorStop(0, hi); g.addColorStop(.6, mid); g.addColorStop(1, lo); x.fillStyle = g; x.beginPath(); x.roundRect(a, b, w, h, 18); x.fill(); };
      const fit = (im, [a, b, w, h], p = 30) => { const s = Math.min((w - 2 * p) / im.width, (h - 2 * p) / im.height), dw = im.width * s, dh = im.height * s; x.save(); x.shadowColor = 'rgba(20,25,30,.25)'; x.shadowBlur = 24; x.shadowOffsetY = 12; x.drawImage(im, a + (w - dw) / 2, b + (h - dh) / 2, dw, dh); x.restore(); };
      for (const k of Object.keys(R)){
        panel(R[k]);
        const list = k === 'extra' ? S.board.extra : S.board[k] ? [S.board[k]] : [];
        const ims = await Promise.all(list.map(id => load(byId[id].front)));
        ims.forEach((im, n) => { const [a, b, w, h] = R[k]; fit(im, [a, b + n * h / ims.length, w, h / ims.length], 24); });
      }
      x.fillStyle = ink; x.font = '800 38px "Hanken Grotesk",system-ui,sans-serif'; x.textBaseline = 'middle'; x.fillText('Brainless', P, H - FH / 2 + 8);
      x.font = '500 24px "Hanken Grotesk",system-ui,sans-serif'; x.textAlign = 'right'; x.globalAlpha = .6; x.fillText('Brainless but never clothless', W - P, H - FH / 2 + 8);
      c.toBlob(b => {
        if (!b) return toast('Could not save the image here');
        const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'brainless-outfit.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      });
    } catch { toast('Image saving works on the hosted version'); }
  });

  renderCloset(); renderBoard();
})();

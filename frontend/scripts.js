const API = 'http://localhost:8000'

const el = id => document.getElementById(id)
const listEl = el('list')
const searchEl = el('search')
const filtroGenero = el('filter-genero')
const filtroAno = el('filter-ano')
const filtroStatus = el('filter-status')
const sortEl = el('sort')
const modal = el('modal')
const form = el('form')
let editId = null
let currentPage = 1
const perPage = 10

// persistence for sort
sortEl.value = localStorage.getItem('biblioteca.sort') || 'titulo'
sortEl.addEventListener('change', ()=>{
  localStorage.setItem('biblioteca.sort', sortEl.value)
  load()
})

function openModal(data){
  modal.setAttribute('aria-hidden','false')
  if(data){
    editId = data.id
    el('f-titulo').value = data.titulo
    el('f-autor').value = data.autor
    el('f-ano').value = data.ano
    el('f-genero').value = data.genero || ''
    el('f-isbn').value = data.isbn || ''
    el('f-status').value = data.status
  } else {
    editId = null
    form.reset()
  }
  el('f-titulo').focus()
}
function closeModal(){
  modal.setAttribute('aria-hidden','true')
}

el('btn-new').addEventListener('click', ()=>openModal())
el('btn-cancel').addEventListener('click', closeModal)

// Alt+N to open modal
window.addEventListener('keydown', (e)=>{
  if(e.altKey && e.key.toLowerCase()==='n'){
    openModal()
    e.preventDefault()
  }
})

form.addEventListener('submit', async (ev)=>{
  ev.preventDefault()
  const payload = {
    titulo: el('f-titulo').value.trim(),
    autor: el('f-autor').value.trim(),
    ano: Number(el('f-ano').value),
    genero: el('f-genero').value || null,
    isbn: el('f-isbn').value || null,
    status: el('f-status').value
  }
  // simple local duplicate check
  const all = await fetch(`${API}/livros`).then(r=>r.json())
  if(!editId && all.some(b=>b.titulo.toLowerCase()===payload.titulo.toLowerCase())){
    alert('Título já existe (verifique antes de gravar)')
    return
  }

  if(editId){
    await fetch(`${API}/livros/${editId}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  } else {
    await fetch(`${API}/livros`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  }
  closeModal()
  load()
})

async function load(){
  const params = new URLSearchParams()
  if(searchEl.value) params.set('search', searchEl.value)
  if(filtroGenero.value) params.set('genero', filtroGenero.value)
  if(filtroAno.value) params.set('ano', filtroAno.value)
  if(filtroStatus.value) params.set('status', filtroStatus.value)
  params.set('page', currentPage)
  params.set('per_page', perPage)
  const url = `${API}/livros?${params.toString()}`
  const data = await fetch(url).then(r=>r.json())
  // sort
  const sortKey = localStorage.getItem('biblioteca.sort') || 'titulo'
  // server returns {items, total}
  const items = data.items || []
  items.sort((a,b)=>{
    if(sortKey==='ano') return b.ano - a.ano
    return a.titulo.localeCompare(b.titulo)
  })
  render(items)
  populateGeneroOptions(items)
  renderPagination(data.total || 0, data.page || currentPage)
}

function populateGeneroOptions(data){
  const generos = [...new Set(data.map(d=>d.genero).filter(Boolean))]
  filtroGenero.innerHTML = '<option value="">Todos</option>' + generos.map(g=>`<option>${g}</option>`).join('')
}

function render(items){
  listEl.innerHTML = ''
  if(!items.length) listEl.innerHTML = '<p>Nenhum resultado</p>'
  items.forEach(it=>{
    const card = document.createElement('article')
    card.className = 'card'
    const coverText = (it.genero && it.genero.toUpperCase()) || 'LIV'
    card.innerHTML = `
      <div class="cover">${coverText}</div>
      <div class="body">
        <h4>${it.titulo}</h4>
        <div class="meta">${it.autor} • ${it.ano}</div>
        <div style="margin-top:6px"><span class="badge ${it.status==='disponível' ? 'disponivel' : 'emprestado'}">${it.status}</span></div>
        <div class="actions">
          <button data-id="${it.id}" class="btn-edit">Editar</button>
          <button data-id="${it.id}" class="btn-delete">Excluir</button>
          <button data-id="${it.id}" class="btn-emprestar">${it.status==='disponível' ? 'Emprestar' : 'Devolver'}</button>
        </div>
      </div>`
    listEl.appendChild(card)
  })
  // delegate buttons
  listEl.querySelectorAll('.btn-edit').forEach(b=>b.addEventListener('click', async e=>{
    const id = e.target.dataset.id
    const book = await fetch(`${API}/livros`).then(r=>r.json()).then(arr=>arr.find(x=>x.id==id))
    openModal(book)
  }))
  listEl.querySelectorAll('.btn-delete').forEach(b=>b.addEventListener('click', async e=>{
    if(!confirm('Excluir livro?')) return
    await fetch(`${API}/livros/${e.target.dataset.id}`, {method:'DELETE'})
    load()
  }))
  listEl.querySelectorAll('.btn-emprestar').forEach(b=>b.addEventListener('click', async e=>{
    const id = e.target.dataset.id
    const txt = e.target.textContent
    if(txt.includes('Emprestar')){
      const res = await fetch(`${API}/livros/${id}/emprestar`, {method:'POST'})
      if(!res.ok) return toast('Não foi possível emprestar', 'error')
      toast('Livro emprestado', 'success')
    } else {
      const res = await fetch(`${API}/livros/${id}/devolver`, {method:'POST'})
      if(!res.ok) return toast('Não foi possível devolver', 'error')
      toast('Livro devolvido', 'success')
    }
    load()
  }))
}

function renderPagination(total, page){
  const pages = Math.max(1, Math.ceil(total / perPage))
  let nav = document.getElementById('pagination')
  if(!nav){
    nav = document.createElement('div');nav.id='pagination';nav.style.marginTop='12px';nav.style.display='flex';nav.style.gap='8px'
    document.querySelector('.main').appendChild(nav)
  }
  nav.innerHTML = `<button id="prev" ${page<=1? 'disabled':''}>Anterior</button> <span> ${page} / ${pages} </span> <button id="next" ${page>=pages? 'disabled':''}>Próxima</button>`
  document.getElementById('prev').onclick = ()=>{ if(page>1){ currentPage = page-1; load() } }
  document.getElementById('next').onclick = ()=>{ if(page<pages){ currentPage = page+1; load() } }
}

function toast(msg, type='info'){
  let t = document.getElementById('toast')
  if(!t){ t = document.createElement('div'); t.id='toast'; t.style.position='fixed'; t.style.right='16px'; t.style.bottom='16px'; t.style.padding='10px 14px'; t.style.borderRadius='8px'; t.style.color='#fff'; t.style.boxShadow='0 6px 20px rgba(2,6,23,0.2)'; document.body.appendChild(t) }
  t.style.background = type==='error' ? '#ef4444' : (type==='success' ? '#10b981' : '#1e3a8a')
  t.textContent = msg
  t.style.opacity = '1'
  setTimeout(()=>{ t.style.opacity='0'; }, 2500)
}

searchEl.addEventListener('input', debounce(load, 300))
[filtroGenero,filtroAno,filtroStatus].forEach(i=>i.addEventListener('change', load))

function debounce(fn, wait){let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a), wait)}}

// exporters
el('export-json').addEventListener('click', async ()=>{
  const data = await fetch(`${API}/livros`).then(r=>r.json())
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a');a.href=url;a.download='livros.json';a.click();URL.revokeObjectURL(url)
})
el('export-csv').addEventListener('click', async ()=>{
  const data = await fetch(`${API}/livros`).then(r=>r.json())
  const keys = ['id','titulo','autor','ano','genero','isbn','status','data_emprestimo']
  const csv = [keys.join(',')].concat(data.map(r=>keys.map(k=>`"${(r[k]||'').toString().replace(/"/g,'""')}"`).join(','))).join('\n')
  const blob = new Blob([csv], {type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a');a.href=url;a.download='livros.csv';a.click();URL.revokeObjectURL(url)
})

// initial load
load()

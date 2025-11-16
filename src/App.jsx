import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useQuery(){
  const { search } = useLocation()
  return useMemo(()=> new URLSearchParams(search), [search])
}

function Navbar({ cartCount, user, onLogout, dark, setDark }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const onSubmit = (e) => {
    e.preventDefault()
    navigate(`/?q=${encodeURIComponent(q)}`)
  }
  return (
    <div className={`sticky top-0 z-10 ${dark? 'bg-gray-900/80 text-gray-100' : 'bg-white/90 text-gray-900'} backdrop-blur border-b border-gray-200 dark:border-gray-800`}> 
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-extrabold text-xl text-indigo-600">VibeShop</Link>
        <form onSubmit={onSubmit} className="flex-1 flex">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search products..." className={`flex-1 border ${dark? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400':'bg-white'} rounded-l px-3 py-2`} />
          <button className="bg-indigo-600 text-white px-4 rounded-r">Search</button>
        </form>
        <button onClick={()=>setDark(!dark)} className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-700">{dark? 'Light':'Dark'}</button>
        <Link to="/cart" className="relative font-medium">
          Cart
          <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 text-xs bg-indigo-600 text-white rounded-full px-2">{cartCount}</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/orders" className="text-sm">Orders</Link>
            <span className="text-sm">Hi, {user.name}</span>
            <button onClick={onLogout} className="text-red-500 text-sm">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="text-sm">Login</Link>
        )}
      </div>
    </div>
  )
}

function ProductCard({ p, onAdd, dark }){
  return (
    <div className={`border rounded-md overflow-hidden hover:shadow transition ${dark? 'border-gray-700 bg-gray-800':''}`}>
      <img src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop'} alt={p.title} className="w-full h-44 object-cover" />
      <div className="p-3">
        <div className="font-medium line-clamp-2 h-12">{p.title}</div>
        <div className="text-indigo-400 font-semibold mt-1">${p.price?.toFixed(2)}</div>
        <Link to={`/product/${p.id}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600">View</Link>
        <button onClick={()=>onAdd(p)} className="ml-2 text-sm bg-indigo-600 text-white px-2 py-1 rounded">Add</button>
      </div>
    </div>
  )
}

function Filters({ categories, current, onSet, sort, setSort, dark }){
  return (
    <div className="flex items-center gap-3 mb-4">
      <select value={current||''} onChange={(e)=>onSet(e.target.value)} className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`}>
        <option value="">All Categories</option>
        {categories.map(c=> <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select value={sort} onChange={(e)=>setSort(e.target.value)} className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`}>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  )
}

function Home({ token, onAdd, dark }){
  const query = useQuery()
  const q = query.get('q') || ''
  const [data, setData] = useState({ items: [], total: 0 })
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(()=>{ fetch(`${API_BASE}/api/categories`).then(r=>r.json()).then(d=> setCategories(d.categories||[])) },[])
  useEffect(()=>{
    const params = new URLSearchParams()
    if(q) params.set('q', q)
    if(category) params.set('category', category)
    if(sort) params.set('sort', sort)
    fetch(`${API_BASE}/api/products?${params.toString()}`)
      .then(r=>r.json()).then(setData)
  }, [q, category, sort])

  return (
    <div className={`min-h-screen ${dark? 'bg-gray-900 text-gray-100':'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Products</h1>
        <Filters categories={categories} current={category} onSet={setCategory} sort={sort} setSort={setSort} dark={dark} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map(p=> <ProductCard key={p.id} p={p} onAdd={onAdd} dark={dark} />)}
        </div>
      </div>
    </div>
  )
}

function Login({ onLogin, dark }){
  const [email,setEmail] = useState('admin@example.com')
  const [password,setPassword] = useState('Admin@123')
  const navigate = useNavigate()
  const submit = async (e)=>{
    e.preventDefault()
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const res = await fetch(`${API_BASE}/api/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body: form })
    if(!res.ok){ alert('Login failed'); return }
    const data = await res.json()
    onLogin(data)
    navigate('/')
  }
  return (
    <div className={`max-w-md mx-auto px-4 py-10 ${dark? 'text-gray-100':''}`}>
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} className={`w-full border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className={`w-full border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Password" />
        <button className="w-full bg-indigo-600 text-white rounded py-2">Login</button>
      </form>
    </div>
  )
}

function Cart({ cart, setCart, token, dark }){
  const save = async (items)=>{
    if(!token){ return }
    await fetch(`${API_BASE}/api/cart`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ items }) })
  }
  const inc = (id)=>{ const items = cart.map(i=> i.product_id===id? {...i, qty:i.qty+1}:i); setCart(items); save(items) }
  const dec = (id)=>{ const items = cart.map(i=> i.product_id===id? {...i, qty: Math.max(1, i.qty-1)}:i); setCart(items); save(items) }
  const remove = (id)=>{ const items = cart.filter(i=> i.product_id!==id); setCart(items); save(items) }
  const total = cart.reduce((s,i)=> s + i.price*i.qty, 0)
  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 ${dark? 'text-gray-100':''}`}>
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <div className="space-y-3">
        {cart.map(it=> (
          <div key={it.product_id} className={`flex items-center gap-3 border rounded p-3 ${dark? 'border-gray-700':''}`}>
            <img src={it.image} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-gray-500">${it.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>dec(it.product_id)} className="px-2 border rounded">-</button>
              <span>{it.qty}</span>
              <button onClick={()=>inc(it.product_id)} className="px-2 border rounded">+</button>
            </div>
            <button onClick={()=>remove(it.product_id)} className="text-red-500">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-lg">Total: <span className="font-semibold">${total.toFixed(2)}</span></div>
        <Link to="/checkout" className="bg-indigo-600 text-white px-4 py-2 rounded">Checkout</Link>
      </div>
    </div>
  )
}

function Checkout({ cart, token, user, setCart, dark }){
  const [addr, setAddr] = useState({ full_name: user?.name || '', line1:'', city:'', state:'', postal_code:'', country:'US' })
  const navigate = useNavigate()
  const total = cart.reduce((s,i)=> s + i.price*i.qty, 0)
  const place = async ()=>{
    if(!token){ alert('Login first'); return }
    const intentRes = await fetch(`${API_BASE}/api/payments/intent`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ amount: total, currency:'usd' }) })
    const intent = await intentRes.json()
    const orderRes = await fetch(`${API_BASE}/api/orders`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ items: cart, shipping_address: addr, total_amount: total, currency:'usd', payment_intent_id: intent.id }) })
    if(orderRes.ok){ setCart([]); navigate('/orders') } else { alert('Order failed') }
  }
  return (
    <div className={`max-w-3xl mx-auto px-4 py-6 ${dark? 'text-gray-100':''}`}>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-2">Shipping Address</div>
          <div className="space-y-2">
            <input className={`w-full border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Full name" value={addr.full_name} onChange={e=>setAddr({...addr, full_name:e.target.value})} />
            <input className={`w-full border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Address line 1" value={addr.line1} onChange={e=>setAddr({...addr, line1:e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="City" value={addr.city} onChange={e=>setAddr({...addr, city:e.target.value})} />
              <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="State" value={addr.state} onChange={e=>setAddr({...addr, state:e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Postal code" value={addr.postal_code} onChange={e=>setAddr({...addr, postal_code:e.target.value})} />
              <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Country" value={addr.country} onChange={e=>setAddr({...addr, country:e.target.value})} />
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Order Summary</div>
          <div className="border rounded p-3 space-y-2">
            {cart.map(i=> <div key={i.product_id} className="flex justify-between text-sm"><span>{i.title} x {i.qty}</span><span>${(i.price*i.qty).toFixed(2)}</span></div>)}
            <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button onClick={place} className="w-full bg-indigo-600 text-white rounded py-2 mt-2">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Orders({ token, dark }){
  const [orders, setOrders] = useState([])
  useEffect(()=>{ if(!token) return; fetch(`${API_BASE}/api/orders`, { headers: { Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(d=>setOrders(d.orders||[])) }, [token])
  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 ${dark? 'text-gray-100':''}`}>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map(o=> (
          <div key={o.id} className={`border rounded p-3 ${dark? 'border-gray-700':''}`}>
            <div className="font-medium">Order #{o.id.slice(-6)}</div>
            <div className="text-sm text-gray-600">{new Date(o.created_at).toLocaleString()}</div>
            <div className="mt-2 text-sm">Items: {o.items.length} • Total: ${o.total_amount.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductDetail({ onAdd, token, dark }){
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  useEffect(()=>{ fetch(`${API_BASE}/api/products/${id}`).then(r=>r.json()).then(setP) }, [id])

  const submitReview = async ()=>{
    if(!token){ alert('Login first'); return }
    const res = await fetch(`${API_BASE}/api/products/${id}/reviews`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ rating, comment }) })
    if(res.ok){ const updated = await fetch(`${API_BASE}/api/products/${id}`).then(r=>r.json()); setP(updated); setComment(''); alert('Thanks for your review!') } else { const e = await res.json().catch(()=>({detail:'Failed'})); alert(e.detail||'Failed') }
  }

  if(!p) return <div className={`max-w-6xl mx-auto px-4 py-6 ${dark? 'text-gray-100':''}`}>Loading...</div>

  return (
    <div className={`max-w-6xl mx-auto px-4 py-6 ${dark? 'text-gray-100':''}`}>
      <div className="grid md:grid-cols-2 gap-6">
        <img src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop'} alt={p.title} className="w-full rounded border" />
        <div>
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <div className="text-gray-500 mt-1">{p.brand} • {p.category_name}</div>
          <div className="text-indigo-600 text-xl font-semibold mt-2">${p.price?.toFixed(2)}</div>
          <div className="mt-2 text-sm">Rating: {p.rating || 0} ({p.num_reviews || 0} reviews)</div>
          <p className="mt-4 text-sm leading-6">{p.description}</p>
          <button onClick={()=>onAdd(p)} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Add to Cart</button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Reviews</h2>
        <div className="space-y-3">
          {(p.reviews||[]).map(r=> (
            <div key={r.id} className={`border rounded p-3 ${dark? 'border-gray-700':''}`}>
              <div className="text-sm font-medium">{r.user_name} • {r.rating}★</div>
              <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
              <div className="mt-1 text-sm">{r.comment}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="font-medium mb-2">Write a review</div>
          <div className="flex items-center gap-2">
            <select value={rating} onChange={(e)=>setRating(parseInt(e.target.value))} className={`border rounded px-2 py-1 ${dark? 'bg-gray-800 border-gray-700':''}`}>
              {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n}★</option>)}
            </select>
            <input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Your review" className={`flex-1 border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} />
            <button onClick={submitReview} className="bg-indigo-600 text-white px-3 py-2 rounded">Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppShell(){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [cart, setCart] = useState([])
  const [dark, setDark] = useState(false)

  useEffect(()=>{ const saved = localStorage.getItem('session'); if(saved){ const s=JSON.parse(saved); setUser(s.user); setToken(s.access_token) } }, [])
  useEffect(()=>{ document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(()=>{ if(!token) return; fetch(`${API_BASE}/api/cart`, { headers: { Authorization:`Bearer ${token}` } }).then(r=>r.json()).then(d=> setCart(d.items||[])) }, [token])

  const onLogin = (data)=>{ setUser(data.user); setToken(data.access_token); localStorage.setItem('session', JSON.stringify(data)) }
  const onLogout = ()=>{ setUser(null); setToken(null); localStorage.removeItem('session') }
  const addToCart = (p)=>{ const exist = cart.find(i=>i.product_id===p.id); let items; if(exist){ items = cart.map(i=> i.product_id===p.id? {...i, qty:i.qty+1}:i) } else { items = [...cart, { product_id:p.id, title:p.title, price:p.price, image:p.images?.[0], qty:1 }] } setCart(items); if(token){ fetch(`${API_BASE}/api/cart`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ items }) }) } }

  return (
    <BrowserRouter>
      <Navbar cartCount={cart.reduce((s,i)=>s+i.qty,0)} user={user} onLogout={onLogout} dark={dark} setDark={setDark} />
      <Routes>
        <Route path="/" element={<Home token={token} onAdd={addToCart} dark={dark} />} />
        <Route path="/login" element={<Login onLogin={onLogin} dark={dark} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} token={token} dark={dark} />} />
        <Route path="/checkout" element={<Checkout cart={cart} token={token} user={user} setCart={setCart} dark={dark} />} />
        <Route path="/orders" element={<Orders token={token} dark={dark} />} />
        <Route path="/product/:id" element={<ProductDetail onAdd={addToCart} token={token} dark={dark} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppShell

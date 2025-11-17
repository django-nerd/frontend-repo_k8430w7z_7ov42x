import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function AdminPage({ token, user, dark }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', description:'', price:'', category_name:'', images:'', brand:'', count_in_stock:'0' })
  const [saving, setSaving] = useState(false)

  const isAdmin = !!user?.is_admin

  const load = async ()=>{
    setLoading(true)
    try{
      const res = await fetch(`${API_BASE}/api/products?sort=newest`)
      const data = await res.json()
      setItems(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  const submit = async (e)=>{
    e.preventDefault()
    if(!token){ alert('Please login as admin'); return }
    if(!isAdmin){ alert('Admin only'); return }
    setSaving(true)
    try{
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price || '0'),
        category_name: form.category_name.trim() || undefined,
        images: form.images.trim()? form.images.split(',').map(s=>s.trim()).filter(Boolean) : [],
        brand: form.brand.trim() || undefined,
        count_in_stock: parseInt(form.count_in_stock || '0', 10) || 0,
      }
      const res = await fetch(`${API_BASE}/api/products`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) })
      if(!res.ok){ const err = await res.json().catch(()=>({detail:'Failed'})); alert(err.detail || 'Failed to create'); return }
      setForm({ title:'', description:'', price:'', category_name:'', images:'', brand:'', count_in_stock:'0' })
      await load()
      alert('Product created')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id)=>{
    if(!token || !isAdmin) { alert('Admin only'); return }
    if(!confirm('Delete this product?')) return
    const res = await fetch(`${API_BASE}/api/products/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
    if(res.ok){ setItems(prev=> prev.filter(p=>p.id!==id)) } else { const e = await res.json().catch(()=>({detail:'Failed'})); alert(e.detail||'Failed') }
  }

  if(!user){
    return (
      <div className={`max-w-5xl mx-auto px-4 py-10 ${dark? 'text-gray-100':''}`}>
        <div className="text-lg">Please <Link className="text-indigo-600" to="/login">login</Link> as admin to manage products.</div>
      </div>
    )
  }
  if(!isAdmin){
    return (
      <div className={`max-w-5xl mx-auto px-4 py-10 ${dark? 'text-gray-100':''}`}>
        <div className="text-lg">Access restricted. Admins only.</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${dark? 'bg-gray-900 text-gray-100':'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin • Products</h1>
          <Link to="/" className="text-sm text-indigo-600">Back to store</Link>
        </div>

        <div className={`mt-6 border rounded p-4 ${dark? 'border-gray-700 bg-gray-800':''}`}>
          <div className="font-semibold mb-3">Add a new product</div>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
            <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
            <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
            <input type="number" step="0.01" className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required />
            <input type="number" className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Count in stock" value={form.count_in_stock} onChange={e=>setForm({...form, count_in_stock:e.target.value})} />
            <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Category name (e.g., Electronics)" value={form.category_name} onChange={e=>setForm({...form, category_name:e.target.value})} />
            <input className={`border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} placeholder="Image URLs (comma separated)" value={form.images} onChange={e=>setForm({...form, images:e.target.value})} />
            <textarea className={`md:col-span-2 border rounded px-3 py-2 ${dark? 'bg-gray-800 border-gray-700':''}`} rows={3} placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            <div className="md:col-span-2">
              <button disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded">{saving? 'Saving...':'Create product'}</button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <div className="font-semibold mb-3">All products</div>
          {loading? (
            <div>Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(p=> (
                <div key={p.id} className={`border rounded overflow-hidden ${dark? 'border-gray-700 bg-gray-800':''}`}>
                  <img src={(p.images && p.images[0]) || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop'} alt={p.title} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <div className="font-medium line-clamp-2 h-12">{p.title}</div>
                    <div className="text-indigo-400 font-semibold">${(p.price||0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{p.brand} • {p.category_name}</div>
                    <div className="flex items-center justify-between mt-2">
                      <Link to={`/product/${p.id}`} className="text-sm text-indigo-600">View</Link>
                      <button onClick={()=>remove(p.id)} className="text-sm text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

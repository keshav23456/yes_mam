'use client'
import { useState, useRef, useEffect } from 'react'
import { SEED_PARTNERS, Partner } from '@/lib/partners'

type Tab = 'dashboard' | 'partners' | 'agent' | 'alerts'

interface Message {
  role: 'user' | 'agent'
  content: string
  time: string
}

const statusColor: Record<string, string> = {
  'Active': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Under Review': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'Inactive': 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  'Suspended': 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const certColor: Record<string, string> = {
  'Certified': 'text-green-400',
  'Pending': 'text-yellow-400',
  'Expired': 'text-red-400',
}
function loadPartners(): Partner[] {
  try {
    const saved = localStorage.getItem('ym_partner_flags')
    if (!saved) return SEED_PARTNERS
    const flags: Record<string, string> = JSON.parse(saved)
    return SEED_PARTNERS.map(p => flags[p.id] ? { ...p, status: flags[p.id] as any } : p)
  } catch { return SEED_PARTNERS }
}

function saveFlag(id: string, status: string) {
  try {
    const saved = localStorage.getItem('ym_partner_flags')
    const flags = saved ? JSON.parse(saved) : {}
    flags[id] = status
    localStorage.setItem('ym_partner_flags', JSON.stringify(flags))
  } catch {}
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [partners, setPartners] = useState<Partner[]>(SEED_PARTNERS)
  const [dataSource, setDataSource] = useState<'seed' | 'lemma'>('seed')

  useEffect(() => {
    setPartners(loadPartners())
    fetch('/api/partners')
      .then(r => r.json())
      .then(data => {
        if (data.source === 'lemma' && data.partners?.length > 0) {
          const mapped = data.partners.map((p: any) => ({
            id: p.id?.slice(0, 8) ?? 'N/A',
            name: p.name ?? 'Unknown',
            city: p.city ?? 'Unknown',
            status: p.status === 'under_review' ? 'Under Review' :
                    p.status === 'suspended' ? 'Suspended' :
                    p.status === 'inactive' ? 'Inactive' : 'Active',
            complaints_count: p.complaints_count ?? 0,
            certification: p.certification_status === 'expired' ? 'Expired' :
                          p.certification_status === 'expiring_soon' ? 'Pending' : 'Certified',
            rating: p.rating ?? 0,
            last_active: p.updated_at?.slice(0, 10) ?? '',
            bookings_this_month: p.bookings_this_month ?? 0,
            phone: p.phone ?? '—',
            joined: p.created_at?.slice(0, 10) ?? '',
            specialization: p.specialization ?? 'Beauty Services',
          }))
          setPartners(mapped)
          setDataSource('lemma')
        }
      })
      .catch(() => {})
  }, [])
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hello! I\'m your Partner Ops AI. Ask me anything about your 20 beauty professionals — queries, flags, complaints, certifications, or city-wise breakdowns. Try: "Show high complaint partners" or "Who needs recertification?"', time: now() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const cities = ['All', ...Array.from(new Set(SEED_PARTNERS.map(p => p.city))).sort()]
  const statuses = ['All', 'Active', 'Under Review', 'Inactive', 'Suspended']

  const filtered = partners.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.specialization.toLowerCase().includes(search.toLowerCase())
    const matchCity = cityFilter === 'All' || p.city === cityFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchCity && matchStatus
  })

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg, time: now() }])
    setLoading(true)
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'agent', content: data.reply, time: now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'agent', content: 'Error connecting to agent. Check your API key.', time: now() }])
    }
    setLoading(false)
  }

  function flagPartner(id: string) {
     saveFlag(id, 'Under Review')  
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'Under Review' } : p))
    setSelectedPartner(null)
  }

  // Dashboard stats
  const totalActive = partners.filter(p => p.status === 'Active').length
  const highComplaint = partners.filter(p => p.complaints_count > 2).length
  const needsCert = partners.filter(p => p.certification !== 'Certified').length
  const inactive = partners.filter(p => p.status === 'Inactive' || p.status === 'Suspended').length
  const avgRating = (partners.reduce((s, p) => s + p.rating, 0) / partners.length).toFixed(1)

  const alerts = [
    ...partners.filter(p => p.complaints_count > 2).map(p => ({
      type: 'complaint', partner: p,
      msg: `${p.complaints_count} complaints this month — review recommended`
    })),
    ...partners.filter(p => p.certification === 'Expired').map(p => ({
      type: 'cert', partner: p,
      msg: 'Certification expired — cannot take new bookings'
    })),
    ...partners.filter(p => p.status === 'Inactive').map(p => ({
      type: 'inactive', partner: p,
      msg: 'Inactive for 14+ days — check in required'
    })),
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white font-sans">
      {/* Header */}
      <div className="border-b border-pink-500/20 bg-[#0d0d1a]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-sm font-bold">YM</div>
            <div>
              <div className="font-bold text-white">YesMadam Partner Ops Desk</div>
              <div className="text-xs text-pink-400">
              AI-Powered Operations · {partners.length} Partners ·{' '}
              <span className={dataSource === 'lemma' ? 'text-green-400' : 'text-yellow-400'}>
                {dataSource === 'lemma' ? '🟢 Live Lemma Data' : '🟡 Seed Data'}
              </span>
            </div>
            </div>
          </div>
          <div className="flex gap-2">
            {(['dashboard', 'partners', 'agent', 'alerts'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${tab === t ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t}{t === 'alerts' && alerts.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{alerts.length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Operations Overview</h2>
              <p className="text-gray-400 text-sm">Real-time partner health across 10 cities</p>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Active Partners', value: totalActive, sub: 'of 20 total', color: 'text-green-400' },
                { label: 'High Complaint', value: highComplaint, sub: 'need review', color: 'text-red-400' },
                { label: 'Cert Issues', value: needsCert, sub: 'expired or pending', color: 'text-yellow-400' },
                { label: 'Inactive / Suspended', value: inactive, sub: 'no recent bookings', color: 'text-gray-400' },
                { label: 'Avg Rating', value: avgRating, sub: 'across all partners', color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#16213E] border border-pink-500/10 rounded-xl p-5">
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm font-medium text-white mt-1">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* City breakdown */}
            <div className="bg-[#16213E] border border-pink-500/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">City Breakdown</h3>
              <div className="grid grid-cols-5 gap-3">
                {cities.filter(c => c !== 'All').map(city => {
                  const cityPartners = partners.filter(p => p.city === city)
                  const active = cityPartners.filter(p => p.status === 'Active').length
                  return (
                    <div key={city} className="bg-[#0d0d1a] rounded-lg p-3 border border-pink-500/5">
                      <div className="font-medium text-sm text-white">{city}</div>
                      <div className="text-2xl font-bold text-pink-400 mt-1">{cityPartners.length}</div>
                      <div className="text-xs text-gray-500">{active} active</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top performers */}
            <div className="bg-[#16213E] border border-pink-500/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers This Month</h3>
              <div className="space-y-2">
                {[...partners].sort((a, b) => b.bookings_this_month - a.bookings_this_month).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-pink-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs flex items-center justify-center font-bold">#{i + 1}</div>
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.city} · {p.specialization}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-pink-400 font-bold">{p.bookings_this_month} bookings</div>
                      <div className="text-xs text-yellow-400">★ {p.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS TABLE */}
        {tab === 'partners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Partner Database</h2>
                <p className="text-gray-400 text-sm">{filtered.length} partners shown</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ID, specialization..."
                className="flex-1 bg-[#16213E] border border-pink-500/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-pink-500" />
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                className="bg-[#16213E] border border-pink-500/20 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-pink-500">
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#16213E] border border-pink-500/20 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-pink-500">
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="bg-[#16213E] border border-pink-500/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pink-500/10 text-gray-400 text-xs uppercase">
                    {['ID', 'Name', 'City', 'Specialization', 'Status', 'Rating', 'Complaints', 'Certification', 'Bookings', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-pink-500/5 hover:bg-pink-500/5 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.id}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-300">{p.city}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{p.specialization}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-400 font-bold">★ {p.rating}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.complaints_count > 2 ? 'text-red-400 font-bold' : 'text-gray-300'}>{p.complaints_count}</span>
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${certColor[p.certification]}`}>{p.certification}</td>
                      <td className="px-4 py-3 text-pink-400 font-bold">{p.bookings_this_month}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedPartner(p)}
                          className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1 rounded-lg hover:bg-pink-500/20 transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI AGENT */}
        {tab === 'agent' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold">Partner Ops AI Agent</h2>
              <p className="text-gray-400 text-sm">Powered by Groq · llama-3.3-70b · Ask anything about your partners</p>
            </div>
            <div className="bg-[#16213E] border border-pink-500/10 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500 uppercase font-medium">Try these</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Show partners with complaints > 2',
                  'Who needs recertification?',
                  'Which partners are inactive?',
                  'Top 3 partners in Mumbai',
                  'Flag Anjali Verma for review',
                  'Summary of Delhi operations',
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs bg-pink-500/10 text-pink-300 border border-pink-500/20 px-3 py-1.5 rounded-full hover:bg-pink-500/20 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div ref={chatRef} className="bg-[#16213E] border border-pink-500/10 rounded-xl p-6 h-[420px] overflow-y-auto space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-[#0d0d1a] border border-pink-500/10'} rounded-xl px-4 py-3`}>
                    {m.role === 'agent' && <div className="text-xs text-pink-400 font-medium mb-1">Ops AI · {m.time}</div>}
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{m.content}</p>
                    {m.role === 'user' && <div className="text-xs text-gray-500 mt-1 text-right">{m.time}</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#0d0d1a] border border-pink-500/10 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about partners, complaints, cities, certifications..."
                className="flex-1 bg-[#16213E] border border-pink-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-pink-500" />
              <button onClick={sendMessage} disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors">
                Send
              </button>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {tab === 'alerts' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Active Alerts</h2>
              <p className="text-gray-400 text-sm">{alerts.length} issues need your attention</p>
            </div>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`bg-[#16213E] border rounded-xl p-5 flex items-center justify-between ${a.type === 'complaint' ? 'border-red-500/20' : a.type === 'cert' ? 'border-yellow-500/20' : 'border-gray-500/20'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${a.type === 'complaint' ? 'bg-red-500/20' : a.type === 'cert' ? 'bg-yellow-500/20' : 'bg-gray-500/20'}`}>
                      {a.type === 'complaint' ? '⚠️' : a.type === 'cert' ? '📋' : '💤'}
                    </div>
                    <div>
                      <div className="font-semibold">{a.partner.name} <span className="text-gray-500 text-sm font-normal">· {a.partner.id} · {a.partner.city}</span></div>
                      <div className="text-sm text-gray-400 mt-0.5">{a.msg}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[a.partner.status]}`}>{a.partner.status}</span>
                    {a.partner.status !== 'Under Review' && a.partner.status !== 'Suspended' && (
                      <button onClick={() => flagPartner(a.partner.id)}
                        className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors">
                        Flag for Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPartner(null)}>
          <div className="bg-[#16213E] border border-pink-500/20 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedPartner.name}</h3>
                <p className="text-gray-400 text-sm">{selectedPartner.id} · {selectedPartner.specialization}</p>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['City', selectedPartner.city],
                ['Phone', selectedPartner.phone],
                ['Joined', selectedPartner.joined],
                ['Last Active', selectedPartner.last_active],
                ['Rating', `★ ${selectedPartner.rating}`],
                ['Complaints', selectedPartner.complaints_count.toString()],
                ['Bookings This Month', selectedPartner.bookings_this_month.toString()],
                ['Certification', selectedPartner.certification],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-pink-500/5">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-white">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[selectedPartner.status]}`}>{selectedPartner.status}</span>
              {selectedPartner.status === 'Active' && (
                <button onClick={() => flagPartner(selectedPartner.id)}
                  className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors">
                  Flag for Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

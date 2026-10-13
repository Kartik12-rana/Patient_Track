import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Ambulance, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, CircleHelp, Clock3, ClipboardList, Command, FileText, Filter,
  HeartPulse, Home, MapPin, Menu, MoreHorizontal, Navigation, Plus, RefreshCw,
  Search, Settings, ShieldCheck, SlidersHorizontal, Truck, UserRound, Users, X,
  Zap, Route, Phone, CircleCheck, AlertCircle, CalendarClock, ExternalLink
} from 'lucide-react'
import { api } from './api'

const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList, count: '12' },
    { id: 'tracking', label: 'Live tracking', icon: Navigation, live: true },
  ]},
  { label: 'OPERATIONS', items: [
    { id: 'drivers', label: 'Drivers', icon: UserRound },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'partners', label: 'Transport partners', icon: Users },
  ]},
  { label: 'MANAGE', items: [
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]},
]
const statusClass = {
  'Confirmed':'confirmed', 'Pending assignment':'pending', 'Driver en route':'blue',
  'Arrived at pickup':'purple', 'Patient picked up':'purple', 'In transit':'blue',
  'Completed':'completed', 'Cancelled':'cancelled', 'No show':'cancelled'
}
const fmtMoney = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(n || 0))
const fmtDate = value => value ? new Date(value).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Not scheduled'
const initials = s => (s || 'NA').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase()

function Status({ status }) { return <span className={`status ${statusClass[status] || 'pending'}`}><i />{status}</span> }
function Avatar({ name, color = 'lavender' }) { return <span className={`avatar ${color}`}>{initials(name)}</span> }
function Button({ children, kind = 'primary', onClick, icon: Icon, ...props }) {
  return <button className={`button ${kind}`} onClick={onClick} {...props}>{Icon && <Icon size={16} />}{children}</button>
}
function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{actions}</div></div>
}
function EmptyState({ title, description }) { return <div className="empty-state"><ClipboardList size={30}/><b>{title}</b><span>{description}</span></div> }

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [mobileNav, setMobileNav] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [bookings, setBookings] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All statuses')
  const [showBooking, setShowBooking] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [trackingId, setTrackingId] = useState('BK-1048')
  const [tracking, setTracking] = useState(null)
  const [trackingTick, setTrackingTick] = useState(0)
  const [form, setForm] = useState({
    patientName:'', phone:'', pickup:'', destination:'', date:new Date(Date.now()+86400000).toISOString().slice(0,16),
    tripType:'One way', mobility:'Walking assistance', vehicleType:'Patient transport', passengers:'1', notes:''
  })

  const refresh = async () => {
    setLoading(true)
    try {
      const [d,b,dr,v,p] = await Promise.all([api.dashboard(),api.bookings(),api.drivers(),api.vehicles(),api.partners()])
      setDashboard(d); setBookings(b); setDrivers(dr); setVehicles(v); setPartners(p)
      setNotice('')
    } catch (e) { setNotice(`Could not connect to the demo backend: ${e.message}`) }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (page !== 'tracking') return
    let mounted = true
    const load = async () => {
      try { const t = await api.tracking(trackingId); if (mounted) setTracking(t) }
      catch { if (mounted) setTracking(null) }
    }
    load()
    const timer = setInterval(() => { setTrackingTick(x=>x+1); load() }, 4000)
    return () => { mounted=false; clearInterval(timer) }
  }, [page, trackingId, trackingTick])

  const filteredBookings = useMemo(() => bookings.filter(b => {
    const matches = `${b.reference} ${b.patientName} ${b.pickup} ${b.destination} ${b.driverName || ''}`.toLowerCase().includes(search.toLowerCase())
    return matches && (filterStatus === 'All statuses' || b.status === filterStatus)
  }), [bookings, search, filterStatus])

  const flash = message => { setNotice(message); setTimeout(()=>setNotice(''), 3600) }
  const navigate = id => { setPage(id); setMobileNav(false); setSearch('') }
  const changeStatus = async (booking, status) => {
    try {
      await api.updateStatus(booking.id, status)
      await refresh()
      setSelectedBooking(null)
      flash(`${booking.reference} updated to ${status}.`)
    } catch (e) { flash(e.message) }
  }
  const submitBooking = async e => {
    e.preventDefault()
    try {
      const created = await api.createBooking({ ...form, passengers:Number(form.passengers) })
      await refresh()
      setShowBooking(false)
      setForm({ patientName:'',phone:'',pickup:'',destination:'',date:new Date(Date.now()+86400000).toISOString().slice(0,16),tripType:'One way',mobility:'Walking assistance',vehicleType:'Patient transport',passengers:'1',notes:'' })
      flash(`Booking ${created.reference} created successfully.`)
      setPage('bookings')
    } catch (e) { flash(e.message) }
  }
  const resetDemo = async () => { await api.reset(); await refresh(); flash('Demo data has been reset.') }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-mark"><HeartPulse size={22}/></div><div><strong>care<span>route</span></strong><small>Patient mobility</small></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-icon"><ShieldCheck size={17}/></div><div><b>CareRoute Services</b><small>Operations workspace</small></div><ChevronDown size={15}/></div>
      <div className="nav-scroll">{navGroups.map(group=><div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item=><button key={item.id} onClick={()=>navigate(item.id)} className={`nav-item ${page===item.id?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{item.count&&<em>{bookings.length || item.count}</em>}{item.live&&<i className="live-dot"/>}</button>)}</div>)}</div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><div><b>Need a hand?</b><span>Visit the help centre</span></div><ArrowRight size={15}/></div><div className="profile-row"><Avatar name="Kartik Rana" color="mint"/><div className="profile-info"><b>Kartik Rana</b><span>Administrator</span></div><MoreHorizontal size={20}/></div></div>
    </aside>
    {mobileNav && <div className="scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{navGroups.flatMap(g=>g.items).find(x=>x.id===page)?.label || (page==='reports'?'Reports':'Settings')}</b></div><div className="topbar-right"><span className="system-status"><i/> All systems operational</span><button className="icon-button" aria-label="Search" onClick={()=>navigate('bookings')}><Search size={18}/></button><button className="icon-button notification" aria-label="Notifications" onClick={()=>flash('You are all caught up.')}><Bell size={18}/><i/></button><div className="top-divider"/><Avatar name="Kartik Rana" color="mint"/><ChevronDown size={14}/></div></header>
      <div className="page-content">
        {notice && <div className={`toast ${notice.startsWith('Could not')?'error':''}`}><CircleCheck size={17}/><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {page==='dashboard' && <Dashboard dashboard={dashboard} bookings={bookings} loading={loading} onNew={()=>setShowBooking(true)} onView={b=>setSelectedBooking(b)} onNavigate={navigate}/>}
        {page==='bookings' && <Bookings bookings={filteredBookings} allBookings={bookings} search={search} setSearch={setSearch} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onNew={()=>setShowBooking(true)} onView={setSelectedBooking} loading={loading}/>}
        {page==='tracking' && <Tracking tracking={tracking} bookings={bookings} trackingId={trackingId} setTrackingId={setTrackingId} tick={trackingTick} onNavigate={navigate}/>}
        {page==='drivers' && <ResourcePage type="drivers" items={drivers} onRefresh={refresh}/>}
        {page==='vehicles' && <ResourcePage type="vehicles" items={vehicles} onRefresh={refresh}/>}
        {page==='partners' && <ResourcePage type="partners" items={partners} onRefresh={refresh}/>}
        {page==='reports' && <Reports bookings={bookings} dashboard={dashboard}/>}
        {page==='settings' && <SettingsPage onReset={resetDemo}/>}
      </div>
      <footer className="footer"><span>© 2026 CareRoute Services</span><span><i/> Demo environment <span className="footer-sep">•</span> v0.1.0</span></footer>
    </main>
    {showBooking && <BookingModal form={form} setForm={setForm} onClose={()=>setShowBooking(false)} onSubmit={submitBooking}/>}
    {selectedBooking && <BookingDetails booking={selectedBooking} onClose={()=>setSelectedBooking(null)} onStatus={status=>changeStatus(selectedBooking,status)}/>}
  </div>
}

function Dashboard({ dashboard, bookings, loading, onNew, onView, onNavigate }) {
  const active = bookings.filter(b=>['Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit'].includes(b.status))
  const upcoming = bookings.filter(b=>!['Completed','Cancelled','No show'].includes(b.status)).slice(0,5)
  const metrics = [
    {label:'Total bookings',value:dashboard?.totalBookings ?? '—',change:'+12.8%',sub:'vs. previous 30 days',icon:ClipboardList,tone:'lavender',trend:'up'},
    {label:'Active trips',value:dashboard?.activeTrips ?? '—',change:'Live',sub:'Currently on the road',icon:Navigation,tone:'blue',trend:'live'},
    {label:'Available vehicles',value:dashboard?.availableVehicles ?? '—',change:`of ${dashboard?.totalVehicles ?? '—'}`,sub:'Ready for assignment',icon:Ambulance,tone:'mint',trend:'neutral'},
    {label:'Completed trips',value:dashboard?.completedTrips ?? '—',change:'+8.4%',sub:'vs. previous 30 days',icon:CircleCheck,tone:'peach',trend:'up'},
  ]
  return <>
    <PageHeading eyebrow="TUESDAY, OCTOBER 13, 2026" title="Good morning, Kartik 👋" description="Here's what's happening with your patient transport service today." actions={<><Button kind="secondary" icon={CalendarDays} onClick={()=>onNavigate('reports')}>View reports</Button><Button icon={Plus} onClick={onNew}>New booking</Button></>}/>
    <div className="welcome-banner"><div className="banner-copy"><div className="banner-tag"><Zap size={13}/> YOUR OPERATIONS AT A GLANCE</div><h2>Every journey, <span>with care.</span></h2><p>Keep your team connected and every patient journey on track from pickup to arrival.</p><button onClick={()=>onNavigate('tracking')}>Open live tracking <ArrowRight size={15}/></button></div><div className="banner-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-pin"><MapPin size={30}/></div><div className="art-route route-one"/><div className="art-route route-two"/><div className="art-van"><Ambulance size={55}/></div><div className="art-small-pin"><HeartPulse size={17}/></div></div></div>
    <div className="metrics-grid">{metrics.map(m=><div className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><span className={`metric-icon ${m.tone}`}><m.icon size={18}/></span></div><div className="metric-value">{loading?'—':m.value}</div><div className="metric-foot">{m.trend==='up'?<ArrowUpRight size={14}/>:m.trend==='live'?<i className="live-dot"/>:null}<b className={m.trend==='up'?'green-text':''}>{m.change}</b><span>{m.sub}</span></div></div>)}</div>
    <div className="content-grid"><section className="panel bookings-panel"><div className="panel-heading"><div><h3>Upcoming bookings</h3><p>Your next patient pickups</p></div><button className="text-action" onClick={()=>onNavigate('bookings')}>View all <ArrowRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>BOOKING</th><th>PATIENT</th><th>PICKUP TIME</th><th>STATUS</th><th></th></tr></thead><tbody>{upcoming.map(b=><tr key={b.id} onClick={()=>onView(b)} className="clickable-row"><td><b className="booking-ref">{b.reference}</b><span className="sub-cell">{b.tripType}</span></td><td><div className="person-cell"><Avatar name={b.patientName}/><div><b>{b.patientName}</b><span>{b.vehicleType}</span></div></div></td><td><div className="time-cell"><CalendarClock size={15}/><span>{fmtDate(b.scheduledAt)}</span></div></td><td><Status status={b.status}/></td><td><button className="row-more" onClick={e=>{e.stopPropagation();onView(b)}}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{upcoming.length===0&&<EmptyState title="No upcoming bookings" description="Create a booking to get started."/ >}</div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h3>Live operations</h3><p>Current service overview</p></div><span className="live-pill"><i/> LIVE</span></div><div className="mini-map"><div className="map-road road-a"/><div className="map-road road-b"/><div className="map-road road-c"/><div className="map-road road-d"/><div className="map-water"/><div className="map-block block-a"/><div className="map-block block-b"/><div className="map-block block-c"/><div className="map-route-line"/><div className="map-pin pin-a"><Ambulance size={16}/></div><div className="map-pin pin-b"><MapPin size={15}/></div><div className="map-label">Active trip</div><div className="map-scale">Map preview · simulated</div></div><div className="ops-summary"><div><span className="ops-dot blue-dot"/><span>Trips in progress</span><b>{active.length}</b></div><div><span className="ops-dot green-dot"/><span>Ready for assignment</span><b>{bookings.filter(b=>b.status==='Pending assignment').length}</b></div><div><span className="ops-dot orange-dot"/><span>Needs attention</span><b>{bookings.filter(b=>['No show','Cancelled'].includes(b.status)).length}</b></div></div><button className="full-width-link" onClick={()=>onNavigate('tracking')}>Monitor all active trips <ArrowRight size={15}/></button></section></div>
    <div className="bottom-grid"><section className="panel"><div className="panel-heading"><div><h3>Fleet availability</h3><p>Vehicle readiness at a glance</p></div><button className="text-action" onClick={()=>onNavigate('vehicles')}>Manage fleet <ArrowRight size={15}/></button></div><div className="fleet-bar"><div style={{width:`${dashboard?.totalVehicles?dashboard.availableVehicles/dashboard.totalVehicles*100:0}%`}}/></div><div className="fleet-legend"><span><i className="legend-green"/>Available <b>{dashboard?.availableVehicles ?? 0}</b></span><span><i className="legend-blue"/>On trip <b>{dashboard?.busyVehicles ?? 0}</b></span><span><i className="legend-gray"/>Offline <b>{dashboard?.offlineVehicles ?? 0}</b></span></div></section><section className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Common tasks, one click away</p></div></div><div className="quick-actions"><button onClick={onNew}><span className="quick-icon lavender"><Plus size={18}/></span><span><b>Create a booking</b><small>Schedule a patient pickup</small></span><ArrowRight size={15}/></button><button onClick={()=>onNavigate('drivers')}><span className="quick-icon mint"><UserRound size={18}/></span><span><b>Manage drivers</b><small>View driver availability</small></span><ArrowRight size={15}/></button><button onClick={()=>onNavigate('partners')}><span className="quick-icon peach"><ShieldCheck size={18}/></span><span><b>Verify a partner</b><small>Review provider details</small></span><ArrowRight size={15}/></button></div></section></div>
  </>
}

function Bookings({ bookings, allBookings, search, setSearch, filterStatus, setFilterStatus, onNew, onView, loading }) {
  return <><PageHeading eyebrow="TRIP MANAGEMENT" title="Bookings" description="Manage patient journeys from the first request to safe arrival." actions={<Button icon={Plus} onClick={onNew}>New booking</Button>}/><div className="list-stats"><div><span>All bookings</span><b>{allBookings.length}</b></div><div><span>Awaiting assignment</span><b>{allBookings.filter(b=>b.status==='Pending assignment').length}</b></div><div><span>Active trips</span><b>{allBookings.filter(b=>['Driver en route','Arrived at pickup','Patient picked up','In transit'].includes(b.status)).length}</b></div><div><span>Completed</span><b>{allBookings.filter(b=>b.status==='Completed').length}</b></div></div><section className="panel full-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking, patient, location..."/></div><div className="toolbar-actions"><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option>All statuses</option>{['Pending assignment','Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit','Completed','Cancelled','No show'].map(s=><option key={s}>{s}</option>)}</select><button className="button secondary" onClick={()=>{setSearch('');setFilterStatus('All statuses')}}><Filter size={15}/> Clear filters</button></div></div><div className="table-wrap"><table className="wide-table"><thead><tr><th>BOOKING DETAILS</th><th>PATIENT</th><th>JOURNEY</th><th>SCHEDULED</th><th>DRIVER</th><th>STATUS</th><th>FARE</th><th></th></tr></thead><tbody>{bookings.map(b=><tr key={b.id} className="clickable-row" onClick={()=>onView(b)}><td><b className="booking-ref">{b.reference}</b><span className="sub-cell">{b.tripType} · {b.vehicleType}</span></td><td><div className="person-cell"><Avatar name={b.patientName}/><div><b>{b.patientName}</b><span>{b.phone}</span></div></div></td><td><div className="journey-cell"><span><i className="journey-dot start"/> {b.pickup}</span><span><i className="journey-dot end"/> {b.destination}</span></div></td><td><div className="time-cell"><CalendarDays size={15}/>{fmtDate(b.scheduledAt)}</div></td><td>{b.driverName?<div className="person-cell"><Avatar name={b.driverName} color="mint"/><div><b>{b.driverName}</b><span>{b.vehicleNumber || 'Assigned driver'}</span></div></div>:<span className="muted">Not assigned</span>}</td><td><Status status={b.status}/></td><td><b>{fmtMoney(b.fare)}</b></td><td><button className="row-more" onClick={e=>{e.stopPropagation();onView(b)}}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{!loading&&bookings.length===0&&<EmptyState title="No bookings found" description="Try another search or create a new booking."/ >}</div><div className="table-bottom"><span>Showing <b>{bookings.length}</b> of <b>{allBookings.length}</b> bookings</span><span>Demo data · changes are temporary</span></div></section></>
}

function Tracking({ tracking, bookings, trackingId, setTrackingId, tick, onNavigate }) {
  const [layers,setLayers] = useState(true)
  const b = tracking?.booking
  const lat = tracking?.latitude || 22.839
  const lng = tracking?.longitude || 69.721
  return <><PageHeading eyebrow="REAL-TIME OPERATIONS" title="Live tracking" description="Follow active patient journeys and keep every pickup on schedule." actions={<span className="live-pill large"><i/> SIMULATED LIVE</span>}/><div className="tracking-toolbar"><div><label>SELECT TRIP</label><select value={trackingId} onChange={e=>setTrackingId(e.target.value)}>{bookings.map(x=><option key={x.id} value={x.reference}>{x.reference} · {x.patientName}</option>)}</select></div><div className="tracking-last"><span className="live-dot"/><div><b>Location stream active</b><small>Last update {tracking?.updatedAt?new Date(tracking.updatedAt).toLocaleTimeString('en-IN'):'waiting for data'}</small></div></div><Button kind="secondary" icon={RefreshCw} onClick={()=>setLayers(x=>!x)}>{layers?'Hide trip details':'Show trip details'}</Button></div><div className="tracking-layout"><section className="map-large"><div className="map-controls"><button><Plus size={16}/></button><button><span>−</span></button><button onClick={()=>setLayers(x=>!x)}><SlidersHorizontal size={16}/></button></div><div className="big-map-grid"><div className="big-road r1"/><div className="big-road r2"/><div className="big-road r3"/><div className="big-road r4"/><div className="big-road r5"/><div className="big-water"/><div className="big-green g1"/><div className="big-green g2"/><div className="big-green g3"/><div className="big-route"><span/></div><div className="destination-marker"><MapPin size={21}/></div><div className="vehicle-marker"><Ambulance size={22}/></div><div className="map-callout pickup-callout"><b>Pickup location</b><span>{b?.pickup || 'Patient pickup point'}</span></div><div className="map-callout destination-callout"><b>Destination</b><span>{b?.destination || 'Hospital destination'}</span></div><div className="map-coordinates">GPS {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)} · Demo simulation</div><div className="map-attribution">Illustrative map preview · no real road routing</div></div><div className="map-legend"><span><i className="legend-pin vehicle-pin"/><b>Transport vehicle</b></span><span><i className="legend-pin destination-pin"/><b>Hospital destination</b></span></div></section>{layers&&<aside className="tracking-side"><div className="panel-heading"><div><h3>Trip overview</h3><p>{b?.reference || 'Select a trip'}</p></div><Status status={b?.status || 'Pending assignment'}/></div><div className="tracking-patient"><Avatar name={b?.patientName || 'Patient'} color="lavender"/><div><b>{b?.patientName || 'Patient name'}</b><span>{b?.phone || 'Contact not available'}</span></div><button className="icon-button" title="Call patient"><Phone size={16}/></button></div><div className="eta-card"><div className="eta-icon"><Clock3 size={20}/></div><div><small>ESTIMATED ARRIVAL</small><h2>{tracking?.eta || '18 min'}</h2><span>Simulated estimate · not for navigation</span></div></div><div className="route-details"><div className="route-point"><i className="route-start"/><div><small>PICKUP FROM</small><b>{b?.pickup || 'Patient pickup location'}</b><span>{b?.scheduledAt?fmtDate(b.scheduledAt):'Scheduled time pending'}</span></div></div><div className="route-connector"/><div className="route-point"><i className="route-end"/><div><small>DESTINATION</small><b>{b?.destination || 'Hospital destination'}</b><span>{tracking?.distance || '6.2 km'} estimated route</span></div></div></div><div className="driver-card"><div className="panel-mini-title">ASSIGNED DRIVER</div><div className="person-cell"><Avatar name={b?.driverName || 'Unassigned'} color="mint"/><div><b>{b?.driverName || 'Awaiting assignment'}</b><span>{b?.vehicleNumber || 'Vehicle not assigned'}</span></div><span className="verified-mark"><Check size={13}/></span></div><div className="driver-meta"><span><Phone size={14}/> {b?.driverPhone || 'Not available'}</span><span><ShieldCheck size={14}/> Demo verified</span></div></div><div className="tracking-note"><AlertCircle size={16}/><span>This is simulated tracking. Connect a maps provider and real driver GPS before production.</span></div><Button kind="secondary" onClick={()=>onNavigate('bookings')} >Open booking details <ArrowRight size={15}/></Button></aside>}</div></>
}

function ResourcePage({ type, items, onRefresh }) {
  const config = {
    drivers:{title:'Drivers', eyebrow:'FLEET TEAM', desc:'Manage driver profiles, availability and verification.', noun:'driver', icon:UserRound, cols:['DRIVER','PARTNER','PHONE','AVAILABILITY','VERIFICATION'], empty:'No drivers'},
    vehicles:{title:'Vehicles', eyebrow:'FLEET MANAGEMENT', desc:'Keep vehicle capabilities, documents and readiness up to date.', noun:'vehicle', icon:Truck, cols:['VEHICLE','PARTNER','CAPACITY','READINESS','VERIFICATION'], empty:'No vehicles'},
    partners:{title:'Transport partners', eyebrow:'PROVIDER NETWORK', desc:'Review partner registrations and manage provider status.', noun:'partner', icon:Users, cols:['PARTNER','CONTACT','FLEET SIZE','STATUS','VERIFICATION'], empty:'No partners'}
  }[type]
  const [q,setQ] = useState('')
  const filtered = items.filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))
  return <><PageHeading eyebrow={config.eyebrow} title={config.title} description={config.desc} actions={<><Button kind="secondary" icon={RefreshCw} onClick={onRefresh}>Refresh</Button><Button icon={Plus} onClick={()=>alert(`The ${config.noun} create form will be added in the next build step.`)}>Add {config.noun}</Button></>}/><section className="panel full-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${type}...`}/></div><span className="result-count">{filtered.length} records</span></div><div className="table-wrap"><table className="wide-table"><thead><tr>{config.cols.map(c=><th key={c}>{c}</th>)}<th></th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}>{type==='drivers'&&<><td><div className="person-cell"><Avatar name={x.name}/><div><b>{x.name}</b><span>{x.licenseLabel}</span></div></div></td><td>{x.partnerName}</td><td>{x.phone}</td><td><Status status={x.availability}/></td><td><Status status={x.verification}/></td></>}
    {type==='vehicles'&&<><td><div className="vehicle-cell"><span className="vehicle-icon"><Truck size={18}/></span><div><b>{x.registration}</b><span>{x.type}</span></div></div></td><td>{x.partnerName}</td><td>{x.capacity} passengers</td><td><Status status={x.readiness}/></td><td><Status status={x.verification}/></td></>}
    {type==='partners'&&<><td><div className="person-cell"><Avatar name={x.name} color="mint"/><div><b>{x.name}</b><span>{x.city}</span></div></div></td><td>{x.contactName}<span className="sub-cell">{x.phone}</span></td><td>{x.vehicleCount} vehicles</td><td><Status status={x.status}/></td><td><Status status={x.verification}/></td></>}
    <td><button className="row-more" onClick={()=>alert(`${x.name || x.registration}: details panel can be added in the next iteration.`)}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<EmptyState title={config.empty} description="Try a different search term."/ >}</div></section></>
}

function Reports({ bookings, dashboard }) {
  const completed=bookings.filter(b=>b.status==='Completed')
  const cancelled=bookings.filter(b=>b.status==='Cancelled')
  const totalRevenue=completed.reduce((sum,b)=>sum+Number(b.fare||0),0)
  const bars=[42,60,52,76,58,86,68,94,72,82,65,100]
  return <><PageHeading eyebrow="PERFORMANCE INSIGHTS" title="Reports" description="A quick view of service activity and operational performance." actions={<Button kind="secondary" icon={FileText} onClick={()=>window.print()}>Print report</Button>}/><div className="metrics-grid report-metrics"><div className="metric-card"><div className="metric-top"><span>Total bookings</span><span className="metric-icon lavender"><ClipboardList size={18}/></span></div><div className="metric-value">{bookings.length}</div><div className="metric-foot"><span>Demo records in this environment</span></div></div><div className="metric-card"><div className="metric-top"><span>Completed trips</span><span className="metric-icon mint"><CircleCheck size={18}/></span></div><div className="metric-value">{completed.length}</div><div className="metric-foot"><span>Successfully completed</span></div></div><div className="metric-card"><div className="metric-top"><span>Cancelled trips</span><span className="metric-icon peach"><X size={18}/></span></div><div className="metric-value">{cancelled.length}</div><div className="metric-foot"><span>Review cancellation reasons</span></div></div><div className="metric-card"><div className="metric-top"><span>Completed fare total</span><span className="metric-icon blue"><Activity size={18}/></span></div><div className="metric-value">{fmtMoney(totalRevenue)}</div><div className="metric-foot"><span>Illustrative fare total, not accounting data</span></div></div></div><div className="content-grid report-grid"><section className="panel"><div className="panel-heading"><div><h3>Booking activity</h3><p>Illustrative trend visual</p></div><span className="subtle-chip">Last 12 periods</span></div><div className="bar-chart">{bars.map((v,i)=><div className="bar-column" key={i}><div className="bar-value" style={{height:`${v}%`}}/><span>{['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'][i]}</span></div>)}</div><p className="chart-disclaimer">Chart is placeholder data until reporting APIs are connected.</p></section><section className="panel"><div className="panel-heading"><div><h3>Booking status mix</h3><p>Current demo records</p></div></div><div className="status-breakdown">{['Pending assignment','Confirmed','Driver en route','In transit','Completed','Cancelled'].map(s=><div key={s}><span><i className={`status-dot ${statusClass[s]||'pending'}`}/>{s}</span><b>{bookings.filter(b=>b.status===s).length}</b></div>)}</div></section></div></>
}

function SettingsPage({ onReset }) {
  return <><PageHeading eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Prototype configuration and demo environment controls."/><div className="settings-grid"><section className="panel settings-panel"><div className="settings-icon lavender"><Settings size={20}/></div><h3>Service preferences</h3><p>These are display-only settings in this prototype. Backend configuration will be added as the project develops.</p><div className="setting-row"><div><b>Service model</b><span>Own operations + registered partners</span></div><span className="subtle-chip">Selected</span></div><div className="setting-row"><div><b>Service category</b><span>Routine hospital pickup/drop-off</span></div><span className="subtle-chip">MVP</span></div><div className="setting-row"><div><b>Currency</b><span>Indian Rupee (INR)</span></div><span className="subtle-chip">INR ₹</span></div><div className="setting-row"><div><b>Database</b><span>In-memory demo data · MySQL not connected</span></div><span className="status pending"><i/> Demo</span></div></section><section className="panel settings-panel"><div className="settings-icon peach"><RefreshCw size={20}/></div><h3>Demo data</h3><p>Restore the sample bookings, drivers, vehicles and partner records if you want to start the walkthrough again.</p><div className="setting-row"><div><b>Reset prototype data</b><span>All changes in the mock API will be replaced by sample data.</span></div><Button kind="secondary" onClick={onReset}>Reset demo data</Button></div><div className="notice-box"><AlertCircle size={17}/><span>Do not enter real patient information. The prototype has no production authentication or privacy controls.</span></div></section><section className="panel settings-panel full-span"><div className="settings-icon blue"><Command size={20}/></div><h3>Developer setup</h3><p>Run the frontend and backend in two terminals. API requests are proxied through Vite to port 5000.</p><div className="code-line"><code>cd backend && npm install && npm run dev</code><button onClick={()=>navigator.clipboard?.writeText('cd backend && npm install && npm run dev')}><ExternalLink size={14}/> Copy</button></div><div className="code-line"><code>cd frontend && npm install && npm run dev</code><button onClick={()=>navigator.clipboard?.writeText('cd frontend && npm install && npm run dev')}><ExternalLink size={14}/> Copy</button></div></section></div></>
}

function BookingModal({ form, setForm, onClose, onSubmit }) {
  const update = (key,value)=>setForm(prev=>({...prev,[key]:value}))
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal booking-modal"><div className="modal-head"><div><div className="eyebrow">NEW TRIP REQUEST</div><h2>Create a booking</h2><p>Enter the journey details to schedule patient transport.</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div><form onSubmit={onSubmit}><div className="form-section-title"><span>01</span> Patient information</div><div className="form-grid"><label>Patient full name *<input required value={form.patientName} onChange={e=>update('patientName',e.target.value)} placeholder="e.g. Asha Patel"/></label><label>Contact number *<input required pattern="[0-9+ ()-]{8,18}" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91 98765 43210"/></label></div><div className="form-section-title"><span>02</span> Journey details</div><div className="form-grid"><label className="full-field">Pickup address *<input required value={form.pickup} onChange={e=>update('pickup',e.target.value)} placeholder="House, street, area or landmark"/></label><label className="full-field">Hospital / destination *<input required value={form.destination} onChange={e=>update('destination',e.target.value)} placeholder="Hospital name and address"/></label><label>Pickup date & time *<input type="datetime-local" required value={form.date} min={new Date().toISOString().slice(0,16)} onChange={e=>update('date',e.target.value)}/></label><label>Trip type<select value={form.tripType} onChange={e=>update('tripType',e.target.value)}><option>One way</option><option>Round trip</option></select></label><label>Mobility requirement<select value={form.mobility} onChange={e=>update('mobility',e.target.value)}><option>Walking assistance</option><option>Wheelchair</option><option>Stretcher</option><option>No assistance</option></select></label><label>Vehicle type<select value={form.vehicleType} onChange={e=>update('vehicleType',e.target.value)}><option>Patient transport</option><option>Wheelchair accessible</option><option>Stretcher accessible</option><option>Accessible van</option></select></label><label>Passengers<input type="number" min="1" max="8" required value={form.passengers} onChange={e=>update('passengers',e.target.value)}/></label><label className="full-field">Driver / operations notes<textarea rows="2" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Pickup instructions (avoid sensitive medical details)"/></label></div><div className="estimate-row"><div><span>Estimated demo fare</span><b>₹850 – ₹1,200</b><small>Illustrative only; fare rules are not configured.</small></div><span className="estimate-icon"><Route size={20}/></span></div><div className="modal-actions"><Button kind="secondary" onClick={onClose} type="button">Cancel</Button><Button type="submit" icon={Check}>Create booking</Button></div></form></div></div>
}

function BookingDetails({ booking:b, onClose, onStatus }) {
  const statuses=['Pending assignment','Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit','Completed','Cancelled','No show']
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><aside className="detail-drawer"><div className="drawer-head"><div><div className="eyebrow">BOOKING DETAILS</div><h2>{b.reference}</h2><p>Created {fmtDate(b.createdAt)}</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="drawer-body"><div className="detail-status"><Status status={b.status}/><span>{b.tripType}</span><span className="subtle-chip">{b.vehicleType}</span></div><div className="detail-section"><h4>PATIENT</h4><div className="person-cell large-person"><Avatar name={b.patientName}/><div><b>{b.patientName}</b><span>{b.phone}</span></div></div></div><div className="detail-section"><h4>JOURNEY</h4><div className="detail-route"><div className="route-point"><i className="route-start"/><div><small>PICKUP</small><b>{b.pickup}</b><span>{fmtDate(b.scheduledAt)}</span></div></div><div className="route-connector"/><div className="route-point"><i className="route-end"/><div><small>DESTINATION</small><b>{b.destination}</b></div></div></div></div><div className="detail-section"><h4>ASSIGNMENT</h4><div className="assignment-box"><Avatar name={b.driverName || 'Unassigned'} color="mint"/><div><b>{b.driverName || 'No driver assigned'}</b><span>{b.vehicleNumber || 'Awaiting dispatch'}</span></div></div></div><div className="detail-section fare-detail"><span>Estimated fare</span><b>{fmtMoney(b.fare)}</b></div><div className="detail-section"><h4>UPDATE STATUS</h4><p className="muted small-copy">Demo action. Real status rules will be enforced in the production API.</p><div className="status-actions">{statuses.filter(s=>s!==b.status).map(s=><button key={s} onClick={()=>onStatus(s)}>{s}<ArrowRight size={13}/></button>)}</div></div></div><div className="drawer-footer"><Button kind="secondary" onClick={onClose}>Close</Button><Button onClick={()=>{onClose()}} icon={Navigation}>View tracking</Button></div></aside></div>
}

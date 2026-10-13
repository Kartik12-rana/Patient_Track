const express = require('express')
const { store, resetStore } = require('./data/store')
const router = express.Router()

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data })
const findBooking = id => store.bookings.find(b => String(b.id) === String(id) || b.reference === String(id))

router.get('/health', (req, res) => ok(res, { status: 'ok', mode: 'in-memory-demo', database: 'not-connected' }))
router.get('/dashboard', (req, res) => {
  const bookings = store.bookings
  const activeStatuses = ['Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit']
  ok(res, {
    totalBookings: bookings.length,
    activeTrips: bookings.filter(b => activeStatuses.includes(b.status)).length,
    completedTrips: bookings.filter(b => b.status === 'Completed').length,
    availableVehicles: store.vehicles.filter(v => v.readiness === 'Available').length,
    busyVehicles: store.vehicles.filter(v => v.readiness === 'On trip').length,
    offlineVehicles: store.vehicles.filter(v => v.readiness === 'Offline').length,
    totalVehicles: store.vehicles.length
  })
})
router.get('/bookings', (req, res) => ok(res, store.bookings.slice().sort((a,b) => new Date(a.scheduledAt)-new Date(b.scheduledAt))))
router.post('/bookings', (req, res) => {
  const { patientName, phone, pickup, destination, date, tripType, mobility, vehicleType, passengers, notes } = req.body || {}
  if (!patientName || !phone || !pickup || !destination || !date) return res.status(400).json({ success:false, message:'Patient, phone, pickup, destination and pickup time are required.' })
  const id = store.nextBookingId++
  const booking = {
    id, reference: `BK-${1050 + id - 1}`, patientName: String(patientName).trim(), phone: String(phone).trim(),
    pickup: String(pickup).trim(), destination: String(destination).trim(), scheduledAt: new Date(date).toISOString(),
    tripType: tripType || 'One way', mobility: mobility || 'Walking assistance', vehicleType: vehicleType || 'Patient transport',
    passengers: Number(passengers || 1), notes: String(notes || '').trim(), status: 'Pending assignment',
    driverName: null, driverPhone: null, vehicleNumber: null, fare: 950, createdAt: new Date().toISOString()
  }
  store.bookings.unshift(booking)
  ok(res, booking, 201)
})
router.get('/bookings/:id', (req,res) => {
  const booking = findBooking(req.params.id)
  if (!booking) return res.status(404).json({ success:false, message:'Booking not found.' })
  ok(res, booking)
})
router.patch('/bookings/:id/status', (req,res) => {
  const booking = findBooking(req.params.id)
  if (!booking) return res.status(404).json({ success:false, message:'Booking not found.' })
  const allowed = ['Pending assignment','Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit','Completed','Cancelled','No show']
  if (!allowed.includes(req.body.status)) return res.status(400).json({ success:false, message:'Unsupported status.' })
  booking.status = req.body.status
  if (['Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit'].includes(booking.status) && !booking.driverName) {
    const driver = store.drivers.find(d=>d.availability==='Available')
    const vehicle = store.vehicles.find(v=>v.readiness==='Available')
    if (driver) { booking.driverName=driver.name; booking.driverPhone=driver.phone; driver.availability='On trip' }
    if (vehicle) { booking.vehicleNumber=vehicle.registration; vehicle.readiness='On trip' }
  }
  if (booking.status === 'Completed' || booking.status === 'Cancelled' || booking.status === 'No show') {
    const driver = store.drivers.find(d=>d.name===booking.driverName)
    const vehicle = store.vehicles.find(v=>v.registration===booking.vehicleNumber)
    if (driver) driver.availability='Available'
    if (vehicle) vehicle.readiness='Available'
  }
  ok(res, booking)
})
router.get('/drivers', (req,res) => ok(res, store.drivers))
router.get('/vehicles', (req,res) => ok(res, store.vehicles))
router.get('/partners', (req,res) => ok(res, store.partners))
router.get('/tracking/:id', (req,res) => {
  const booking = findBooking(req.params.id)
  if (!booking) return res.status(404).json({success:false,message:'Trip not found.'})
  const active = ['Confirmed','Driver en route','Arrived at pickup','Patient picked up','In transit'].includes(booking.status)
  const phase = Math.floor(Date.now()/4000) % 60
  ok(res, {
    booking, active, latitude: 22.839 + Math.sin(phase/8)*0.008, longitude: 69.721 + Math.cos(phase/8)*0.008,
    eta: `${12 + (phase % 9)} min`, distance: `${(3.5 + (phase%6)*0.4).toFixed(1)} km`,
    updatedAt: new Date().toISOString(), simulated: true
  })
})
router.post('/demo/reset', (req,res) => { resetStore(); ok(res,{message:'Demo data reset'}) })

module.exports = { router }

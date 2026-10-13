const seed = () => ({
  nextBookingId: 6,
  bookings: [
    {id:1,reference:'BK-1048',patientName:'Asha Patel',phone:'+91 98765 43210',pickup:'Sector 4, Gandhinagar',destination:'Civil Hospital, Gandhinagar',scheduledAt:'2026-10-13T07:00:00.000Z',tripType:'One way',mobility:'Wheelchair',vehicleType:'Wheelchair accessible',passengers:1,status:'Driver en route',driverName:'Rahul Sharma',driverPhone:'+91 98250 12345',vehicleNumber:'GJ-18-AB-2481',fare:850,createdAt:'2026-10-12T09:30:00.000Z'},
    {id:2,reference:'BK-1049',patientName:'Mahesh Shah',phone:'+91 98765 12340',pickup:'Adalaj, Gandhinagar',destination:'Apollo Hospital, Ahmedabad',scheduledAt:'2026-10-13T08:30:00.000Z',tripType:'One way',mobility:'Walking assistance',vehicleType:'Patient transport',passengers:1,status:'Confirmed',driverName:'Vikram Solanki',driverPhone:'+91 98790 11223',vehicleNumber:'GJ-01-CD-9034',fare:1250,createdAt:'2026-10-12T10:20:00.000Z'},
    {id:3,reference:'BK-1047',patientName:'Nita Desai',phone:'+91 98980 12345',pickup:'Kudasan, Gandhinagar',destination:'Sterling Hospital, Ahmedabad',scheduledAt:'2026-10-13T10:00:00.000Z',tripType:'Round trip',mobility:'No assistance',vehicleType:'Patient transport',passengers:2,status:'Pending assignment',driverName:null,driverPhone:null,vehicleNumber:null,fare:1600,createdAt:'2026-10-12T11:10:00.000Z'},
    {id:4,reference:'BK-1046',patientName:'Harish Mehta',phone:'+91 98981 45678',pickup:'Infocity, Gandhinagar',destination:'Zydus Hospital, Ahmedabad',scheduledAt:'2026-10-13T11:30:00.000Z',tripType:'One way',mobility:'Stretcher',vehicleType:'Stretcher accessible',passengers:1,status:'In transit',driverName:'Imran Khan',driverPhone:'+91 97270 45678',vehicleNumber:'GJ-18-EF-5520',fare:1800,createdAt:'2026-10-12T12:00:00.000Z'},
    {id:5,reference:'BK-1045',patientName:'Kiran Joshi',phone:'+91 98250 90876',pickup:'Raysan, Gandhinagar',destination:'Civil Hospital, Gandhinagar',scheduledAt:'2026-10-13T12:00:00.000Z',tripType:'One way',mobility:'Walking assistance',vehicleType:'Patient transport',passengers:1,status:'Completed',driverName:'Rahul Sharma',driverPhone:'+91 98250 12345',vehicleNumber:'GJ-18-AB-2481',fare:750,createdAt:'2026-10-11T14:30:00.000Z'},
  ],
  drivers: [
    {id:1,name:'Rahul Sharma',phone:'+91 98250 12345',licenseLabel:'DL •••• 2814',partnerName:'CareWay Mobility',availability:'On trip',verification:'Verified'},
    {id:2,name:'Vikram Solanki',phone:'+91 98790 11223',licenseLabel:'DL •••• 6429',partnerName:'CareWay Mobility',availability:'On trip',verification:'Verified'},
    {id:3,name:'Imran Khan',phone:'+91 97270 45678',licenseLabel:'DL •••• 1938',partnerName:'MediMove Transport',availability:'On trip',verification:'Verified'},
    {id:4,name:'Priya Patel',phone:'+91 99090 33221',licenseLabel:'DL •••• 5731',partnerName:'MediMove Transport',availability:'Available',verification:'Verified'},
    {id:5,name:'Rakesh Parmar',phone:'+91 97244 99881',licenseLabel:'DL •••• 1056',partnerName:'Sanjeevani Rides',availability:'Available',verification:'Pending review'},
  ],
  vehicles: [
    {id:1,registration:'GJ-18-AB-2481',type:'Wheelchair accessible',partnerName:'CareWay Mobility',capacity:3,readiness:'On trip',verification:'Verified'},
    {id:2,registration:'GJ-01-CD-9034',type:'Patient transport',partnerName:'CareWay Mobility',capacity:4,readiness:'On trip',verification:'Verified'},
    {id:3,registration:'GJ-18-EF-5520',type:'Stretcher accessible',partnerName:'MediMove Transport',capacity:2,readiness:'On trip',verification:'Verified'},
    {id:4,registration:'GJ-18-GH-8820',type:'Wheelchair accessible',partnerName:'MediMove Transport',capacity:3,readiness:'Available',verification:'Verified'},
    {id:5,registration:'GJ-01-JK-4419',type:'Patient transport',partnerName:'Sanjeevani Rides',capacity:4,readiness:'Offline',verification:'Verified'},
  ],
  partners: [
    {id:1,name:'CareWay Mobility',city:'Gandhinagar, Gujarat',contactName:'Nilesh Patel',phone:'+91 98250 33311',vehicleCount:8,status:'Active',verification:'Verified'},
    {id:2,name:'MediMove Transport',city:'Ahmedabad, Gujarat',contactName:'Jignesh Shah',phone:'+91 98790 11200',vehicleCount:5,status:'Active',verification:'Verified'},
    {id:3,name:'Sanjeevani Rides',city:'Gandhinagar, Gujarat',contactName:'Mehul Parmar',phone:'+91 99090 12009',vehicleCount:3,status:'Pending review',verification:'Pending review'},
  ]
})
let store = seed()
function resetStore() { const fresh = seed(); Object.keys(store).forEach(key => delete store[key]); Object.assign(store, fresh) }
module.exports = { get store(){ return store }, resetStore }

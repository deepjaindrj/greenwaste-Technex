// ============= MOCK DATA FOR WASTEOS =============

export const kpiCards = [
  { id: 'waste-detected', label: 'Waste Detected Today', value: '2,847 kg', trend: -8.2, trendLabel: 'vs yesterday', icon: 'Trash2', progress: 72 },
  { id: 'segregation', label: 'Segregation Score', value: '78.4%', trend: 3.1, trendLabel: 'vs last week', icon: 'CheckCircle', progress: 78 },
  { id: 'co2-saved', label: 'CO₂ Saved Today', value: '1,245 kg', trend: 12.4, trendLabel: 'vs yesterday', icon: 'Leaf', progress: 65 },
  { id: 'green-points', label: 'Active Green Points', value: '8,420 pts', trend: 240, trendLabel: 'earned today', icon: 'Zap', progress: 84 },
  { id: 'recycling', label: 'Recycling Rate', value: '61.7%', trend: 5.3, trendLabel: 'vs last month', icon: 'RefreshCw', progress: 62 },
];

export const wasteTimelineData = [
  { day: 'Mon', recyclable: 420, biodegradable: 310, hazardous: 45, mixed: 180, predicted: 400 },
  { day: 'Tue', recyclable: 380, biodegradable: 290, hazardous: 52, mixed: 160, predicted: 390 },
  { day: 'Wed', recyclable: 450, biodegradable: 340, hazardous: 38, mixed: 200, predicted: 430 },
  { day: 'Thu', recyclable: 410, biodegradable: 320, hazardous: 48, mixed: 175, predicted: 420 },
  { day: 'Fri', recyclable: 490, biodegradable: 360, hazardous: 55, mixed: 210, predicted: 470 },
  { day: 'Sat', recyclable: 520, biodegradable: 380, hazardous: 42, mixed: 230, predicted: 510 },
  { day: 'Sun', recyclable: 440, biodegradable: 330, hazardous: 35, mixed: 190, predicted: 450 },
];

export const wasteComposition = [
  { name: 'Recyclable', value: 42, color: 'hsl(142, 72%, 37%)' },
  { name: 'Biodegradable', value: 31, color: 'hsl(160, 84%, 39%)' },
  { name: 'Hazardous', value: 8, color: 'hsl(0, 84%, 60%)' },
  { name: 'Mixed', value: 19, color: 'hsl(38, 92%, 50%)' },
];

export const aiInsights = [
  { id: 1, title: 'Zone 4-B Overflow Risk', priority: 'high', description: 'Predicted overflow by Saturday. Recommend 2 additional pickups for the Vijay Nagar area.', savings: '₹12,000/month', co2: '−180 kg CO₂' },
  { id: 2, title: 'Plastic Recycling Opportunity', priority: 'medium', description: 'PET bottle collection up 23% this week. Partner with local recycler for bulk processing.', savings: '₹8,500/month', co2: '−95 kg CO₂' },
  { id: 3, title: 'Composting Potential Detected', priority: 'low', description: 'Ward 7 has 40% biodegradable waste suitable for community composting program.', savings: '₹5,200/month', co2: '−210 kg CO₂' },
];

export const quickActions = [
  { label: 'Scan Waste', icon: 'Camera', color: 'primary', route: '/scan' },
  { label: 'View Reports', icon: 'FileText', color: 'muted', route: '/reports' },
  { label: 'Check Rewards', icon: 'Star', color: 'warning', route: '/rewards' },
  { label: 'City Map', icon: 'MapPin', color: 'info', route: '/municipal' },
];

export const scanResults = {
  items: [
    { name: 'PET Bottle', category: 'Recyclable', confidence: 94, co2Impact: '+0.3 kg', disposal: 'Blue bin — Recycle', bbox: { x: 15, y: 20, w: 30, h: 40 }, color: '#16A34A' },
    { name: 'Food Waste', category: 'Biodegradable', confidence: 87, co2Impact: '+0.1 kg', disposal: 'Green bin — Compost', bbox: { x: 50, y: 35, w: 25, h: 35 }, color: '#F59E0B' },
    { name: 'Battery', category: 'Hazardous', confidence: 91, co2Impact: '+2.1 kg', disposal: 'Red bin — Special disposal', bbox: { x: 70, y: 60, w: 20, h: 25 }, color: '#EF4444' },
  ],
  segregationScore: 68,
  totalCO2: { landfill: 1.2, recycled: -0.8 },
  recommendation: 'Separate & Recycle',
};

export const carbonData = {
  totalSaved: '2.4 tonnes',
  treesSaved: 47,
  landfillAvoided: '320 kg',
  energySaved: '840 kWh',
  debtPaidOff: 34,
  timeline: [
    { month: 'Sep', saved: 180, emitted: 420 },
    { month: 'Oct', saved: 220, emitted: 390 },
    { month: 'Nov', saved: 280, emitted: 350 },
    { month: 'Dec', saved: 310, emitted: 330 },
    { month: 'Jan', saved: 380, emitted: 290 },
    { month: 'Feb', saved: 420, emitted: 260 },
    { month: 'Mar', saved: 460, emitted: 240 },
  ],
};

export const rewardsData = {
  user: { name: 'Arjun Mehta', tier: 'Green Champion 🌿', lifetime: 12450, monthly: 840, tierProgress: 72 },
  challenges: [
    { title: 'Recycle 10 items this week', progress: 7, total: 10, points: 240, daysLeft: 2, icon: 'Recycle' },
    { title: 'Zero Mixed Waste for 5 days', progress: 3, total: 5, points: 500, daysLeft: 4, icon: 'Flame' },
    { title: 'Scan 3 new waste types', progress: 1, total: 3, points: 150, daysLeft: 5, icon: 'ScanLine' },
  ],
  marketplace: [
    { brand: 'EcoStore', offer: '20% off at EcoStore', points: 500 },
    { brand: 'GreenBag', offer: 'Free organic bag', points: 800 },
    { brand: 'TreePlant', offer: 'Tree planted in your name', points: 200 },
    { brand: 'Swiggy', offer: '₹100 Swiggy credit', points: 1200 },
    { brand: 'Urban Company', offer: 'Free home cleaning', points: 1500 },
    { brand: 'BigBasket', offer: '₹200 off groceries', points: 900 },
  ],
};

export const municipalData = {
  kpis: [
    { label: 'Total City Waste Today', value: '2,847 t', trend: -4.1, icon: 'Trash2' },
    { label: 'Segregation Compliance', value: '61.3%', trend: 2.8, icon: 'CheckCircle' },
    { label: 'Trucks Active', value: '247/312', trend: 0, icon: 'Truck' },
    { label: 'Carbon Emissions', value: '18.4t CO₂', trend: -6.2, icon: 'Cloud' },
    { label: 'Recycling Rate', value: '38.7%', trend: 1.5, icon: 'RefreshCw' },
  ],
  alerts: [
    { type: 'overflow', title: 'Overflow Alert — Zone 4B', location: 'Vijay Nagar', time: '5 min ago' },
    { type: 'segregation', title: 'Low Segregation — Ward 12', location: 'Rajwada', time: '12 min ago' },
    { type: 'delay', title: 'Route Delay — Truck MP-247', location: 'Palasia', time: '18 min ago' },
    { type: 'milestone', title: 'Milestone — Ward 3 hit 80%', location: 'Sapna Sangeeta', time: '1 hr ago' },
    { type: 'overflow', title: 'Overflow Risk — Zone 7A', location: 'Scheme 78', time: '2 hr ago' },
  ],
  trucks: [
    { id: 'MP-201', zone: 'Zone 1', status: 'Active', collected: '4.2t' },
    { id: 'MP-215', zone: 'Zone 3', status: 'Active', collected: '3.8t' },
    { id: 'MP-247', zone: 'Zone 4', status: 'Delayed', collected: '2.1t' },
    { id: 'MP-289', zone: 'Zone 6', status: 'Idle', collected: '0t' },
    { id: 'MP-302', zone: 'Zone 7', status: 'Active', collected: '5.1t' },
  ],
  forecast: [
    { zone: 'Zone 1', mon: 45, tue: 48, wed: 52, thu: 50, fri: 58, sat: 62, sun: 40 },
    { zone: 'Zone 2', mon: 38, tue: 40, wed: 42, thu: 39, fri: 45, sat: 50, sun: 35 },
    { zone: 'Zone 3', mon: 55, tue: 58, wed: 60, thu: 62, fri: 70, sat: 75, sun: 48 },
    { zone: 'Zone 4', mon: 42, tue: 44, wed: 48, thu: 52, fri: 65, sat: 78, sun: 38 },
  ],
};

export const predictData = {
  heatmapCalendar: Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 100),
  })),
  zoneForecast: [
    { zone: 'Zone 1', predicted: 520, confidence: 88 },
    { zone: 'Zone 2', predicted: 380, confidence: 92 },
    { zone: 'Zone 3', predicted: 710, confidence: 85 },
    { zone: 'Zone 4', predicted: 640, confidence: 79 },
    { zone: 'Zone 5', predicted: 450, confidence: 91 },
    { zone: 'Zone 6', predicted: 390, confidence: 87 },
    { zone: 'Zone 7', predicted: 580, confidence: 82 },
  ],
  predictions: [
    { text: 'Zone 7 will generate 22% more plastic this weekend', confidence: 87, impact: 'high', action: 'Schedule extra pickup' },
    { text: 'Composting capacity in Ward 3 will be exceeded by Tuesday', confidence: 79, impact: 'medium', action: 'Redirect to Ward 5 facility' },
    { text: 'Diwali week expected 3x surge in mixed waste', confidence: 94, impact: 'high', action: 'Pre-deploy 40 extra trucks' },
    { text: 'Paper waste declining trend — down 12% over 30 days', confidence: 82, impact: 'low', action: 'Adjust recycling center hours' },
  ],
};

export const leaderboardData = [
  { rank: 1, name: 'Priya Sharma', society: 'Green Valley Apts', city: 'Indore', points: 24800, trend: [40, 45, 50, 55, 60, 65, 72], badge: '🥇' },
  { rank: 2, name: 'Rahul Desai', society: 'EcoNest Society', city: 'Bhopal', points: 22150, trend: [35, 38, 42, 50, 55, 58, 64], badge: '🥈' },
  { rank: 3, name: 'Sneha Kulkarni', society: 'SunRise Tower', city: 'Indore', points: 19400, trend: [30, 35, 40, 42, 48, 52, 58], badge: '🥉' },
  { rank: 4, name: 'Vikram Joshi', society: 'Park View', city: 'Ujjain', points: 17650, trend: [28, 32, 38, 40, 44, 48, 53], badge: '' },
  { rank: 5, name: 'Arjun Mehta', society: 'Harmony Heights', city: 'Indore', points: 12450, trend: [20, 25, 30, 35, 38, 42, 48], badge: '', isUser: true },
  { rank: 6, name: 'Meera Iyer', society: 'Lake Side Homes', city: 'Jabalpur', points: 11200, trend: [18, 22, 28, 32, 36, 38, 44], badge: '' },
  { rank: 7, name: 'Amit Patel', society: 'Royal Gardens', city: 'Gwalior', points: 10800, trend: [15, 20, 24, 28, 32, 36, 40], badge: '' },
  { rank: 8, name: 'Kavita Nair', society: 'Ocean Breeze', city: 'Indore', points: 9500, trend: [12, 18, 22, 26, 30, 34, 38], badge: '' },
];

export const reportTemplates = [
  { id: 'citizen', title: 'Citizen Monthly Summary', description: 'Personal waste footprint and eco-impact report', icon: 'User' },
  { id: 'municipal', title: 'Municipal City Report', description: 'City-wide waste analytics and compliance', icon: 'Building' },
  { id: 'esg', title: 'Business ESG Report', description: 'Environmental, Social, Governance metrics', icon: 'Briefcase' },
  { id: 'carbon', title: 'Carbon Credit Statement', description: 'Verified carbon credit earnings', icon: 'Leaf' },
  { id: 'audit', title: 'Waste Audit Report', description: 'Detailed waste composition analysis', icon: 'ClipboardCheck' },
  { id: 'predict', title: 'Predictive Analytics Report', description: 'AI forecasts and trend analysis', icon: 'TrendingUp' },
];

export const recentReports = [
  { name: 'February 2026 Summary', type: 'Citizen', date: 'Feb 28, 2026', status: 'Generated' },
  { name: 'Indore Q1 Report', type: 'Municipal', date: 'Feb 25, 2026', status: 'Generated' },
  { name: 'ESG Annual 2025', type: 'Business', date: 'Feb 20, 2026', status: 'Processing' },
  { name: 'Carbon Credits Feb', type: 'Carbon', date: 'Feb 15, 2026', status: 'Generated' },
  { name: 'Predictive Mar 2026', type: 'Predictive', date: 'Feb 28, 2026', status: 'Scheduled' },
];

export const businessData = {
  score: 72,
  subScores: [
    { label: 'Waste Generation', value: 68, color: 'warning' },
    { label: 'Segregation', value: 82, color: 'success' },
    { label: 'Recycling Rate', value: 61, color: 'warning' },
    { label: 'Carbon Impact', value: 77, color: 'success' },
  ],
  suggestions: [
    { icon: 'Recycle', text: 'Install separate recycling bins on each floor', co2: '−120 kg/month', savings: '₹8,000', priority: 'high' },
    { icon: 'Leaf', text: 'Start organic waste composting program', co2: '−200 kg/month', savings: '₹12,000', priority: 'high' },
    { icon: 'Droplets', text: 'Replace single-use cups with reusables', co2: '−45 kg/month', savings: '₹3,500', priority: 'medium' },
    { icon: 'Lightbulb', text: 'Partner with e-waste recycler for electronics', co2: '−80 kg/month', savings: '₹5,000', priority: 'medium' },
    { icon: 'Package', text: 'Negotiate bulk packaging reduction with suppliers', co2: '−60 kg/month', savings: '₹4,200', priority: 'low' },
  ],
};

// ============= TWO-PORTAL REDESIGN DATA =============

export const pickupRequests = [
  { id: 'PKP-2026-0301-001', status: 'En Route', date: 'Mar 1, 2026', timeWindow: 'Morning 7–9am', wasteType: 'Mixed', collector: 'Rajesh Kumar', truckId: 'MP-215', eta: '12 min', phone: '+91 98765 43210' },
  { id: 'PKP-2026-0228-014', status: 'Complete', date: 'Feb 28, 2026', timeWindow: 'Afternoon 2–4pm', wasteType: 'Dry', collector: 'Amit Singh', truckId: 'MP-201', eta: '', phone: '+91 98765 43211' },
  { id: 'PKP-2026-0227-008', status: 'Complete', date: 'Feb 27, 2026', timeWindow: 'Morning 7–9am', wasteType: 'Wet', collector: 'Suresh Patil', truckId: 'MP-302', eta: '', phone: '+91 98765 43212' },
  { id: 'PKP-2026-0226-003', status: 'Requested', date: 'Feb 26, 2026', timeWindow: 'Morning 7–9am', wasteType: 'Mixed', collector: '', truckId: '', eta: '', phone: '' },
];

export const collectionHistory = [
  { id: 'PKP-2026-0301-001', date: 'Mar 1, 2026', wetKg: 4.2, dryKg: 6.8, hazardousKg: 0.3, totalKg: 11.3, segregationScore: 82, creditsEarned: 52, co2Saved: 3.4 },
  { id: 'PKP-2026-0228-014', date: 'Feb 28, 2026', wetKg: 3.1, dryKg: 5.4, hazardousKg: 0.0, totalKg: 8.5, segregationScore: 91, creditsEarned: 44, co2Saved: 2.8 },
  { id: 'PKP-2026-0227-008', date: 'Feb 27, 2026', wetKg: 5.6, dryKg: 4.2, hazardousKg: 0.7, totalKg: 10.5, segregationScore: 74, creditsEarned: 38, co2Saved: 3.1 },
  { id: 'PKP-2026-0226-003', date: 'Feb 26, 2026', wetKg: 2.8, dryKg: 7.1, hazardousKg: 0.2, totalKg: 10.1, segregationScore: 88, creditsEarned: 48, co2Saved: 3.0 },
  { id: 'PKP-2026-0225-011', date: 'Feb 25, 2026', wetKg: 4.0, dryKg: 6.0, hazardousKg: 0.5, totalKg: 10.5, segregationScore: 80, creditsEarned: 42, co2Saved: 2.9 },
];

export const carbonWalletData = {
  totalCredits: 1284,
  thisMonth: 282,
  lastMonth: 211,
  walletBalance: 2450,
  treesSaved: 47,
  energySaved: '840 kWh',
  co2Saved: '2.4 tonnes',
  monthlyChart: [
    { month: 'Sep', credits: 120 },
    { month: 'Oct', credits: 145 },
    { month: 'Nov', credits: 168 },
    { month: 'Dec', credits: 190 },
    { month: 'Jan', credits: 220 },
    { month: 'Feb', credits: 211 },
    { month: 'Mar', credits: 282 },
  ],
};

export const carbonMarketplaceData = {
  brands: [
    { name: 'Swiggy', category: 'Food Delivery', creditsRequired: 200, cashValue: 500, voucherLabel: '₹500 Swiggy Voucher' },
    { name: 'BigBasket', category: 'Groceries', creditsRequired: 150, cashValue: 400, voucherLabel: '₹400 off Groceries' },
    { name: 'Urban Company', category: 'Home Services', creditsRequired: 300, cashValue: 750, voucherLabel: 'Free Deep Clean' },
    { name: 'Zepto', category: 'Quick Commerce', creditsRequired: 100, cashValue: 250, voucherLabel: '₹250 Zepto Cash' },
    { name: 'Myntra', category: 'Fashion', creditsRequired: 250, cashValue: 600, voucherLabel: '₹600 off Fashion' },
    { name: 'BookMyShow', category: 'Entertainment', creditsRequired: 180, cashValue: 450, voucherLabel: '2 Free Movie Tickets' },
  ],
  activeVouchers: [
    { brand: 'Swiggy', label: '₹500 Swiggy Voucher', expiry: 'Mar 15, 2026', code: 'ECO-SWG-4821' },
    { brand: 'Zepto', label: '₹250 Zepto Cash', expiry: 'Mar 20, 2026', code: 'ECO-ZPT-7734' },
  ],
};

export const municipalPickupQueue = [
  { id: 'REQ-001', citizenName: 'Priya Sharma', address: 'Green Valley Apts, Vijay Nagar', wasteType: 'Mixed', time: '8:15 AM', minutesAgo: 5, assignedTruck: '' },
  { id: 'REQ-002', citizenName: 'Rahul Desai', address: 'EcoNest Society, Palasia', wasteType: 'Dry', time: '8:22 AM', minutesAgo: 12, assignedTruck: '' },
  { id: 'REQ-003', citizenName: 'Sneha Kulkarni', address: 'SunRise Tower, Scheme 78', wasteType: 'Wet', time: '8:30 AM', minutesAgo: 18, assignedTruck: 'MP-201' },
  { id: 'REQ-004', citizenName: 'Vikram Joshi', address: 'Park View, AB Road', wasteType: 'Hazardous', time: '8:45 AM', minutesAgo: 25, assignedTruck: '' },
  { id: 'REQ-005', citizenName: 'Meera Iyer', address: 'Lake Side Homes, MG Road', wasteType: 'Mixed', time: '9:00 AM', minutesAgo: 32, assignedTruck: 'MP-302' },
];

export const esgMarketData = {
  cityCreditsAvailable: 48200,
  revenueStats: {
    creditsSold: 12400,
    totalRevenue: 32240,
    citizensPaid: 1840,
    avgPerCitizen: 17.5,
  },
  corporateBuyers: [
    { id: 1, company: 'Tata Sustainability', creditsWanted: 5000, pricePerCredit: 2.80, totalValue: 14000, status: 'Pending' },
    { id: 2, company: 'Reliance Green', creditsWanted: 3000, pricePerCredit: 2.50, totalValue: 7500, status: 'Approved' },
    { id: 3, company: 'Infosys ESG Fund', creditsWanted: 8000, pricePerCredit: 3.10, totalValue: 24800, status: 'Pending' },
    { id: 4, company: 'Mahindra EcoLogic', creditsWanted: 2000, pricePerCredit: 2.60, totalValue: 5200, status: 'Pending' },
    { id: 5, company: 'Wipro Earthian', creditsWanted: 4500, pricePerCredit: 2.90, totalValue: 13050, status: 'Approved' },
  ],
  recentTransactions: [
    { company: 'Reliance Green', credits: 3000, value: 7500, date: 'Feb 28, 2026' },
    { company: 'Wipro Earthian', credits: 4500, value: 13050, date: 'Feb 25, 2026' },
    { company: 'Adani Green', credits: 2000, value: 5400, date: 'Feb 20, 2026' },
    { company: 'HDFC ESG', credits: 1500, value: 4200, date: 'Feb 15, 2026' },
  ],
};

// Central mock dataset — swap for real API calls when the backend is wired up.

export const admin = {
  name: 'Super Admin User',
  email: 'admin@vyloo.com',
  role: 'ROOT',
  avatar: 'https://i.pravatar.cc/100?img=12',
};

export const overview = {
  totalUsers: 14820,
  totalUsersDelta: '+12.4% this wk',
  activeWallets: 9405,
  activeWalletsNote: '86% activity',
  transactionsTotal: '412.8K',
  transactionsNote: '8.2K / day',
  platformLiquidity: 2.45, // millions
  platformLiquidityNote: 'Stable reserve',
  txVolume30d: [32, 40, 36, 48, 44, 60, 52, 58, 62, 55, 66, 61],
  avgTxVolume: '$42.5K',
  collectedFees: 12450.8,
};

export const users = [
  { id: 1, name: 'Sarah Jenkins', email: 'sarah@example.com', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=5', joined: '24 May 2023', phone: '+1 (555) 942-0129', balance: 4280.5, totalSent: 12850, totalReceived: 17130 },
  { id: 2, name: 'Michael Chang', email: 'michael@example.com', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=13', joined: '02 Feb 2024', phone: '+1 (555) 213-8890', balance: 7210.0, totalSent: 8950, totalReceived: 9800 },
  { id: 3, name: 'David Vance', email: 'david@vance.io', status: 'Frozen', avatar: 'https://i.pravatar.cc/100?img=33', joined: '18 Nov 2022', phone: '+1 (555) 771-4420', balance: 500.0, totalSent: 500, totalReceived: 0 },
  { id: 4, name: 'Elena Rostova', email: 'elena@rostov.ru', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=32', joined: '09 Sep 2023', phone: '+1 (555) 664-2201', balance: 12400.0, totalSent: 12400, totalReceived: 15200 },
  { id: 5, name: 'Marcus Sterling', email: 'marcus@swift.com', status: 'Frozen', avatar: 'https://i.pravatar.cc/100?img=51', joined: '30 Jan 2024', phone: '+1 (555) 320-7765', balance: 85.0, totalSent: 85, totalReceived: 0 },
  { id: 6, name: 'Alex Carter', email: 'alex@swiftpay.com', status: 'Active', avatar: 'https://i.pravatar.cc/100?img=14', joined: '24 May 2023', phone: '+1 (555) 942-0129', balance: 4280.5, totalSent: 12850, totalReceived: 17130 },
];

export const userTransactions = {
  6: [
    { name: 'Sarah Jenkins', type: 'Transfer Out', amount: -150.0 },
    { name: 'Netflix Inc', type: 'Merchant Debit', amount: -15.49 },
    { name: 'Salary Swift Corp', type: 'Direct Deposit', amount: 3200.0 },
  ],
};

export const revenue = {
  monthRevenue: 12450,
  monthRevenueDelta: '+18.2% vs prev',
  avgFee: 0.25,
  avgFeeNote: 'Fixed rate',
  trend: [
    { month: 'May', value: 38 },
    { month: 'Jun', value: 46 },
    { month: 'Jul', value: 52 },
    { month: 'Aug', value: 58 },
    { month: 'Sep', value: 70 },
    { month: 'Oct', value: 96 },
  ],
  bySource: [
    { label: 'Transfer Fees', pct: 55, amount: 6840.5 },
    { label: 'FX Margin', pct: 30, amount: 3735.0 },
    { label: 'Withdrawal Fees', pct: 15, amount: 1874.3 },
  ],
};

export const platform = {
  volumeMonthly: 1.85, // millions
  volumeDelta: '+22.4% MoM',
  newUsersMo: 342,
  newUsersNote: '94% onboarding',
  avgTxSize: 85.5,
  avgTxSizeNote: 'Stable value',
  growthCurve: [20, 24, 22, 30, 34, 32, 40, 44, 42, 48, 55, 60],
  mostActive: [
    { rank: 1, name: 'Elena Rostova', tx: 84, volume: '$12,400' },
    { rank: 2, name: 'Sarah Jenkins', tx: 61, volume: '$8,950' },
    { rank: 3, name: 'Michael Chang', tx: 53, volume: '$7,210' },
  ],
};

export const auditLog = [
  { id: 'TX-89241', status: 'Completed', sender: 'Alex Carter', receiver: 'Sarah Jenkins', amount: 150.0, fee: 0.5, time: 'Today 14:02' },
  { id: 'TX-89242', status: 'Completed', sender: 'Swift Corp', receiver: 'Michael Chang', amount: 3200.0, fee: 0.0, time: 'Today 14:02' },
  { id: 'TX-89243', status: 'Pending', sender: 'Marcus S.', receiver: 'Elena Rostova', amount: 85.0, fee: 0.25, time: 'Today 14:02' },
  { id: 'TX-89244', status: 'Failed', sender: 'David Vance', receiver: 'System Bank', amount: 500.0, fee: 2.0, time: 'Today 14:02' },
  { id: 'TX-89245', status: 'Completed', sender: 'John Doe', receiver: 'Uber Rider', amount: 42.5, fee: 0.15, time: 'Today 14:02' },
  { id: 'TX-89246', status: 'Completed', sender: 'Elena Rostova', receiver: 'Amazon Store', amount: 12.99, fee: 0.1, time: 'Today 14:02' },
];

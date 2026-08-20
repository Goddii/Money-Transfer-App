export const admin = {
  name: 'Super Admin User',
  email: 'admin@vyloo.com',
  role: 'ROOT',
  avatar: 'https://i.pravatar.cc/100?img=12',
};

export const overview = {
  totalUsers: 0,
  totalUsersDelta: '',
  activeWallets: 0,
  activeWalletsNote: '',
  transactionsTotal: '0',
  transactionsNote: '',
  platformLiquidity: 0,
  platformLiquidityNote: '',
  txVolume30d: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  avgTxVolume: '$0.00',
  collectedFees: 0,
};

export const users = [];

export const userTransactions = {};

export const revenue = {
  monthRevenue: 0,
  monthRevenueDelta: '',
  avgFee: 0,
  avgFeeNote: '',
  trend: [
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
  ],
  bySource: [],
};

export const platform = {
  volumeMonthly: 0,
  volumeDelta: '',
  newUsersMo: 0,
  newUsersNote: '',
  avgTxSize: 0,
  avgTxSizeNote: '',
  growthCurve: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  mostActive: [],
};

export const auditLog = [];

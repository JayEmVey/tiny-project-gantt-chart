import { Month, Quarter } from '../types';

export const MONTHS: Month[] = [
  { name: 'Jan', quarter: 1, month: 1 },
  { name: 'Feb', quarter: 1, month: 2 },
  { name: 'Mar', quarter: 1, month: 3 },
  { name: 'Apr', quarter: 2, month: 4 },
  { name: 'May', quarter: 2, month: 5 },
  { name: 'Jun', quarter: 2, month: 6 },
  { name: 'Jul', quarter: 3, month: 7 },
  { name: 'Aug', quarter: 3, month: 8 },
  { name: 'Sep', quarter: 3, month: 9 },
  { name: 'Oct', quarter: 3, month: 10 },
  { name: 'Nov', quarter: 3, month: 11 },
  { name: 'Dec', quarter: 3, month: 12 }
];

export const QUARTERS: Quarter[] = [
  { name: 'QUARTER 1', months: ['Jan', 'Feb', 'Mar'] },
  { name: 'QUARTER 2', months: ['Apr', 'May', 'Jun'] },
  { name: 'QUARTER 3', months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
];
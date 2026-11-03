// India as a tile map: one square per state and union territory, placed roughly where it sits
// (row = north to south, col = west to east). A tile map rather than a drawn outline, so there
// are no borders to get wrong; it's a way to find a place, not a survey map.
export const INDIA_COLS = 8;
export const INDIA_ROWS = 7;

export const STATES = [
  { id: 'JK', name: 'Jammu & Kashmir', r: 0, c: 1, ut: true },
  { id: 'LA', name: 'Ladakh', r: 0, c: 2, ut: true },
  { id: 'PB', name: 'Punjab', r: 1, c: 1 },
  { id: 'HP', name: 'Himachal Pradesh', r: 1, c: 2 },
  { id: 'UK', name: 'Uttarakhand', r: 1, c: 3 },
  { id: 'AR', name: 'Arunachal Pradesh', r: 1, c: 7 },
  { id: 'CH', name: 'Chandigarh', r: 2, c: 0, ut: true },
  { id: 'HR', name: 'Haryana', r: 2, c: 1 },
  { id: 'DL', name: 'Delhi', r: 2, c: 2, ut: true },
  { id: 'UP', name: 'Uttar Pradesh', r: 2, c: 3 },
  { id: 'BR', name: 'Bihar', r: 2, c: 4 },
  { id: 'SK', name: 'Sikkim', r: 2, c: 5 },
  { id: 'AS', name: 'Assam', r: 2, c: 6 },
  { id: 'NL', name: 'Nagaland', r: 2, c: 7 },
  { id: 'GJ', name: 'Gujarat', r: 3, c: 0 },
  { id: 'RJ', name: 'Rajasthan', r: 3, c: 1 },
  { id: 'MP', name: 'Madhya Pradesh', r: 3, c: 2 },
  { id: 'JH', name: 'Jharkhand', r: 3, c: 3 },
  { id: 'WB', name: 'West Bengal', r: 3, c: 4 },
  { id: 'ML', name: 'Meghalaya', r: 3, c: 5 },
  { id: 'TR', name: 'Tripura', r: 3, c: 6 },
  { id: 'MN', name: 'Manipur', r: 3, c: 7 },
  { id: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', r: 4, c: 0, ut: true },
  { id: 'MH', name: 'Maharashtra', r: 4, c: 1 },
  { id: 'CG', name: 'Chhattisgarh', r: 4, c: 2 },
  { id: 'OD', name: 'Odisha', r: 4, c: 3 },
  { id: 'MZ', name: 'Mizoram', r: 4, c: 7 },
  { id: 'GA', name: 'Goa', r: 5, c: 0 },
  { id: 'KA', name: 'Karnataka', r: 5, c: 1 },
  { id: 'TS', name: 'Telangana', r: 5, c: 2 },
  { id: 'AP', name: 'Andhra Pradesh', r: 5, c: 3 },
  { id: 'LD', name: 'Lakshadweep', r: 6, c: 0, ut: true },
  { id: 'KL', name: 'Kerala', r: 6, c: 1 },
  { id: 'TN', name: 'Tamil Nadu', r: 6, c: 2 },
  { id: 'PY', name: 'Puducherry', r: 6, c: 3, ut: true },
  { id: 'AN', name: 'Andaman & Nicobar Islands', r: 6, c: 6, ut: true },
] as const;

export type StateId = (typeof STATES)[number]['id'];
export const stateById = (id: StateId) => STATES.find((s) => s.id === id)!;

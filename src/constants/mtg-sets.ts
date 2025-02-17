import sets from './sets.json'; // GET https://api.scryfall.com/sets (only "data" array property)

export const OLD_MAGIC_SETS: { [code: string]: string } = {
  'OTJ': 'Outlaws of Thunder Junction',
  'OTP': 'Breaking News',
  'OTC': 'Outlaws of Thunder Junction Commander',
  '40K': '"Warhammer 40,000"',
  'CLU': 'Ravnica: Clue Edition',
  'MH3': 'Modern Horizons 3',
  'M3C': 'Modern Horizons 3 Commander',
  'SOI': 'Shadows over Innistrad',
  'IMA': 'Iconic Masters',
  'ZNR': 'Zendikar Rising',
  'AER': 'Aether Revolt',
  'KHM': 'Kaldheim',
  'MBS-1': 'Mystery Boosters 2',
};

export const MAGIC_SETS = Object.fromEntries(sets.map(set => ([set.code.toUpperCase(), set.name])));
export const MAGIC_SETS_DETAILS = Object.fromEntries(sets.map(set => ([set.code.toUpperCase(), set])));
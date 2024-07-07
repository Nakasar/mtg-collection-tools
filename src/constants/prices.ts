type MarketPriceStructure = {
  [set: string]: {
    [productType: string]: number;
  };
}

export const MarketPrices = {
  'MH3': {
    'COLLECTOR': 39.90,
    'DRAFT_BOOSTER': 9.90,
  },
}
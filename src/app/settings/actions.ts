'use server';

import 'server-only';

export async function refreshCardPrices(): Promise<void> {
  console.log('Refreshing card prices');

  const response = await fetch("http://localhost:3080/refresh-cards-prices", {
    method: 'POST',
  });

  if (response.ok) {
    console.log('Card prices refreshed');
  } else {
    console.error('Failed to refresh card prices');
  }
}

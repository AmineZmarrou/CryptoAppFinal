export const COINGECKO_KEY = 'CG-igV2z51Zwp5BFymuT5c6s7Jc';
export const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'tron', 'dogecoin'];
export const COIN_API_BASE = 'https://api.coingecko.com/api/v3/coins';
export const COIN_QUERY = `?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=${COINGECKO_KEY}`;
export const API_BASE_URL = 'http://10.165.101.50:4000/api';

export const requestApi = async (path, method, body, token) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

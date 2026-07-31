const PREMBLY_BASE_URL = process.env.PREMBLY_BASE_URL || 'https://api.prembly.com';

const getHeaders = () => {
  const apiKey = process.env.PREMBLY_API_KEY;

  if (!apiKey) {
    throw new Error('PREMBLY_API_KEY must be configured');
  }

  return {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };
};

const premblyFetch = async (path, options = {}) => {
  const response = await fetch(`${PREMBLY_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.detail || data?.message || 'Prembly API request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

export const lookupNIN = async (nin) => {
  return premblyFetch('/verification/vnin-basic', {
    method: 'POST',
    body: JSON.stringify({ number: nin }),
  });
};

export const lookupDriverLicense = async (licenseNumber, firstName, lastName) => {
  return premblyFetch('/verification/drivers_license/advance/v2', {
    method: 'POST',
    body: JSON.stringify({
      number: licenseNumber,
      first_name: firstName || '',
      last_name: lastName || '',
    }),
  });
};

export const lookupVotersID = async (vin) => {
  return premblyFetch('/verification/voters_card', {
    method: 'POST',
    body: JSON.stringify({ number: vin }),
  });
};

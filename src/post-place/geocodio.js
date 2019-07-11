const axios = require('axios');

const API_KEY = 'c237c32595c2d45d7428432d2433d47ded5e3e4';

exports.geocode = async (address) => {
  const response = axios.get('https://api.geocod.io/v1.3/geocode', {
    params: {
      api_key: 'c237c32595c2d45d7428432d2433d47ded5e3e4',
      q: `${address.street}, ${address.city} ${address.state}`
    }
  });
  if (response.status == 200 && !!response.data.results && response.data.results.length > 0) {
    result = response.data.results[0];
    return {
      lat: result.location.lat,
      lng: result.location.lng
    }
  } else {
    return null;
  }
}

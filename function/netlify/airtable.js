// netlify/functions/airtable.js
// Serverless function to proxy Airtable requests securely

const fetch = require('node-fetch');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, body, queryStringParameters } = event;
    const path = event.path.replace('/.netlify/functions/airtable', '');
    
    // Parse request body if present
    const requestBody = body ? JSON.parse(body) : null;
    
    // Build Airtable API URL
    let url = `${BASE_URL}${path}`;
    if (queryStringParameters) {
      const params = new URLSearchParams(queryStringParameters);
      url += `?${params.toString()}`;
    }
    
    // Make request to Airtable
    const options = {
      method: httpMethod,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (requestBody && (httpMethod === 'POST' || httpMethod === 'PATCH')) {
      options.body = JSON.stringify(requestBody);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Airtable function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
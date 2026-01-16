require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

async function testPaymentMethods() {
  try {
    // First, login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'tuipaul@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✓ Login successful');
    
    // Then fetch payment methods
    console.log('\nFetching payment methods...');
    const pmResponse = await axios.get('http://localhost:3001/api/payment-methods', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ Payment methods response:');
    console.log(JSON.stringify(pmResponse.data, null, 2));
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testPaymentMethods();

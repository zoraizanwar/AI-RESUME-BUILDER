const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/api/v1/auth/login/', {
      email: 'test@example.com',
      password: 'password'
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();

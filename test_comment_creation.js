const axios = require('axios');

// Test comment creation
const testCommentCreation = async () => {
  try {
    console.log('Testing comment creation...');
    
    // First, let's get a valid task ID from the database
    // For now, let's use the task ID from the error: 69520696fe677308a47a4a6f
    const taskId = '69520696fe677308a47a4a6f';
    
    const response = await axios.post(
      `http://localhost:5000/api/comments/task/${taskId}`,
      { content: 'Test comment from script' },
      {
        headers: {
          'Authorization': 'Bearer YOUR_AUTH_TOKEN_HERE', // Replace with a valid token
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Comment creation successful:', response.data);
  } catch (error) {
    console.error('Comment creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
};

// Run the test
if (require.main === module) {
  testCommentCreation();
}

module.exports = { testCommentCreation };
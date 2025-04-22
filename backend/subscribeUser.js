/**
 * Lambda function to subscribe a user to the SNS topic for event notifications
 */

// Import the AWS SDK
const AWS = require('aws-sdk');

// Initialize SNS client
const sns = new AWS.SNS();

// SNS Topic ARN - Replace with your actual SNS Topic ARN after creation
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789012:EventNotifications';

/**
 * Lambda handler function
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} - API response
 */
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Replace with your S3 website URL in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight request successful' })
    };
  }
  
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const email = body.email;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid email address provided' })
      };
    }
    
    // Subscribe the email to the SNS topic
    const params = {
      Protocol: 'email',
      TopicArn: SNS_TOPIC_ARN,
      Endpoint: email
    };
    
    const subscribeResult = await sns.subscribe(params).promise();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Subscription pending. Please check your email to confirm subscription.',
        subscriptionArn: subscribeResult.SubscriptionArn
      })
    };
  } catch (error) {
    console.error('Error subscribing user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to subscribe user',
        error: error.message
      })
    };
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 
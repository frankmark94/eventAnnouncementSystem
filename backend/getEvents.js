/**
 * Lambda function to retrieve events from DynamoDB
 */

// Import the AWS SDK
const AWS = require('aws-sdk');

// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();

// DynamoDB table name - Replace with your actual table name
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'Events';

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
    'Access-Control-Allow-Methods': 'OPTIONS,GET'
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
    // Query parameters for filtering (optional)
    const queryParams = event.queryStringParameters || {};
    
    // Basic scan parameters to get all events
    const params = {
      TableName: EVENTS_TABLE
    };
    
    // If we have a date to filter by, add it to the scan
    if (queryParams.fromDate) {
      params.FilterExpression = 'date >= :fromDate';
      params.ExpressionAttributeValues = {
        ':fromDate': queryParams.fromDate
      };
    }
    
    // Get events from DynamoDB
    const result = await dynamodb.scan(params).promise();
    
    // Sort events by date (newest first)
    const events = result.Items.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(events)
    };
  } catch (error) {
    console.error('Error retrieving events:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to retrieve events',
        error: error.message
      })
    };
  }
}; 
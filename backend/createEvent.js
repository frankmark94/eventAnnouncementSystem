/**
 * Lambda function to create a new event and notify subscribers
 */

// Import the AWS SDK
const AWS = require('aws-sdk');

// Initialize DynamoDB and SNS clients
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

// DynamoDB table name and SNS Topic ARN - Replace with your actual values
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'Events';
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
    
    // Validate required fields
    if (!body.title || !body.description || !body.date || !body.location) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing required fields: title, description, date, location' })
      };
    }
    
    // Create event object
    const eventId = generateEventId();
    const timestamp = new Date().toISOString();
    const newEvent = {
      id: eventId,
      title: body.title,
      description: body.description,
      date: body.date,
      location: body.location,
      organizer: body.organizer || 'Anonymous',
      createdAt: timestamp
    };
    
    // Store event in DynamoDB
    await dynamodb.put({
      TableName: EVENTS_TABLE,
      Item: newEvent
    }).promise();
    
    // Prepare and send SNS notification
    const eventDate = new Date(body.date).toLocaleString();
    const message = `
      New Event: ${body.title}
      
      Date: ${eventDate}
      Location: ${body.location}
      
      ${body.description}
      
      Organized by: ${body.organizer || 'Anonymous'}
    `;
    
    const snsParams = {
      TopicArn: SNS_TOPIC_ARN,
      Subject: `New Event: ${body.title}`,
      Message: message
    };
    
    await sns.publish(snsParams).promise();
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Event created successfully',
        event: newEvent
      })
    };
  } catch (error) {
    console.error('Error creating event:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to create event',
        error: error.message
      })
    };
  }
};

/**
 * Generate a random event ID
 * @returns {string} - Unique event ID
 */
function generateEventId() {
  return 'evt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 
# Event Announcement System

A serverless application built with AWS services that allows users to:
- Subscribe to event notifications via email
- View a list of events
- Create new events

## Architecture

This project uses the following AWS services:
- S3: Hosts the static frontend (HTML/CSS/JS)
- SNS: Sends email notifications to subscribers
- Lambda: Provides backend logic (subscribe user, create/view events)
- API Gateway: Handles HTTP requests
- DynamoDB: Stores event data
- IAM: Secures access control

## Project Structure

```
eventAnnounceSystem/
├── frontend/              # Frontend code hosted on S3
│   ├── css/               # Stylesheet files
│   ├── js/                # JavaScript files
│   ├── index.html         # Landing page
│   ├── events.html        # Events list page
│   └── form.html          # Form to create events and subscribe
│
├── backend/               # Backend Lambda functions
│   ├── subscribeUser.js   # Adds email to SNS
│   ├── createEvent.js     # Stores event data and notifies SNS
│   └── getEvents.js       # Returns list of events
│
└── infrastructure/        # AWS configuration files
    ├── cloudformation.yml # CloudFormation template
    └── sam-template.yml   # SAM template

```

## Deployment Instructions

1. **Set up AWS resources**:
   - Create a DynamoDB table named `Events`
   - Create an SNS topic named `EventNotifications`
   - Set up IAM roles with necessary permissions

2. **Deploy Lambda functions**:
   - Upload the Lambda functions from the `backend` directory
   - Configure API Gateway to trigger the Lambda functions

3. **Deploy frontend**:
   - Create an S3 bucket with website hosting enabled
   - Upload the contents of the `frontend` directory to the bucket

4. **Test the application**:
   - Visit the S3 website URL
   - Create a new event
   - Subscribe to notifications
   - Confirm that subscribers receive emails when new events are created 
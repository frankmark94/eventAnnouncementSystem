# Event Announcement System

A serverless application built with AWS services that allows users to:
- Subscribe to event notifications via email
- View a list of events
- Create new events

![image](https://github.com/user-attachments/assets/966648e4-f522-47a1-b8ac-386ce6dba290)


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

## IAM Roles and Permissions

This system requires specific IAM roles and permissions to function properly. Below are detailed instructions for setting up the necessary IAM roles:

### Lambda Execution Role

The Lambda functions require a dedicated IAM role with permissions to:

1. **For all Lambda functions**:
   - `logs:CreateLogGroup`
   - `logs:CreateLogStream`
   - `logs:PutLogEvents`

2. **For subscribeUser.js**:
   - `sns:Subscribe`
   - `sns:ListSubscriptionsByTopic`
   - `sns:GetTopicAttributes`

3. **For createEvent.js**:
   - `dynamodb:PutItem`
   - `sns:Publish`
   - `sns:GetTopicAttributes`

4. **For getEvents.js**:
   - `dynamodb:Scan`
   - `dynamodb:Query`
   - `dynamodb:GetItem`

To create this role:

1. Open the IAM console in AWS
2. Navigate to Roles → Create role
3. Select "AWS service" as the trusted entity and "Lambda" as the use case
4. Attach the `AWSLambdaBasicExecutionRole` managed policy
5. Create a custom policy with the permissions listed above
6. Name the role (e.g., "EventAnnouncementSystemLambdaRole")
7. Use this role when creating your Lambda functions

### API Gateway Permissions

To allow API Gateway to invoke Lambda functions:

1. Each Lambda function must grant permission to API Gateway to invoke it:
   ```json
   {
     "Effect": "Allow",
     "Principal": {"Service": "apigateway.amazonaws.com"},
     "Action": "lambda:InvokeFunction",
     "Resource": "<your Lambda function ARN>",
     "Condition": {
       "ArnLike": {
         "AWS:SourceArn": "arn:aws:execute-api:<region>:<account-id>:<api-id>/*"
       }
     }
   }
   ```

2. This permission is automatically added when you configure the API Gateway integration through the AWS console or when using the CloudFormation/SAM templates provided.

### S3 Bucket Permissions

For the S3 bucket hosting the static website:

1. **Bucket Policy** to allow public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::<your-bucket-name>/*"
       }
     ]
   }
   ```

2. **CORS Configuration** to allow API requests from the website:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### SNS Topic Permissions

The SNS topic needs to:
1. Allow Lambda functions to publish messages
2. Allow subscription management

These permissions are handled by the Lambda execution role mentioned above.

## Automating IAM Role Creation

The easiest way to create these IAM roles is to use the CloudFormation or SAM templates provided in the `infrastructure/` directory. These templates automatically:

1. Create the necessary IAM roles with the appropriate permissions
2. Set up trust relationships between services
3. Attach the roles to the corresponding resources

To deploy using the templates, see the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions.

## Deployment Instructions

1. **Set up AWS resources**:
   - Create a DynamoDB table named `Events`
   - Create an SNS topic named `EventNotifications`
   - Set up IAM roles with necessary permissions (see IAM Roles section above)

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

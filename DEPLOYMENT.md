# Deployment Guide for Event Announcement System

This guide provides step-by-step instructions for deploying the Event Announcement System to AWS.

## Prerequisites

1. [AWS Account](https://aws.amazon.com/)
2. [AWS CLI](https://aws.amazon.com/cli/) installed and configured
3. [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) (for SAM deployment)
4. [Node.js](https://nodejs.org/) (v12 or higher)

## Option 1: Deploy using AWS SAM

SAM (Serverless Application Model) simplifies the deployment process by providing shortcuts for creating serverless resources.

### Step 1: Package Lambda Functions

```bash
# Install dependencies for Lambda functions
cd backend
npm init -y
npm install aws-sdk

# Go back to the project root
cd ..
```

### Step 2: Deploy with SAM

```bash
# Deploy the application using SAM
sam deploy --guided --template-file infrastructure/sam-template.yml
```

Follow the prompts to configure your deployment. When asked:
- Enter a stack name (e.g., `event-announcement-system`)
- Choose your preferred AWS region
- Accept the default parameter values or customize them
- Confirm deployment when prompted

SAM will create all the required AWS resources including Lambda functions, API Gateway, DynamoDB table, and SNS topic.

### Step 3: Note the Outputs

After deployment completes, SAM will display the outputs from the CloudFormation stack:
- `WebsiteURL`: URL for the S3 website
- `ApiEndpoint`: URL for the API Gateway
- `SNSTopicARN`: ARN of the SNS topic
- `DynamoDBTableName`: Name of the DynamoDB table

### Step 4: Update API URL in Frontend

1. Update the `API_URL` variable in `frontend/js/api.js` with the `ApiEndpoint` value:

```javascript
const API_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod';
```

### Step 5: Upload Frontend Files to S3

```bash
# Upload all frontend files to the S3 bucket
aws s3 sync frontend/ s3://your-bucket-name/ --acl public-read
```

Replace `your-bucket-name` with the actual S3 bucket name from the SAM deployment.

## Option 2: Deploy using CloudFormation

You can also deploy using the regular CloudFormation template if you prefer.

### Step 1: Package Lambda Functions

```bash
# Create deployment packages for Lambda functions
cd backend
npm init -y
npm install aws-sdk

# Create directories for Lambda packages
mkdir -p ../deployment/lambda

# Create ZIP packages for each Lambda function
zip -r ../deployment/lambda/subscribeUser.zip subscribeUser.js
zip -r ../deployment/lambda/createEvent.zip createEvent.js
zip -r ../deployment/lambda/getEvents.zip getEvents.js

# Go back to project root
cd ..
```

### Step 2: Upload Lambda Packages to S3

```bash
# Create the S3 bucket if it doesn't exist
aws s3 mb s3://your-deployment-bucket

# Upload Lambda ZIP files
aws s3 cp deployment/lambda/subscribeUser.zip s3://your-deployment-bucket/lambda/
aws s3 cp deployment/lambda/createEvent.zip s3://your-deployment-bucket/lambda/
aws s3 cp deployment/lambda/getEvents.zip s3://your-deployment-bucket/lambda/
```

### Step 3: Deploy with CloudFormation

```bash
# Deploy the CloudFormation stack
aws cloudformation create-stack \
  --stack-name event-announcement-system \
  --template-body file://infrastructure/cloudformation.yml \
  --parameters \
    ParameterKey=S3BucketName,ParameterValue=your-website-bucket \
    ParameterKey=DynamoDBTableName,ParameterValue=Events \
    ParameterKey=SnsTopicName,ParameterValue=EventNotifications \
  --capabilities CAPABILITY_IAM
```

### Step 4: Check Stack Outputs and Upload Frontend

Follow the same steps as in the SAM deployment to check stack outputs and upload frontend files.

## Testing the Application

1. Navigate to the S3 website URL in your browser
2. Subscribe to event notifications with your email
3. Create a new event
4. Check your email for a subscription confirmation from SNS
5. After confirming, you should receive notifications for new events

## Troubleshooting

- If Lambda functions return errors, check CloudWatch Logs
- If frontend API calls fail, verify the API URL in `api.js`
- Make sure CORS is properly configured on API Gateway
- Check IAM permissions for Lambda functions if they can't access DynamoDB or SNS

## Cleanup

To remove all resources when you're done:

```bash
# SAM deployment
sam delete

# CloudFormation deployment
aws cloudformation delete-stack --stack-name event-announcement-system
``` 
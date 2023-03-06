# CDK Implementation of Highly Available Messaging System

This repository contains the AWS Cloud Development Kit (CDK) code for implementing a highly available and scalable messaging system using AWS AppSync with CloudFront and Amazon Global DynamoDB.

## Architecture

The solution architecture includes the following components:

-   [x] AWS AppSync API deployed across multiple regions
-   [x] Amazon Global DynamoDB tables
-   [x] AWS Lambda functions for handling real-time messaging and communication
-   [ ] Amazon CloudFront CDN for caching and routing requests
-   [ ] Amazon Route 53 for DNS management and failover capabilities

## Getting Started

To get started with deploying the solution using CDK, follow these steps:

1.  Clone the repository to your local machine.
2.  Install the AWS CDK by running `npm install -g aws-cdk`.
3.  Run `npm install` to install the dependencies required for the CDK deployment.
4.  Run `cdk bootstrap` to prepare your AWS account for deploying the CDK stacks.
5.  Run `cdk deploy --all --require-approval never` to deploy the solution to AWS.

## Testing

To test the deployed solution, use the following steps:

1.  Access the deployed AWS AppSync API using the URL provided in the CDK output.
2.  Use a GraphQL client or tool to interact with the API, sending and receiving messages between different servers and regions.
3.  Also the entire solution can be tested here https://trading.suresh.pro

#!/bin/bash

# Create S3 buckets for local development
awslocal s3 mb s3://axtech-documents-dev
awslocal s3 mb s3://axtech-generated-dev
awslocal s3 mb s3://axtech-returns-dev
awslocal s3 mb s3://axtech-signatures-dev

# Set CORS for document bucket
awslocal s3api put-bucket-cors --bucket axtech-documents-dev --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

echo "LocalStack S3 buckets created successfully"

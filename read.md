Authentication is handled by AWS Cognito IAM service.
Backend services only validate JWT access tokens and do not implement local authentication.

The system uses Neon PostgreSQL as a managed cloud database.
User authentication and identity management are handled by AWS Cognito, and user data is not stored locally.

Search functionality is implemented within the hotel-service for simplicity.
It filters hotels based on availability, capacity, and date range, and applies discounts for authenticated users.

# API Demo - Node.js

A TypeScript-based RESTful API built with Express.js showcasing modern Node.js development practices and CRUD operations for user management.

## 🎯 Project Overview

This project is part of a multi-language series demonstrating equivalent server implementations across different technologies. This Node.js version showcases:

- **Express.js** framework with TypeScript
- RESTful API design patterns
- Input validation with Joi
- Comprehensive testing with Vitest
- Docker containerization
- Modern development tooling (ESLint, Prettier)
- Clean architecture with separation of concerns

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Joi
- **Testing**: Vitest with coverage reporting
- **Linting**: ESLint with TypeScript rules
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OR Docker and Docker Compose

### Option 1: Local Development

1. **Clone and navigate to the project**

   ```bash
   git clone <repository-url>
   cd api-demo-node
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Server is now running at** `http://localhost:3000`

### Option 2: Docker (Recommended for Testing)

1. **Clone and navigate to the project**

   ```bash
   git clone <repository-url>
   cd api-demo-node
   ```

2. **Start with Docker Compose**

   ```bash
   npm run docker:up
   ```

3. **Server is now running at** `http://localhost:3000`

4. **Stop the container when done**
   ```bash
   npm run docker:down
   ```

## 📋 API Endpoints

The API provides the following endpoints for user management:

### Base URL

```
http://localhost:3000
```

### Endpoints

| Method   | Endpoint    | Description       | Body Required |
| -------- | ----------- | ----------------- | ------------- |
| `GET`    | `/`         | Homepage          | No            |
| `GET`    | `/users`    | Get all users     | No            |
| `POST`   | `/user`     | Create a new user | Yes           |
| `GET`    | `/user/:id` | Get user by ID    | No            |
| `PATCH`  | `/user/:id` | Update user by ID | Yes           |
| `DELETE` | `/user/:id` | Delete user by ID | No            |

### User Data Structure

```json
{
  "id": "string (UUID)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## 🧪 Testing the API

### Using curl

**1. Get all users:**

```bash
curl http://localhost:3000/users
```

**2. Get a specific user:**

```bash
curl http://localhost:3000/user/4b1335f4-788b-4e8d-9ed5-04b99ce430a4
```

**3. Create a new user:**

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-555-1234"
  }'
```

**4. Update a user:**

```bash
curl -X PATCH http://localhost:3000/user/4b1335f4-788b-4e8d-9ed5-04b99ce430a4 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "email": "jane.doe@example.com"
  }'
```

**5. Delete a user:**

```bash
curl -X DELETE http://localhost:3000/user/4b1335f4-788b-4e8d-9ed5-04b99ce430a4
```

### Using a GUI Tool (Postman, Insomnia, etc.)

Import the following collection or manually create requests:

- **Base URL**: `http://localhost:3000`
- Set `Content-Type: application/json` for POST/PATCH requests
- Use the endpoints listed above

## 🏗 Project Structure

```
api-demo-node/
├── src/
│   ├── controllers/user/       # Business logic for user operations
│   ├── middleware/            # Custom middleware (validation, logging)
│   ├── models/               # Data models and in-memory storage
│   ├── routes/               # Route definitions
│   ├── validation/           # Joi validation schemas
│   └── tests/                # Unit tests
├── bin/                      # Server startup script
├── public/                   # Static assets
├── views/                    # Jade templates
├── app.ts                    # Express app configuration
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── package.json             # Dependencies and scripts
```

## 🧪 Running Tests

**Run all tests:**

```bash
npm test
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

**Generate and view coverage report:**

```bash
npm test
npm run coverage
```

## 🔧 Development Scripts

```bash
npm run build       # Compile TypeScript to JavaScript
npm run dev         # Start development server with hot reload
npm start          # Start production server
npm test           # Run tests with coverage
npm run test:watch # Run tests in watch mode
npm run coverage   # Open coverage report in browser
```

## 🐳 Docker Commands

```bash
npm run docker:build  # Build Docker image
npm run docker:up     # Start container
npm run docker:down   # Stop container
```

## ✨ Features Demonstrated

- **RESTful API Design**: Proper HTTP methods and status codes
- **Input Validation**: Joi schemas for request validation
- **Error Handling**: Centralized error handling middleware
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive unit tests with high coverage
- **Code Quality**: ESLint and Prettier for consistent code style
- **Containerization**: Docker setup for consistent deployment
- **Logging**: Request logging middleware
- **Separation of Concerns**: Clean architecture with controllers, models, and routes

## 💾 Data Storage

This demo uses **in-memory storage** for simplicity. The application comes pre-loaded with 10 sample users. Data will persist during the application session but will reset when the server restarts.

## 🔄 Sample Data

The API comes with 10 pre-loaded users for testing. You can immediately test GET requests without needing to create data first.

## 📝 Notes for Reviewers

- **No Database**: Uses in-memory storage for demo simplicity
- **Environment**: Configured for development with detailed logging
- **Validation**: All inputs are validated using Joi schemas
- **Error Handling**: Proper HTTP status codes and error responses
- **Testing**: High test coverage with realistic test scenarios
- **Code Style**: Follows TypeScript and Express.js best practices

---

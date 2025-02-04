# Learning Management System (LMS) Backend

A basic LMS backend built with Node.js, Express, MongoDB, and Redis, featuring user authentication, course management, progress tracking, and feedback systems.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication
  - Google OAuth integration
  - Role-based access control (Student, Instructor, Admin)

- **Course Management**

  - CRUD operations for courses
  - Content management (video, document, quiz)
  - Course search and pagination

- **Progress Tracking**

  - Automatic progress calculation
  - Content completion tracking
  - Last accessed timestamp

- **Performance**
  - Redis caching
  - Request validation
  - Error handling
  - API rate limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- Google OAuth credentials (for Google Sign-In)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Ejay02/lms-backend.git
cd lms-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up Redis:

   **For Local Development:**

   - Install Redis:

     - On macOS (using Homebrew):
       ```bash
       brew install redis
       brew services start redis
       ```
     - On Ubuntu:
       ```bash
       sudo apt update
       sudo apt install redis-server
       sudo systemctl start redis-server
       ```
     - On Windows:
       - Download Windows Subsystem for Linux (WSL)
       - Follow Ubuntu instructions, or
       - Download Redis for Windows from [GitHub](https://github.com/microsoftarchive/redis/releases)

   - Verify Redis installation:

     ```bash
     redis-cli ping
     # Should return "PONG"
     ```

   - Default configuration:
     ```
     REDIS_HOST=localhost
     REDIS_PORT=6379
     REDIS_PASSWORD= # Leave empty for local development
     ```

   **For Production:**

   - Use a Redis cloud service (e.g., Redis Labs, AWS ElastiCache)
   - Get the host, port, and password from your provider
   - Update your .env accordingly

4. Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/lms

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password # If using cloud service
```

## 🚦 Usage

1. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

2. Access the API at `http://localhost:5000`
3. View API documentation at `https://documenter.getpostman.com/view/36020954/2sAYX5LNY1`

## 📝 API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/google
```

### Courses

```
GET /api/courses
POST /api/courses
GET /api/courses/:id
PUT /api/courses/:id
DELETE /api/courses/:id
```

### Progress

```
GET /api/progress/:courseId
POST /api/progress/:courseId
```

### Feedback

```
POST /api/feedback/:courseId
GET /api/feedback/:courseId
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

- Input validation using express-validator
- JWT authentication
- Role-based access control
- Secure password hashing using bcrypt
- XSS protection
- CORS enabled

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 👥 Authors

- Ej - Initial work - [Ej](https://github.com/Ejay02/lms-backend.git)

## 🙏 Acknowledgments

- Express.js
- MongoDB
- Redis
- JWT

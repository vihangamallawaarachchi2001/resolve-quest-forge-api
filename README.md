# Backend README

## Support Ticket System - Backend

A robust Node.js/Express API with MongoDB database for managing support tickets, user authentication, and real-time communications.

### 🚀 Features

- **RESTful API**: Standard HTTP methods with JSON responses
- **User Management**: Registration, login, role-based permissions
- **Ticket Management**: Full CRUD operations with status tracking
- **Real-time Chat**: Message system per ticket
- **Reviews & Ratings**: Customer feedback with agent responses
- **Knowledge Base**: Article management system
- **Analytics**: Performance metrics and reporting
- **Authentication**: JWT-based secure access

### 🛠️ Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Built-in middleware validation
- **Logging**: Console logging with structured format
- **Environment**: Dotenv for configuration

### 📁 Project Structure

```
backend/
├── models/             # Mongoose schemas
│   ├── User.js         # User schema
│   ├── Ticket.js       # Ticket schema
│   ├── Chat.js         # Chat schema
│   ├── Review.js       # Review schema
│   └── Blog.js         # Blog schema
├── routes/             # API route handlers
│   ├── userRoutes.js   # User endpoints
│   ├── ticketRoutes.js # Ticket endpoints
│   ├── chatRoutes.js   # Chat endpoints
│   ├── reviewRoutes.js # Review endpoints
│   └── blogRoutes.js   # Blog endpoints
├── middleware/         # Custom middleware
├── config/             # Configuration files
└── index.js           # Main application entry
```

### 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/vihangamallawaarachchi2001/resolve-quest-forge-api.git
cd resolve-quest-forge-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/support-ticket-system
JWT_SECRET=your-super-secret-jwt-key
```

5. Start the server:
```bash
pnpm run dev
```

### 🚦 Available Scripts

- `pnpm run dev` - Start development server with auto-restart
- `pnpm start` - Start production server
- `pnpm run test` - Run tests (if implemented)
- `pnpm run lint` - Run ESLint

### 🌐 API Endpoints

#### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/signup` - User registration

#### Tickets
- `GET /api/tickets` - Get all tickets (with filtering)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

#### Chat
- `GET /api/chats/ticket/:ticketId` - Get chat for ticket
- `POST /api/chats/ticket/:ticketId/message` - Send message
- `PUT /api/chats/ticket/:ticketId/message/:messageId` - Edit message
- `DELETE /api/chats/ticket/:ticketId/message/:messageId` - Delete message

#### Reviews
- `GET /api/reviews` - Get all reviews (with filtering)
- `POST /api/reviews` - Create new review
- `GET /api/reviews/:id` - Get specific review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### Users
- `GET /api/users/profiles` - Get all users
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

#### Blogs
- `GET /api/blogs` - Get all blog posts
- `POST /api/blogs` - Create blog post
- `GET /api/blogs/:id` - Get specific blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog

### 🔐 Authentication & Authorization

- JWT tokens required for protected routes
- Role-based access control (customer, agent, admin)
- Token validation middleware
- Secure password hashing with bcrypt

### 📊 Database Models

#### User Model
- `_id`: ObjectId (auto-generated)
- `fullname`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: 'customer', 'agent', 'admin')
- `avatarUrl`: String (optional)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

#### Ticket Model
- `_id`: ObjectId (auto-generated)
- `title`: String (required)
- `description`: String (required)
- `status`: String (enum: 'open', 'inprogress', 'resolved', 'closed')
- `priority`: String (enum: 'low', 'medium', 'high', 'urgent')
- `userEmail`: String (required)
- `userName`: String (required)
- `userId`: ObjectId (ref: User, required)
- `assignedAgentId`: ObjectId (ref: User, optional)
- `assignedAgentName`: String (optional)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

#### Chat Model
- `_id`: ObjectId (auto-generated)
- `ticketId`: ObjectId (ref: Ticket, required)
- `messages`: Array of message objects
  - `senderId`: ObjectId (ref: User, required)
  - `senderName`: String (required)
  - `senderRole`: String (required)
  - `message`: String (required)
  - `timestamp`: Date (auto-generated)
- `lastUpdated`: Date (auto-generated)

#### Review Model
- `_id`: ObjectId (auto-generated)
- `username`: String (required)
- `description`: String (required)
- `ratingNumber`: Number (required, min: 1, max: 5)
- `ticketTitle`: String (required)
- `agentReply`: String (optional)
- `agentId`: ObjectId (ref: User, optional)
- `repliedAt`: Date (optional)
- `createdAt`: Date (auto-generated)

### 🛡️ Security Measures

- Passwords hashed with bcrypt
- JWT tokens with expiration
- Input validation and sanitization
- Role-based access control
- Secure HTTP headers
- CORS configuration

### 🧪 Testing

- Unit tests for API endpoints
- Integration tests for database operations
- Authentication flow testing
- Role-based permission testing

### 🚀 Deployment

1. Set production environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prod-database
JWT_SECRET=production-jwt-secret-key
```

2. Build and run:
```bash
pnpm start
```

### 🔧 Configuration

- **Environment Variables**: All sensitive data stored in `.env`
- **Database Connection**: MongoDB connection string
- **JWT Secret**: Secret key for token generation
- **Port**: Server port (default: 3000)

### 📈 Monitoring & Logging

- Request/response logging
- Error tracking
- Performance metrics
- Database operation logging

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes with descriptive messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with detailed description

### 🐛 Error Handling

- Comprehensive error responses
- Validation error messages
- Database error handling
- Authentication error responses

### 📄 License

MIT License - see LICENSE file for details.
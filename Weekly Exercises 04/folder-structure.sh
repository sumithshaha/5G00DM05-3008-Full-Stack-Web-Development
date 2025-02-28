movie-api/
├── config/
│   └── db.js            # Database configuration
├── controllers/
│   ├── movieController.js # Movie CRUD logic
│   └── authController.js  # Authentication logic
├── middleware/
│   ├── authMiddleware.js  # JWT verification middleware
│   └── validateMiddleware.js # Validation middleware
├── models/
│   ├── Movie.js         # Movie schema
│   └── User.js          # User schema
├── routes/
│   ├── movieRoutes.js   # Movie API routes
│   └── authRoutes.js    # Authentication routes
├── .env                 # Environment variables
├── package.json
└── server.js            # Express server setup

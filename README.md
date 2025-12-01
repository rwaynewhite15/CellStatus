# Manufacturing Cell Status Keeper

A real-time manufacturing cell status tracking application for monitoring machines, operators, production statistics, and maintenance logs on a production floor.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)

## 🌟 Features

- **Real-time Dashboard**: Overview of all machines with color-coded status indicators
- **Machine Management**: Add, edit, and monitor machines with production targets
- **Operator Assignment**: Track who is running each machine with shift information
- **Production Tracking**: Monitor units produced, cycle times, and efficiency metrics
- **Maintenance Logging**: Record and track maintenance activities (preventive, corrective, emergency, inspection)
- **Dark Mode**: Full theme support for day/night operation

## 🚀 Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/rwaynewhite15/CellStatus.git
   cd CellStatus
   npm install
   ```

2. **Set Up Database**
   - Create a free database at [Neon](https://neon.tech)
   - Copy `.env.example` to `.env`
   - Add your `DATABASE_URL` from Neon

3. **Initialize Database**
   ```bash
   npm run db:push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Access at: `http://localhost:5000`

## 📦 Deployment

This app is designed for a split deployment:
- **Frontend**: GitHub Pages (static)
- **Backend**: Render/Railway/Vercel (Node.js)
- **Database**: Neon (PostgreSQL)

### Quick Deploy

See [QUICKSTART.md](./QUICKSTART.md) for fast deployment steps.

### Detailed Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TanStack Query (data fetching)
- Shadcn UI + Radix UI (components)
- Tailwind CSS (styling)
- Wouter (routing)

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- CORS & Rate Limiting

### Deployment
- GitHub Pages (frontend)
- Render (backend)
- Neon (database)

## 📂 Project Structure

```
CellStatus/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database connection
│   └── storage.ts       # Data layer
├── shared/              # Shared types/schemas
│   └── schema.ts        # Database schema
└── script/              # Build scripts
```

## 🔒 Security Features

- ✅ CORS protection (whitelist origins)
- ✅ Rate limiting (100 req/15min per IP)
- ✅ Environment variable isolation
- ✅ HTTPS enforced in production
- ✅ SQL injection protection (parameterized queries)

## 🌐 API Endpoints

### Machines
- `GET /api/machines` - List all machines
- `POST /api/machines` - Create machine
- `PATCH /api/machines/:id` - Update machine
- `PATCH /api/machines/:id/status` - Update status
- `DELETE /api/machines/:id` - Delete machine

### Operators
- `GET /api/operators` - List all operators
- `POST /api/operators` - Create operator
- `PATCH /api/operators/:id` - Update operator
- `DELETE /api/operators/:id` - Delete operator

### Maintenance
- `GET /api/maintenance` - List maintenance logs
- `POST /api/maintenance` - Create log
- `PATCH /api/maintenance/:id` - Update log
- `DELETE /api/maintenance/:id` - Delete log

### Production Stats
- `GET /api/production-stats` - List all stats
- `GET /api/machines/:id/production-stats` - Stats by machine

## 🎨 Design System

- **Fonts**: IBM Plex Sans, IBM Plex Mono
- **Color Palette**: Industrial-themed with semantic status colors
- **Status Colors**:
  - 🟢 Running (green)
  - 🟡 Idle (yellow)
  - 🔴 Down (red)
  - 🔵 Maintenance (blue)
  - 🟣 Setup (purple)

## 📊 Database Schema

See `shared/schema.ts` for complete schema including:
- Machines
- Operators
- Maintenance Logs
- Production Statistics
- Users (for authentication)

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run check        # TypeScript type check
npm run db:push      # Push schema to database
npm run deploy       # Deploy frontend to GitHub Pages
```

### Environment Variables

#### Development (`.env`)
```env
DATABASE_URL=postgresql://...
```

#### Production Backend (Render)
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret
NODE_ENV=production
```

#### Production Frontend (`client/.env.production`)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

## 🐛 Troubleshooting

### Common Issues

**CORS errors**
- Check `server/index.ts` allowedOrigins includes your frontend URL

**Database connection failed**
- Verify `DATABASE_URL` is correct
- Check Neon project isn't paused (free tier)

**Frontend can't reach API**
- Verify `VITE_API_BASE_URL` in `client/.env.production`
- Check network tab in browser DevTools

**Render service not responding**
- Free tier sleeps after 15 minutes
- First request takes ~30 seconds to wake

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Contact

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for manufacturing teams**

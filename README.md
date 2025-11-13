# 🎉 Festify Studio

<div align="center">

![Festify Logo](https://img.shields.io/badge/Festify-Event%20Management-ff6b6b?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTUuMDkgOC4yNkwyMiA5LjI3TDE3IDEzLjE0TDE4LjE4IDIyTDEyIDE4LjI3TDUuODIgMjJMNyAxMy4xNEwyIDkuMjdMOC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A modern, full-stack event management platform for colleges and universities**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Festify Studio** is a comprehensive event management system designed specifically for educational institutions. It enables seamless event creation, registration, team management, ticketing, and payments - all in one unified platform.

### 🎯 Key Highlights

- 🎓 **College-Specific Events**: Events can be restricted to specific colleges or made globally accessible
- 👥 **Team Management**: Comprehensive team registration with member details and validation
- 🎫 **Smart Ticketing**: Automatic QR code generation with ticket validation
- 💳 **Payment Processing**: Integrated payment tracking and transaction management
- 🎨 **Modern UI/UX**: Beautiful, responsive design with dark mode support
- ⚡ **High Performance**: Optimized with caching, debouncing, and parallel data loading
- 🔒 **Secure**: Row Level Security (RLS) policies with Supabase
- 📱 **Mobile Responsive**: Fully responsive across all devices

---

## ✨ Features

### 🎭 For Event Organizers

- **Event Creation & Management**
  - Rich text event descriptions with markdown support
  - Image uploads with Unsplash integration
  - Category-based organization
  - Draft/Published status control
  - College-specific or global visibility

- **Registration Management**
  - Real-time registration tracking
  - Individual and team registration support
  - Custom pricing tiers (individual/team/early bird)
  - Payment status monitoring
  - Registration cancellation and refunds

- **Team Management**
  - Team size configuration (min/max members)
  - Team leader and member details
  - University registration number tracking
  - Team roster visualization

### 👤 For Attendees

- **Event Discovery**
  - Advanced search and filtering
  - Category-based browsing
  - College-specific event visibility
  - Upcoming events calendar

- **Registration Experience**
  - Simple individual registration
  - Team creation and management
  - Real-time price calculation
  - Instant confirmation emails

- **Ticketing**
  - QR code ticket generation
  - Downloadable ticket PDFs
  - Team member tickets
  - Ticket validation system

### 🛡️ For Administrators

- **Comprehensive Dashboard**
  - Real-time statistics and analytics
  - Event, user, and college management
  - Registration oversight
  - Team management
  - Ticket and payment tracking
  - Notification system

- **Data Management**
  - CRUD operations for all entities
  - Bulk actions support
  - Data export capabilities
  - Audit logs

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **State Management**: React Hooks & Context

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Next.js API Routes

### Libraries & Tools
- **QR Code Generation**: qrcode
- **Date Handling**: date-fns
- **Image Optimization**: Next.js Image
- **Code Quality**: ESLint, TypeScript
- **Deployment**: Vercel (recommended)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nihcastics/festify.git
   cd festify/festify-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Unsplash API (for image search)
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL scripts in the `supabase/` directory in order:
   ```bash
   # In Supabase SQL Editor, run these in sequence:
   1. complete-setup.sql
   2. pricing-system-enhanced.sql
   3. team-management-system.sql
   4. enhanced-registration-system.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
festify-studio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── categories/        # Category pages
│   │   ├── colleges/          # College pages
│   │   ├── dashboard/         # User dashboards
│   │   ├── events/            # Event pages
│   │   └── profile/           # User profile
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── error-boundary.tsx
│   │   ├── event-card.tsx
│   │   ├── header.tsx
│   │   └── ...
│   ├── context/              # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── supabase/        # Supabase client & types
│   │   ├── performance.ts   # Performance utilities
│   │   ├── pricing-utils.ts # Pricing calculations
│   │   └── team-utils.ts    # Team management
│   └── styles/              # Global styles
├── supabase/                # Database SQL scripts
├── public/                  # Static assets
└── ...config files
```

---

## 🗄️ Database Schema

### Core Tables

- **`events`**: Event information and metadata
- **`categories`**: Event categories
- **`colleges`**: Educational institution data
- **`profiles`**: User profiles and settings
- **`registrations`**: Event registrations
- **`teams`**: Team information
- **`team_members`**: Individual team member details
- **`tickets`**: Generated tickets with QR codes
- **`payments`**: Payment transactions
- **`notifications`**: User notifications
- **`team_pricing_tiers`**: Dynamic pricing configuration

### Key Features

- **Row Level Security (RLS)**: Enforced on all tables
- **Foreign Key Constraints**: Maintain data integrity
- **Cascade Deletes**: Automatic cleanup of related records
- **Indexes**: Optimized query performance
- **Triggers**: Automatic timestamp updates

---

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Gradient-based with purple, orange, and red accents
- **Typography**: Modern, readable font hierarchy
- **Spacing**: Consistent 8px grid system
- **Components**: Fully accessible shadcn/ui components

### Animations
- Smooth page transitions
- Loading skeletons for better perceived performance
- Hover effects and micro-interactions
- Glass morphism effects

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Adaptive layouts for all screen sizes

---

## ⚡ Performance Optimizations

### Frontend
- **Debounced Search**: 300ms delay to reduce API calls
- **Memoization**: `useMemo` for expensive computations
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and routes

### Backend
- **Parallel Queries**: `Promise.allSettled` for concurrent operations
- **Caching**: In-memory cache with TTL (2-5 minutes)
- **Query Optimization**: Selective field fetching
- **Connection Pooling**: Managed by Supabase

### Error Handling
- **Error Boundaries**: Graceful error recovery
- **Retry Logic**: Exponential backoff for failed requests
- **Timeout Protection**: 30-second max for critical operations
- **Fallback UI**: User-friendly error messages

---

## 🔐 Security

### Authentication
- Supabase Auth with JWT tokens
- Email/password authentication
- Session management
- Protected routes and API endpoints

### Authorization
- Role-based access control (Organizer/Attendee/Admin)
- Row Level Security (RLS) policies
- College-based event visibility
- Admin-only dashboard access

### Data Protection
- SQL injection prevention (Supabase)
- XSS protection (React)
- CSRF tokens for mutations
- Secure environment variables

---

## 📚 API Documentation

### Supabase Tables

#### Events API
```typescript
// Fetch published events
const { data: events } = await supabase
  .from('events')
  .select('*, category:categories(*), college:colleges(*)')
  .eq('event_status', 'published')
  .gte('end_date', new Date().toISOString());

// Create event
const { data, error } = await supabase
  .from('events')
  .insert({ title, description, ... })
  .select()
  .single();
```

#### Registration API
```typescript
// Register for event
const { data } = await supabase
  .from('registrations')
  .insert({
    event_id,
    user_id,
    is_team,
    team_size,
  })
  .select()
  .single();
```

#### Team API
```typescript
// Create team with members
const { data: team } = await supabase
  .from('teams')
  .insert({ name, event_id, registration_id })
  .select()
  .single();

const { data: members } = await supabase
  .from('team_members')
  .insert(memberArray);
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Event creation and publishing
- [ ] Individual registration flow
- [ ] Team registration flow
- [ ] Payment processing
- [ ] Ticket generation
- [ ] QR code functionality
- [ ] Admin dashboard operations
- [ ] Mobile responsiveness
- [ ] Dark mode functionality

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` (optional)

4. **Deploy**
   Vercel will automatically build and deploy your application

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📖 Usage Guide

### For Event Organizers

1. **Create an Event**
   - Navigate to Dashboard → Create Event
   - Fill in event details
   - Upload images or use Unsplash
   - Set pricing tiers
   - Configure team settings
   - Publish when ready

2. **Manage Registrations**
   - View all registrations in Dashboard
   - Track payment status
   - Export attendee list
   - Send notifications

3. **Monitor Analytics**
   - View registration statistics
   - Track revenue
   - Monitor team formations

### For Attendees

1. **Browse Events**
   - Explore upcoming events
   - Filter by category
   - Search by keywords

2. **Register**
   - Choose individual or team registration
   - Fill in required details
   - Complete payment
   - Receive confirmation

3. **View Ticket**
   - Access ticket from dashboard
   - Download QR code
   - Share with team members

### For Administrators

1. **Access Admin Dashboard**
   - Login with admin credentials
   - Navigate to `/admin/login`

2. **Manage System**
   - Monitor all events and users
   - Manage colleges and categories
   - View all registrations and payments
   - Handle support tickets

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent formatting

---

## 🐛 Bug Reports

If you discover a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment details

---

## 💡 Feature Requests

We'd love to hear your ideas! Create an issue with:
- Feature description
- Use case and benefits
- Proposed implementation (optional)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Developer

Designed & Developed by **Sachin S**

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon Library
- [Unsplash](https://unsplash.com/) - Free Images

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/nihcastics/festify/wiki)
- **Issues**: [GitHub Issues](https://github.com/nihcastics/festify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nihcastics/festify/discussions)

---

## 🗺️ Roadmap

### v2.0 (Planned)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Analytics dashboard
- [ ] Event calendar view
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Social media sharing
- [ ] Event feedback system

### v2.1 (Future)
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API webhooks
- [ ] Third-party integrations
- [ ] AI-powered recommendations

---

<div align="center">

**Made with ❤️ for the education community**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/nihcastics/festify/issues) · [Request Feature](https://github.com/nihcastics/festify/issues)

</div>
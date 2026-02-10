# IdeaSpark AI 💡

IdeaSpark AI is a professional innovation engine that transforms raw product thoughts into technical blueprints. Built with React, TypeScript, and powered by Google Gemini AI, it helps entrepreneurs and developers validate ideas, discover competitors, and generate comprehensive Software Requirements Specifications (SRS) documents.

## 🎯 What It Does

IdeaSpark AI guides you through a complete product validation workflow:

1. **Capture Your Vision** - Input your raw product idea and initial features
2. **Market Analysis** - AI searches for competitors and similar projects, providing similarity scores and market insights
3. **Idea Evolution** - Receive AI-powered improvement suggestions based on competitor analysis
4. **Technical Blueprint** - Generate a professional, editable SRS document ready for development

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- (Optional) A Supabase account for cloud persistence and authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ideaSparkAI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url (optional)
SUPABASE_ANON_KEY=your_supabase_anon_key (optional)
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## ☁️ Cloud Setup (Supabase) - Optional

To enable persistent data storage and authentication, follow these steps:

### 1. Database Schema

Run the following SQL in your Supabase SQL Editor to create the necessary table and security policies:

```sql
create table public.ideas (
  id text primary key,
  user_id uuid references auth.users not null default auth.uid(),
  title text not null,
  raw_idea text,
  problem text,
  solution text,
  features jsonb default '[]'::jsonb,
  status text default 'draft',
  analysis jsonb,
  improvements jsonb,
  accepted_improvements jsonb default '[]'::jsonb,
  srs text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ideas enable row level security;

create policy "Users can CRUD their own ideas" on public.ideas
  for all using (auth.uid() = user_id);
```

### 2. Social Login Configuration

In the Supabase Dashboard, go to **Authentication -> Providers**:
- **GitHub**: Create a GitHub OAuth App and paste the Client ID and Secret
- **Google**: Create credentials in Google Cloud Console and paste the Client ID and Secret
- **Redirect URI**: Use the one provided in the Supabase Dashboard

### 3. Environment Variables

Add to your `.env` file:
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

**Note**: Without Supabase configuration, the app will use LocalStorage for data persistence (data is stored locally in your browser).

## ✨ Key Features

- **AI-Powered Analysis**: Uses Google Gemini 3 Pro to analyze product ideas and discover competitors
- **Market Intelligence**: Automatically finds similar products, SaaS solutions, and GitHub repositories
- **Smart Suggestions**: Receives improvement recommendations based on competitor weaknesses and market gaps
- **SRS Generation**: Creates comprehensive Software Requirements Specification documents with structured sections
- **Cloud Persistence**: Optional Supabase integration for secure, multi-device access
- **Authentication**: Secure login via GitHub, Google, or Email (when Supabase is configured)
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Export Capabilities**: Download SRS documents as Markdown files

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini 3 (Pro & Flash models)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Project Structure

```
ideasparkAI/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── IdeaDetail.tsx   # Detailed idea view with analysis
│   ├── IdeaForm.tsx     # Form for creating new ideas
│   ├── LandingPage.tsx  # Landing page
│   └── LoginPage.tsx    # Authentication page
├── services/            # API services
│   ├── geminiService.ts # Gemini AI integration
│   └── supabaseClient.ts # Supabase client setup
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
└── vite.config.ts       # Vite configuration
```

## 🔄 Workflow

1. **Create Idea**: Enter your product concept and initial features
2. **Run Analysis**: AI extracts problem/solution and finds competitors with similarity scores
3. **Review Competitors**: See detailed competitor analysis with visual charts
4. **Accept Improvements**: Select AI-suggested features to enhance your product
5. **Generate SRS**: Create a full technical specification document
6. **Export & Share**: Download your SRS as a Markdown file

## 🎨 Status States

Each idea progresses through these states:
- **DRAFT**: Initial idea created
- **ANALYZED**: Market analysis completed
- **IMPROVED**: Improvement suggestions generated
- **SRS_READY**: Technical specification document generated

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project. Contributions are not currently being accepted.

---

**Built with ❤️ using React, TypeScript, and Google Gemini AI**

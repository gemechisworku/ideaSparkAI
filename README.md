# IdeaSpark AI 💡

IdeaSpark AI is a professional innovation engine that transforms raw product thoughts into technical blueprints. Built with React, TypeScript, and powered by OpenAI (GPT-4o + o3-mini), it helps entrepreneurs and developers validate ideas, discover competitors with **live web search**, and generate comprehensive Software Requirements Specifications (SRS) documents.

## 🎯 What It Does

IdeaSpark AI guides you through a complete product validation workflow:

1. **Capture Your Vision** - Input your raw product idea and initial features
2. **Market Analysis** - AI searches for competitors and similar projects, providing similarity scores and market insights
3. **Idea Evolution** - Receive AI-powered improvement suggestions based on competitor analysis
4. **Technical Blueprint** - Generate a professional, editable SRS document ready for development

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
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
OPENAI_API_KEY=your_openai_api_key_here
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

## 🚀 Deployment to Vercel

IdeaSpark AI is ready to deploy to Vercel with zero configuration changes. Follow these steps:

### Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- Your project pushed to GitHub, GitLab, or Bitbucket

### Deployment Steps

1. **Push your code to a Git repository** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import your project to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Vite and use the `vercel.json` configuration

3. **Configure Environment Variables**:
   In the Vercel project settings, add these environment variables:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   **Important**: 
   - Never commit your `.env` file to Git
   - Add `.env` to your `.gitignore` file
   - Set these in Vercel Dashboard → Settings → Environment Variables

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app automatically
   - Your app will be live at `https://your-project.vercel.app`

### Post-Deployment

- **Custom Domain** (optional): Add your domain in Vercel Dashboard → Settings → Domains
- **Automatic Deployments**: Every push to your main branch triggers a new deployment
- **Preview Deployments**: Pull requests get their own preview URLs automatically

### Troubleshooting

- **Build fails**: Check that all environment variables are set in Vercel
- **API errors**: Verify `OPENAI_API_KEY` is correctly set (starts with `sk-`)
- **404 on refresh**: The `vercel.json` rewrites rule handles this automatically

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

- **AI-Powered Analysis**: Uses OpenAI GPT-4o with **live web search** to analyze product ideas and discover real competitors
- **Market Intelligence**: Searches the live web for similar products, SaaS solutions, and GitHub repositories with real URLs
- **Smart Suggestions**: Receives improvement recommendations based on competitor weaknesses and market gaps
- **Deep Reasoning SRS**: Creates comprehensive SRS documents using o3-mini with high reasoning effort
- **Cloud Persistence**: Optional Supabase integration for secure, multi-device access
- **Authentication**: Secure login via GitHub, Google, or Email (when Supabase is configured)
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Export Capabilities**: Download SRS documents as Markdown files

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **AI**: OpenAI (GPT-4o with web search, GPT-4o-mini, o3-mini with reasoning)
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
│   ├── openaiService.ts # OpenAI integration (web search + structured output)
│   └── supabaseClient.ts # Supabase client setup
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
└── vite.config.ts       # Vite configuration
```

## 🔄 Workflow

1. **Create Idea**: Enter your product concept and initial features
2. **Run Analysis**: AI searches the live web, extracts problem/solution, and finds real competitors with similarity scores
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

**Built with ❤️ using React, TypeScript, and OpenAI**

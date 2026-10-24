# HalkaPic 📸

> **“Make Your Photos Lighter, Instantly.”**

HalkaPic is a free, high-performance, mobile-first online image compressor that reduces photo file size from **MB to KB** directly inside the user's browser.

## 🌟 Key Features

- **100% In-Browser & Private**: Photos never touch a server. Processed locally via HTML5 Canvas and Blob APIs.
- **Smart Iterative Compression**: Employs binary search to find the optimal balance between visual quality and exact target KB.
- **Target Presets & Custom Size**:
  - `20 KB`: Govt exams, SSC, UPSC application forms
  - `50 KB`: Passport and visa uploads
  - `100 KB`: Job portals and resumes
  - `200 KB`: Email and web sharing
  - `500 KB`: High-detail photos
  - **Custom KB**: Type any target size (e.g. 75 KB, 150 KB, 300 KB) with instant input validation.
- **Transparent PNG Support**: Preserves alpha channel using lossy WebP or clean white blending, eliminating unwanted black backgrounds.
- **Interactive Before / After Comparison**: Draggable split-slider and side-by-side modes to verify visual clarity before downloading.
- **Sensible Naming**: Compressed files are downloaded with clean, descriptive filenames (e.g., `halkapic-photo-50kb.jpg`).
- **Zero Friction**: No login, no signup, no database, no payments, no ads.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### Installation & Development
```bash
# Install dependencies
pnpm install

# Start local development server
pnpm run dev
```

### Production Build
```bash
# Build optimized bundle
pnpm run build

# Preview production build locally
pnpm run preview
```

### Automated End-to-End Testing
```bash
node scripts/test-e2e.js
```

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Bundler**: Vite 8
- **Icons**: Lucide React
- **Confetti**: Canvas Confetti

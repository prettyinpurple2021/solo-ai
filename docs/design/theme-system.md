# SoloBoss AI Design System & Theme Guide

## Based on Custom tweakcn Theme

## 📋 Overview

This document defines the complete design system for SoloBoss AI based on the custom theme created on [tweakcn.com](https://tweakcn.com/themes/cmdp1bpnl000204jt0acm4hc8). This theme provides a cohesive visual identity that aligns with our brand values of ambition, creativity, and empowerment through the signature purple-to-pink gradient aesthetic.

---

## 🎨 Color Palette

### Primary Brand Colors

Based on the theme, our color system uses a sophisticated purple-to-pink gradient approach:

```css
/* Primary Purple-Pink Gradient */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
--gradient-secondary: linear-gradient(135deg, #A855F7 0%, #F472B6 100%);

/* Core Brand Colors */
--purple-primary: #8B5CF6;    /* Primary purple */
--purple-light: #A855F7;      /* Lighter purple variant */
--pink-primary: #EC4899;      /* Primary pink */
--pink-light: #F472B6;        /* Lighter pink variant */
```

### Neutral Color System

```css
/* Background Colors */
--background: hsl(0 0% 100%);           /* White background */
--background-secondary: hsl(210 40% 98%); /* Light gray background */

/* Text Colors */
--foreground: hsl(222.2 84% 4.9%);      /* Primary text */
--muted-foreground: hsl(215.4 16.3% 46.9%); /* Secondary text */

/* Border Colors */
--border: hsl(214.3 31.8% 91.4%);       /* Light borders */
--input: hsl(214.3 31.8% 91.4%);        /* Input borders */

/* UI Element Colors */
--card: hsl(0 0% 100%);                 /* Card backgrounds */
--popover: hsl(0 0% 100%);              /* Popover backgrounds */
--muted: hsl(210 40% 98%);              /* Muted backgrounds */
```

### Status Colors

```css
/* Success States */
--success: hsl(142.1 76.2% 36.3%);      /* Green for success */
--success-foreground: hsl(355.7 100% 97.3%);

/* Warning States */
--warning: hsl(45.4 93.4% 47.5%);       /* Yellow for warnings */
--warning-foreground: hsl(26 83.3% 14.1%);

/* Error States */
--destructive: hsl(0 84.2% 60.2%);      /* Red for errors */
--destructive-foreground: hsl(210 40% 98%);

/* Info States */
--info: var(--purple-primary);          /* Purple for info */
--info-foreground: hsl(210 40% 98%);
```

---

## 🧩 Component Design Patterns

### Cards & Containers

Based on the theme's dashboard layout:

```css
/* Card Styling */
.card {
  @apply bg-card text-card-foreground rounded-lg border shadow-sm;
}

/* Dashboard Cards with Gradient Accents */
.card-dashboard {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm;
  @apply hover:shadow-md transition-shadow duration-200;
}

/* Revenue/Metrics Cards */
.card-metric {
  @apply p-6 bg-white rounded-xl border border-gray-200;
  @apply relative overflow-hidden;
}

.card-metric::before {
  content: '';
  @apply absolute top-0 left-0 w-full h-1;
  background: var(--gradient-primary);
}
```

### Buttons & Interactive Elements

Following the theme's button patterns:

```css
/* Primary Button with Gradient */
.btn-primary {
  @apply px-4 py-2 rounded-md font-medium text-white;
  background: var(--gradient-primary);
  @apply hover:opacity-90 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2;
  @apply transition-all duration-200;
}

/* Secondary Button */
.btn-secondary {
  @apply px-4 py-2 rounded-md font-medium;
  @apply bg-gray-100 text-gray-900 hover:bg-gray-200;
  @apply border border-gray-300 focus:ring-2 focus:ring-purple-500;
}

/* Ghost Button */
.btn-ghost {
  @apply px-4 py-2 rounded-md font-medium;
  @apply text-gray-700 hover:bg-gray-100 hover:text-gray-900;
}
```

### Form Elements

Based on the theme's form styling:

```css
/* Input Fields */
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500;
  @apply placeholder:text-gray-400 text-sm;
}

/* Select Dropdowns */
.select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500;
  @apply bg-white text-sm;
}

/* Textarea */
.textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:ring-2 focus:ring-purple-500 focus:border-purple-500;
  @apply resize-vertical min-h-[80px];
}
```

---

## 📱 Layout Patterns

### Dashboard Layout

Based on the tweakcn theme structure:

```tsx
// Main Dashboard Grid
<div className="p-6 space-y-6">
  {/* Header Section */}
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <Button className="btn-primary">Add New</Button>
  </div>
  
  {/* Metrics Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <MetricCard title="Total Revenue" value="$15,231.89" change="+20.1%" />
    <MetricCard title="Subscriptions" value="+2,350" change="+180.1%" />
    {/* Additional metrics */}
  </div>
  
  {/* Main Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      {/* Primary content */}
    </div>
    <div>
      {/* Sidebar content */}
    </div>
  </div>
</div>
```

### Card Component Structure

```tsx
// Dashboard Metric Card
function MetricCard({ title, value, change, trend = "up" }) {
  return (
    <div className="card-metric">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <TrendIcon trend={trend} />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change} from last month
        </p>
      </div>
    </div>
  );
}
```

---

## 🎯 Typography System

### Font Hierarchy

Based on the theme's text styling:

```css
/* Headings */
.h1 { @apply text-3xl font-bold tracking-tight text-gray-900; }
.h2 { @apply text-2xl font-bold tracking-tight text-gray-900; }
.h3 { @apply text-xl font-semibold text-gray-900; }
.h4 { @apply text-lg font-semibold text-gray-900; }

/* Body Text */
.text-body { @apply text-sm text-gray-700 leading-relaxed; }
.text-small { @apply text-xs text-gray-600; }
.text-large { @apply text-base text-gray-700; }

/* Special Text */
.text-muted { @apply text-sm text-gray-500; }
.text-accent { 
  background: var(--gradient-primary);
  @apply bg-clip-text text-transparent font-semibold;
}
```

### Text Styling Guidelines

- **Headers**: Use bold weights for hierarchy
- **Body text**: Medium gray for readability
- **Muted text**: Light gray for secondary information
- **Accent text**: Purple-pink gradient for highlights
- **Links**: Purple color with hover states

---

## 🎨 AI Agent Personality Styling

### Individual Agent Themes

Each AI agent should have subtle visual variations while maintaining brand consistency:

```css
/* Roxy (Executive Assistant) - Organized Blue-Purple */
.agent-roxy { --agent-accent: #6366F1; }

/* Blaze (Growth Strategist) - Energetic Orange-Red */
.agent-blaze { --agent-accent: #F59E0B; }

/* Echo (Marketing Maven) - Creative Pink */
.agent-echo { --agent-accent: #EC4899; }

/* Lumi (Legal & Docs) - Professional Blue */
.agent-lumi { --agent-accent: #3B82F6; }

/* Vex (Technical Architect) - Tech Green */
.agent-vex { --agent-accent: #10B981; }

/* Lexi (Strategy Analyst) - Analytical Purple */
.agent-lexi { --agent-accent: #8B5CF6; }

/* Nova (Product Designer) - Creative Teal */
.agent-nova { --agent-accent: #06B6D4; }

/* Glitch (QA & Debug) - Alert Red */
.agent-glitch { --agent-accent: #EF4444; }
```

---

## 📊 Dashboard Widgets

### Widget Base Styling

```css
.widget {
  @apply bg-white rounded-xl border border-gray-200 p-6;
  @apply shadow-sm hover:shadow-md transition-shadow duration-200;
}

.widget-header {
  @apply flex items-center justify-between mb-4;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.widget-content {
  @apply space-y-4;
}
```

### Specific Widget Types

Based on the theme's dashboard components:

```tsx
// Revenue Widget (from theme)
function RevenueWidget() {
  return (
    <div className="widget">
      <div className="widget-header">
        <h3 className="widget-title">Total Revenue</h3>
        <DollarSign className="h-4 w-4 text-gray-400" />
      </div>
      <div className="widget-content">
        <div className="text-2xl font-bold">$15,231.89</div>
        <p className="text-xs text-green-600">
          +20.1% from last month
        </p>
      </div>
    </div>
  );
}

// Calendar Widget (from theme)
function CalendarWidget() {
  return (
    <div className="widget">
      <Calendar 
        mode="single"
        className="rounded-md border-0"
      />
    </div>
  );
}
```

---

## 🔄 Interactive States

### Hover Effects

```css
/* Card Hover States */
.card-interactive {
  @apply transition-all duration-200 cursor-pointer;
  @apply hover:shadow-lg hover:-translate-y-1;
}

/* Button Hover States */
.btn-primary:hover {
  @apply opacity-90 scale-105;
}

/* Input Focus States */
.input:focus {
  @apply ring-2 ring-purple-500 border-purple-500;
  @apply shadow-sm;
}
```

### Loading States

```css
/* Skeleton Loading */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

/* Spinner */
.spinner {
  @apply animate-spin rounded-full border-2 border-gray-300 border-t-purple-600;
}
```

---

## 🎪 Animations & Transitions

### Page Transitions

```css
/* Page Enter Animation */
.page-enter {
  @apply opacity-0 translate-y-4;
  animation: pageEnter 0.3s ease-out forwards;
}

@keyframes pageEnter {
  to {
    @apply opacity-100 translate-y-0;
  }
}

/* Modal Animations */
.modal-overlay {
  @apply opacity-0;
  animation: fadeIn 0.2s ease-out forwards;
}

.modal-content {
  @apply opacity-0 scale-95;
  animation: modalEnter 0.3s ease-out forwards;
}
```

---

## 📱 Responsive Design

### Breakpoint System

```css
/* Tailwind CSS Breakpoints */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

/* Mobile-First Approach */
.dashboard-grid {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2 md:gap-6;
  @apply lg:grid-cols-3 lg:gap-8;
  @apply xl:grid-cols-4;
}
```

### Mobile Optimizations

```css
/* Mobile Navigation */
.mobile-nav {
  @apply fixed bottom-0 left-0 right-0 bg-white border-t;
  @apply flex items-center justify-around p-4;
  @apply lg:hidden;
}

/* Mobile Card Adjustments */
@screen max-md {
  .card-metric {
    @apply p-4;
  }
  
  .widget {
    @apply p-4;
  }
}
```

---

## 🛠️ Implementation Guide

### Tailwind CSS Configuration

Add to your `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        soloboss: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          'purple-light': '#A855F7',
          'pink-light': '#F472B6',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      backgroundImage: {
        'gradient-soloboss': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gradient-soloboss-light': 'linear-gradient(135deg, #A855F7 0%, #F472B6 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### CSS Custom Properties

Add to your global CSS:

```css
:root {
  --gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  --gradient-secondary: linear-gradient(135deg, #A855F7 0%, #F472B6 100%);
  
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
}
```

---

## 🎯 Usage in Development

### Phase 1 Implementation (Sprint 1)

This theme system directly supports your todo list items:

1. **1.4: Design System & UI Foundation**
   - ✅ Tailwind CSS configuration ready
   - ✅ Component patterns defined
   - ✅ Color system established
   - ✅ Typography hierarchy set

2. **1.5: Build Core App Layout**
   - ✅ Dashboard layout patterns ready
   - ✅ Navigation structure defined
   - ✅ Responsive design guidelines set

### Integration with Radix UI

Your theme works perfectly with Radix UI primitives:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function DashboardExample() {
  return (
    <Card className="card-dashboard">
      <CardHeader>
        <CardTitle className="text-soloboss-purple">SoloBoss AI</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="bg-gradient-soloboss text-white">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

**This design system provides a complete foundation for building SoloBoss AI with consistent, beautiful, and user-friendly interfaces that match your brand identity.**

*Theme documentation based on: <https://tweakcn.com/themes/cmdp1bpnl000204jt0acm4hc8>*  
*Last updated: January 2025*

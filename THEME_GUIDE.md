# Dark Theme Usage Guide

## DeFi Portfolio Manager Dark Theme System

This application uses a comprehensive dark theme system with CSS variables, custom fonts, and utility classes based on your specified color palette.

### Color Palette & Dark Theme Implementation

```css
/* Original Palette */
--color-black: #000000
--color-purple-primary: #7d12ff   /* Main brand color */
--color-purple-secondary: #ab20fd  /* Secondary brand color */
--color-dark-blue: #200589        /* Accent color */
--color-light: #fbf8fd

/* Dark Theme Colors */
--color-background: #0a0a0a       /* Dark background */
--color-surface: #1a1a1a          /* Card/component surfaces */
--color-surface-elevated: #262626 /* Elevated elements */
--color-text: #f8fafc             /* Primary text */
--color-text-secondary: #cbd5e1   /* Secondary text */
--color-text-muted: #94a3b8       /* Muted text */
```

### Custom Fonts

The theme integrates two custom font families:

- **Aeonik**: Used for headings, titles, and emphasis text
- **Input Sans**: Used for body text, UI elements, and general content

```css
--font-heading: 'Aeonik'
--font-body: 'Input Sans'
```

### Usage Examples

#### Using CSS Variables in Components

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-purple);
}
```

#### Using Utility Classes

```jsx
<div className="bg-primary text-inverse">
  <h2 className="text-secondary">Portfolio Value</h2>
  <p className="text-muted">Last updated 2 minutes ago</p>
</div>
```

#### Using Theme in JavaScript

```jsx
import { theme, getColor, getSpacing } from '../utils/theme';

const MyComponent = () => {
  const styles = {
    backgroundColor: getColor('primary'),
    padding: getSpacing('lg'),
    borderRadius: theme.borderRadius.md,
  };
  
  return <div style={styles}>Content</div>;
};
```

### Available Components

#### Button Variants
- `btn-primary` - Main purple gradient button
- `btn-secondary` - Secondary purple button  
- `btn-accent` - Dark blue button
- `btn-outline` - Transparent with colored border
- `btn-ghost` - Minimal transparent button
- `btn-success` - Green success button
- `btn-warning` - Orange warning button
- `btn-error` - Red error button

#### Button Sizes
- `btn-sm` - Small button (32px height)
- `btn-md` - Default button (40px height)
- `btn-lg` - Large button (48px height)

#### Badge Variants
- `badge-primary` - Purple badge
- `badge-secondary` - Light purple badge
- `badge-success` - Green badge
- `badge-warning` - Orange badge
- `badge-error` - Red badge
- `badge-neutral` - Gray badge

#### Card Components
- `.card` - Basic card with shadow and border
- `.card-header` - Card header section
- `.card-content` - Card content area

### Best Practices

1. **Consistency**: Always use CSS variables instead of hard-coded colors
2. **Semantic Names**: Use semantic color names (primary, secondary) rather than specific colors
3. **Spacing**: Use the spacing scale variables for consistent padding and margins
4. **Hover States**: All interactive elements should have hover states defined
5. **Accessibility**: Ensure sufficient color contrast for text readability

### Responsive Design

The theme includes responsive utilities and breakpoints:
- Mobile-first approach
- Flexible grid system for dashboard components
- Touch-friendly button sizes on mobile devices

### Dark Theme Features

- **Deep dark backgrounds** with subtle elevation layers
- **Purple gradients** maintained for brand consistency  
- **Enhanced shadows** with purple glows for interactive elements
- **Custom font integration** with proper font loading and fallbacks
- **High contrast text** for optimal readability
- **Consistent hover states** with smooth animations
- **Elevated surfaces** for visual hierarchy

### Font Usage Examples

```jsx
// Headings automatically use Aeonik
<h1>Portfolio Dashboard</h1>

// Body text uses Input Sans
<p>Your portfolio performance...</p>

// Explicit font usage in CSS
.custom-title {
  font-family: var(--font-heading);
  font-weight: 700;
}

.custom-body {
  font-family: var(--font-body);
  font-weight: 400;
}
```
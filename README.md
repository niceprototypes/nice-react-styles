# nice-react-styles

React provider component for [nice-styles](https://github.com/niceprototypes/nice-styles) CSS variables.

## Installation

```bash
npm install nice-styles nice-react-styles
```

Both packages are required: `nice-styles` provides the CSS variables, and `nice-react-styles` provides the React wrapper component.

## Usage

Wrap your application (or any part of your component tree) with the `StylesProvider` component:

```tsx
import { StylesProvider } from 'nice-react-styles'

function App() {
  return (
    <StylesProvider>
      <YourComponents />
    </StylesProvider>
  )
}
```

### Using CSS Variables

Once wrapped with `StylesProvider`, all child components can reference nice-styles CSS variables:

```tsx
function MyComponent() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background-color-base)',
        color: 'var(--content-color-base)',
        padding: 'var(--gap-size-medium)',
        borderRadius: 'var(--border-radius-base)',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      Hello World
    </div>
  )
}
```

Or in CSS/styled-components:

```css
.my-component {
  background-color: var(--background-color-base);
  color: var(--content-color-base);
  padding: var(--gap-size-medium);
  border-radius: var(--border-radius-base);
  font-family: var(--font-family-base);
}
```

### Custom Styling

You can pass additional props to customize the provider wrapper:

```tsx
<StylesProvider
  className="custom-class"
  style={{
    '--custom-variable': 'value',
    padding: '20px'
  }}
>
  <YourComponents />
</StylesProvider>
```

## API

### `StylesProvider`

A wrapper component that ensures nice-styles CSS variables are available in the component tree.

#### Props

- `children: ReactNode` - Child components that will have access to CSS variables
- `className?: string` - Optional className to apply to the wrapper div
- `style?: React.CSSProperties` - Optional style object for custom CSS variable overrides

## Why Separate Packages?

Following the pattern of Tailwind CSS + Headless UI:
- **nice-styles**: Pure CSS package, framework-agnostic, zero dependencies
- **nice-react-styles**: React-specific wrapper for enhanced DX

This keeps the CSS layer lightweight and usable with any framework (Vue, Angular, Svelte, etc.), while providing React users with an ergonomic component-based API.

## Available CSS Variables

See the [nice-styles documentation](https://github.com/niceprototypes/nice-styles#available-variables) for the complete list of available CSS variables.

## License

MIT
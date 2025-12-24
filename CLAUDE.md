# Trailblazer+ React Native

BC Parks outdoor activity tracking app built with Expo, HeroUI Native, and Uniwind.

## Tech Stack

- **Framework**: Expo 54 with Expo Router
- **Styling**: Uniwind (Tailwind CSS v4 for React Native)
- **Components**: HeroUI Native
- **Language**: TypeScript (strict mode)

## Commands

```bash
npx expo start          # Start dev server
npx tsc --noEmit        # Type check (run before committing)
npx expo export         # Build for production
```

## Project Structure

```
app/                    # Expo Router pages
├── _layout.tsx         # Root layout (providers)
├── (tabs)/             # Bottom tab navigation
└── (modals)/           # Modal screens
components/             # Reusable components
contexts/               # React contexts
lib/                    # Utilities and data
```

## Code Standards

### TypeScript

- Never use `any` - use `unknown`, generics, or proper types
- All function parameters and return types must be typed
- Use type inference where obvious, explicit types where it aids clarity
- Prefer `interface` for object shapes, `type` for unions/intersections

### Code Quality

- No unnecessary comments - code should be self-documenting
- No redundant comments like `// increment counter` above `counter++`
- Only comment complex business logic or non-obvious decisions
- DRY: Extract repeated logic into functions/hooks/components
- Single responsibility: One component/function does one thing
- Avoid premature abstraction - wait for 3+ repetitions before extracting

### Styling (Uniwind)

- Use `className` prop with Tailwind classes for styling
- Avoid inline `style` objects unless dynamic values are needed
- Use HeroUI Native components before creating custom ones

### Architecture

- Route-based modals: Use `router.push('/(modals)/...')` not context-based modals
- Dynamic routes for detail screens: `[id].tsx` pattern
- Keep navigation state in URLs, app state in contexts
- Colocate related code: component + types + utils in same directory

## Provider Hierarchy

Order matters - outermost to innermost:

1. `GestureHandlerRootView` (required for gestures)
2. `HeroUINativeProvider` (HeroUI theming)
3. `ThemeProvider` (React Navigation theming)

## Uniwind Setup Notes

- `global.css` must import in order: `tailwindcss`, `uniwind`, `heroui-native/styles`
- `@source` directive required for HeroUI: `@source './node_modules/heroui-native/lib'`
- Metro config: `withUniwindConfig` must be outermost wrapper
- Types auto-generated to `uniwind-types.d.ts` on first build

## HeroUI Native Components

Available: Button, TextField, Select, Checkbox, Radio, Switch, Avatar, Chip, Skeleton, Spinner, Card, Divider, Dialog, Popover, Toast, Accordion, Tabs, Surface

Import from: `import { Button, Card } from 'heroui-native'`

## Document updates

Anytime you update a folder (like components, db, functions, lib, etc.) make sure to update the `CLAUDE.md` file within that folder so that all subsequent Claude code sessions has the most up-to-date context on what is going on with the app.

## Anti-Patterns to Avoid

- Don't use `any` type
- Don't write obvious comments
- Don't create abstractions for single-use code
- Don't mix StyleSheet and className on same element
- Don't use context for modal state (use routes)
- Don't skip type checking before commits

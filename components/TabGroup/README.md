# TabGroup Component

A fully customizable, accessible tab component built from scratch with no external dependencies (Radix removed).

## Features

✨ **7 Variants** - Multiple styles to match your design needs  
📏 **3 Sizes** - Small, medium, and large options  
🎨 **Smooth Animations** - Beautiful animated indicator  
⌨️ **Keyboard Navigation** - Full arrow key, Home, and End support  
♿ **Accessible** - Complete ARIA support and focus management  
🎛️ **Controlled/Uncontrolled** - Works both ways  
🎯 **Icons & Badges** - Rich content support  
🚫 **Disabled States** - Proper disabled tab handling  
📱 **Responsive** - Full width option for mobile

## Installation

The component is already part of your component library. No additional installation needed.

```tsx
import { TabGroup, TabPanel } from "@/components/TabGroup"
```

## Basic Usage

### Simple Tabs

```tsx
<TabGroup
  tabs={[
    { value: "tab1", label: "First Tab" },
    { value: "tab2", label: "Second Tab" },
    { value: "tab3", label: "Third Tab" },
  ]}
/>
```

### With Content Panels

```tsx
const [activeTab, setActiveTab] = useState("tab1")

return (
  <>
    <TabGroup tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

    <TabPanel value="tab1" activeValue={activeTab}>
      <div>Content for Tab 1</div>
    </TabPanel>

    <TabPanel value="tab2" activeValue={activeTab}>
      <div>Content for Tab 2</div>
    </TabPanel>
  </>
)
```

## Variants

### 1. Default

Classic tabs with bottom border indicator.

```tsx
<TabGroup tabs={tabs} variant="default" />
```

### 2. Pills

Rounded tabs with background highlight.

```tsx
<TabGroup tabs={tabs} variant="pills" />
```

### 3. Underline

Minimal tabs with simple underline.

```tsx
<TabGroup tabs={tabs} variant="underline" />
```

### 4. Enclosed

Tabs enclosed in a bordered container.

```tsx
<TabGroup tabs={tabs} variant="enclosed" />
```

### 5. Solid

Pills variant with solid background.

```tsx
<TabGroup tabs={tabs} variant="solid" />
```

### 6. Buttons

Tab styled as individual buttons.

```tsx
<TabGroup tabs={tabs} variant="buttons" />
```

### 7. Minimal

Clean, minimal style with subtle indicator.

```tsx
<TabGroup tabs={tabs} variant="minimal" />
```

## Sizes

```tsx
<TabGroup tabs={tabs} size="sm" />   // Small
<TabGroup tabs={tabs} size="md" />   // Medium (default)
<TabGroup tabs={tabs} size="lg" />   // Large
```

## Advanced Features

### With Icons

```tsx
<TabGroup
  tabs={[
    {
      value: "users",
      label: "Users",
      icon: <UserIcon />,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <SettingsIcon />,
    },
  ]}
  variant="pills"
/>
```

### With Badges

```tsx
<TabGroup
  tabs={[
    { value: "all", label: "All", badge: 24 },
    { value: "unread", label: "Unread", badge: 5 },
    { value: "archived", label: "Archived", badge: 0 },
  ]}
  variant="pills"
/>
```

### With Disabled Tabs

```tsx
<TabGroup
  tabs={[
    { value: "tab1", label: "Active" },
    { value: "tab2", label: "Disabled", disabled: true },
    { value: "tab3", label: "Active" },
  ]}
/>
```

### Full Width

```tsx
<TabGroup tabs={tabs} variant="enclosed" fullWidth />
```

### Without Animation

```tsx
<TabGroup tabs={tabs} animated={false} />
```

### Controlled Mode

```tsx
const [currentTab, setCurrentTab] = useState("tab1")

return <TabGroup tabs={tabs} value={currentTab} onValueChange={setCurrentTab} />
```

## API Reference

### TabGroup Props

| Prop            | Type                                                                                     | Default     | Description                        |
| --------------- | ---------------------------------------------------------------------------------------- | ----------- | ---------------------------------- |
| `tabs`          | `Tab[]`                                                                                  | required    | Array of tab objects               |
| `defaultValue`  | `string`                                                                                 | First tab   | Initial active tab (uncontrolled)  |
| `value`         | `string`                                                                                 | -           | Current active tab (controlled)    |
| `onValueChange` | `(value: string) => void`                                                                | -           | Callback when tab changes          |
| `variant`       | `"default" \| "pills" \| "underline" \| "enclosed" \| "solid" \| "buttons" \| "minimal"` | `"default"` | Visual style variant               |
| `size`          | `"sm" \| "md" \| "lg"`                                                                   | `"md"`      | Size of the tabs                   |
| `fullWidth`     | `boolean`                                                                                | `false`     | Whether tabs take full width       |
| `animated`      | `boolean`                                                                                | `true`      | Enable/disable indicator animation |
| `className`     | `string`                                                                                 | -           | Additional CSS classes             |

### Tab Object

| Property   | Type               | Required | Description                   |
| ---------- | ------------------ | -------- | ----------------------------- |
| `value`    | `string`           | ✓        | Unique identifier for the tab |
| `label`    | `string`           | ✓        | Display text for the tab      |
| `icon`     | `React.ReactNode`  | -        | Icon to display before label  |
| `badge`    | `string \| number` | -        | Badge to display after label  |
| `disabled` | `boolean`          | -        | Whether the tab is disabled   |

### TabPanel Props

| Prop          | Type              | Required | Description                |
| ------------- | ----------------- | -------- | -------------------------- |
| `value`       | `string`          | ✓        | Value matching the tab     |
| `activeValue` | `string`          | ✓        | Currently active tab value |
| `children`    | `React.ReactNode` | ✓        | Content to display         |
| `className`   | `string`          | -        | Additional CSS classes     |

## Keyboard Navigation

- `Arrow Left/Right` - Navigate between tabs
- `Home` - Jump to first tab
- `End` - Jump to last tab
- `Tab` - Move focus in/out of tab group
- `Enter/Space` - Activate focused tab (native button behavior)

## Accessibility

The component follows WAI-ARIA best practices:

- Proper `role="tablist"` and `role="tab"` attributes
- `aria-selected` to indicate active tab
- `aria-controls` linking tabs to panels
- `aria-disabled` for disabled tabs
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Styling

The component uses Tailwind CSS and integrates with your design system. All variants follow the Apple-inspired design tokens defined in your project.

### Customization

You can customize the component by:

1. **Using className prop** - Add custom classes
2. **Modifying design tokens** - Update colors in your design system
3. **Extending variants** - Add new variants in the component file

```tsx
<TabGroup tabs={tabs} className="my-custom-class" />
```

## Migration from Radix

If you were using the old Radix-based component, the migration is simple:

### Before (Radix)

```tsx
import * as Tabs from "@radix-ui/react-tabs"
;<Tabs.Root>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs.Root>
```

### After (Custom)

```tsx
import { TabGroup, TabPanel } from "@/components/TabGroup"

const [tab, setTab] = useState("tab1")

<TabGroup
  tabs={[
    { value: "tab1", label: "Tab 1" },
    { value: "tab2", label: "Tab 2" },
  ]}
  value={tab}
  onValueChange={setTab}
/>
<TabPanel value="tab1" activeValue={tab}>Content 1</TabPanel>
<TabPanel value="tab2" activeValue={tab}>Content 2</TabPanel>
```

## Examples

Check out the Storybook for interactive examples:

```bash
npm run storybook
```

Navigate to `TabGroup` to see all variants and configurations in action.

## Performance

- Optimized with React hooks (useState, useCallback, useMemo, useRef)
- No unnecessary re-renders
- Smooth CSS transitions
- Lightweight (no external dependencies for tabs)

## Browser Support

Works in all modern browsers that support:

- CSS transitions
- Flexbox
- ES6+ JavaScript

## License

Part of the StrangerChat component library.

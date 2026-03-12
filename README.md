## react-native-glass-rich-editor

A modern, glassmorphism‑inspired rich text editor for React Native.  
Built on top of `react-native-pell-rich-editor`, it provides:

- **Full‑height, responsive editor layout**
- **Rich text formatting with a flexible toolbar**
- **Customizable UI and theming (light / dark / glass)**
- **Developer‑friendly TypeScript API**
- **High‑performance typing and smooth scrolling**

This library is designed to feel like a blend of Notion, Apple Notes, and Medium, while still being easy to drop into any React Native app.

---

## Features

- **Full height editor**
  - Uses `flex: 1` layout so the editor naturally fills its parent.
  - Integrates `KeyboardAvoidingView` for proper behavior when the keyboard opens.

- **Rich text formatting**
  - Bold, italic, underline, strike‑through.
  - Headings, paragraphs, block quotes, code.
  - Bulleted / numbered / checkbox lists.
  - Text alignment, colors, and more (via `ToolbarActionId`).

- **Customizable toolbar**
  - Enable / disable individual actions.
  - Add custom buttons.
  - Replace the entire toolbar via `renderToolbar`.

- **Developer‑friendly API**
  - Controlled or uncontrolled usage.
  - Strong TypeScript types.
  - Imperative ref methods (`getHTML`, `setHTML`, `clear`, etc.).

- **Easy styling and theming**
  - Built‑in light / dark / glass themes.
  - Override editor and toolbar colors with `editorTheme` and `toolbarTheme`.
  - Layout overrides via `containerStyle`, `toolbarStyle`, `style`.

---

## Installation

Using **npm**:

```bash
npm install react-native-glass-rich-editor
```

Using **yarn**:

```bash
yarn add react-native-glass-rich-editor
```

### Peer dependencies

Make sure these are installed in your project:

- `react`
- `react-native`
- `react-native-webview`
- `react-native-pell-rich-editor`

If you add this library to an existing React Native app, you may also need to install pods on iOS:

```bash
cd ios
pod install
cd ..
```

---

## Basic Usage

```tsx
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  RichEditor,
  type RichEditorRef,
} from 'react-native-glass-rich-editor';

export function MyScreen() {
  const editorRef = useRef<RichEditorRef>(null);

  return (
    <View style={styles.container}>
      <RichEditor
        ref={editorRef}
        defaultValue="<p>Hello world</p>"
        placeholder="Start writing..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

This renders a full‑height editor with the default toolbar, themes, and behavior.

---

## Full Usage Example

Below is a more complete example demonstrating:

- Custom placeholder and initial content
- Change tracking (`onChange`)
- Theming and styling
- Word count footer

```tsx
import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  RichEditor,
  type RichEditorRef,
  type EditorStats,
} from 'react-native-glass-rich-editor';

const INITIAL_HTML = `
<h2>Welcome</h2>
<p>This is a <strong>glass rich editor</strong> example.</p>
`;

export function RichEditorExample() {
  const editorRef = useRef<RichEditorRef>(null);
  const [html, setHtml] = useState('');
  const [stats, setStats] = useState<EditorStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
  });

  const handleChange = useCallback((value: string) => {
    setHtml(value);
  }, []);

  return (
    <View style={styles.container}>
      <RichEditor
        ref={editorRef}
        defaultValue={INITIAL_HTML}
        placeholder="Start writing your thoughts…"
        theme="glass"
        onChange={handleChange}
        onStatsChange={setStats}
        editorTheme={{
          backgroundColor: 'transparent',
        }}
        toolbarTheme={{
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
        }}
        containerStyle={styles.editorContainer}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {stats.words} words · {stats.characters} characters
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  editorContainer: {
    flex: 1,
    borderRadius: 16,
  },
  footer: {
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
});
```

---

## Props

### `RichEditor` Props

| Prop              | Type                                                                                         | Default     | Description                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `value`           | `string`                                                                                     | `undefined` | Controlled HTML value. When provided, the editor becomes controlled.                                      |
| `defaultValue`    | `string`                                                                                     | `''`        | Initial HTML content for uncontrolled mode.                                                               |
| `onChange`        | `(html: string) => void`                                                                     | `undefined` | Called with the latest HTML whenever the content changes.                                                |
| `onFocus`         | `() => void`                                                                                | `undefined` | Called when the editor receives focus.                                                                   |
| `onBlur`          | `() => void`                                                                                | `undefined` | Called when the editor loses focus.                                                                      |
| `placeholder`     | `string`                                                                                     | `''`        | Placeholder text displayed when the editor is empty.                                                     |
| `disabled`        | `boolean`                                                                                    | `false`     | Disables editing when `true`.                                                                            |
| `initialFocus`    | `boolean`                                                                                    | `false`     | When `true`, focuses the editor on mount (if not disabled).                                              |
| `pasteAsPlainText`| `boolean`                                                                                    | `false`     | When `true`, strips formatting on paste.                                                                 |
| `enabledActions`  | `ToolbarActionId[]`                                                                          | `undefined` | Convenience prop to control which toolbar actions are shown.                                             |
| `toolbarConfig`   | `Partial<ToolbarConfig>`                                                                     | `undefined` | Advanced toolbar configuration (actions, font sizes, custom buttons).                                    |
| `theme`           | `'light' \| 'dark' \| 'system' \| 'glass'`                                                   | `'system'`  | Built‑in theme preset.                                                                                   |
| `editorTheme`     | `Partial<EditorTheme>`                                                                       | `{}`        | Overrides for editor colors (background, text, caret, placeholder).                                      |
| `toolbarTheme`    | `Partial<ToolbarTheme>`                                                                      | `{}`        | Overrides for toolbar colors (background, icon tints).                                                   |
| `onLinkPress`     | `(url: string) => void`                                                                      | `undefined` | Called when a user taps a link inside the editor.                                                        |
| `onImagePick`     | `() => Promise<string \| null>`                                                              | `undefined` | Called when the user chooses to insert an image. Return an HTTPS URL or data URI (base64).               |
| `onVideoUrlRequest` | `() => Promise<string \| null>`                                                            | `undefined` | Called when the user chooses to insert a video. Return a playable HTTPS URL.                             |
| `onLinkInsert`    | `() => Promise<{ title: string; url: string } \| null>`                                      | `undefined` | Called when user wants to insert a link via the toolbar.                                                 |
| `style`           | `StyleProp<ViewStyle>`                                                                       | `undefined` | Extra style applied to the outer container.                                                              |
| `containerStyle`  | `StyleProp<ViewStyle>`                                                                       | `undefined` | Style for the main editor container (around toolbar + editor).                                           |
| `toolbarStyle`    | `StyleProp<ViewStyle>`                                                                       | `undefined` | Style applied to the toolbar wrapper.                                                                    |
| `stickyToolbar`   | `boolean`                                                                                    | `true`      | When `true`, toolbar stays at the top above the scrollable content.                                      |
| `showWordCount`   | `boolean`                                                                                    | `false`     | When `true`, shows a word/character count footer.                                                        |
| `onStatsChange`   | `(stats: EditorStats) => void`                                                               | `undefined` | Called whenever editor stats (words, characters) change.                                                 |
| `hideSelectionMenu` | `boolean`                                                                                  | `true`      | Hides native text selection menu (Cut/Copy/Paste) so toolbar is primary formatting UI.                   |
| `renderToolbar`   | `(props: { disabled: boolean; config?: Partial<ToolbarConfig>; theme: Partial<ToolbarTheme>; style?: StyleProp<ViewStyle>; }) => React.ReactNode` | `undefined` | Replace the default toolbar with a completely custom toolbar.                                            |
| `testID`          | `string`                                                                                     | `undefined` | Test identifier for E2E/UI tests.                                                                       |
| `accessibilityLabel` | `string`                                                                                  | `undefined` | Accessibility label for the editor content area.                                                         |

### `RichEditor` Ref Methods

`RichEditor` exposes an imperative ref with:

- `getHTML(): Promise<string>` – returns sanitized HTML.
- `setHTML(html: string): void` – sets the editor content.
- `clear(): void` – clears the editor.
- `focus(): void` – focuses the editor.
- `blur(): void` – blurs the editor.
- `insertImageFromPicker?(): Promise<void> \| void` – helper that runs your `onImagePick` and inserts the resulting image.
- `insertVideoFromPicker?(): Promise<void> \| void` – helper that runs your `onVideoUrlRequest` and inserts the resulting video.

---

## Customization

### Toolbar configuration

Use `enabledActions` or `toolbarConfig.enabledActions` to control which actions appear:

```tsx
import type { ToolbarActionId } from 'react-native-glass-rich-editor';

const BASIC_ACTIONS: ToolbarActionId[] = [
  'bold',
  'italic',
  'underline',
  'unorderedList',
  'orderedList',
  'insertLink',
];

<RichEditor
  defaultValue="<p>Write something…</p>"
  enabledActions={BASIC_ACTIONS}
/>;
```

For advanced scenarios, use `toolbarConfig`:

```tsx
<RichEditor
  toolbarConfig={{
    enabledActions: BASIC_ACTIONS,
    fontSizes: [3, 4, 5],
    // customButtons: [{ id: 'myAction', icon: <MyIcon />, onPress: () => {...}, label: 'My action' }],
  }}
/>;
```

### Replacing the toolbar entirely

If you want a completely custom toolbar UI:

```tsx
<RichEditor
  renderToolbar={({ disabled, config, theme, style }) => (
    <MyToolbar
      disabled={disabled}
      config={config}
      theme={theme}
      style={style}
    />
  )}
/>;
```

You can then wire your toolbar buttons to the editor via the ref and `EditorCore` APIs (for example, `editorRef.current?.setHTML(...)`, or send commands via the underlying lib if needed).

### Styling

You can override styling at three levels:

- **Container** – overall layout:

```tsx
<RichEditor containerStyle={{ flex: 1, borderRadius: 24 }} />
```

- **Editor** – text area colors:

```tsx
<RichEditor
  editorTheme={{
    backgroundColor: '#0F172A',
    color: '#F9FAFB',
    caretColor: '#6366F1',
    placeholderColor: '#64748B',
  }}
/>;
```

- **Toolbar** – bar background and icon colors:

```tsx
<RichEditor
  toolbarTheme={{
    backgroundColor: 'rgba(15,23,42,0.9)',
    iconTint: '#9CA3AF',
    selectedIconTint: '#6366F1',
    disabledIconTint: '#4B5563',
  }}
/>;
```

---

## Folder Structure (for contributors)

A suggested internal layout (already used in this repo):

- `components/rich-editor/`
  - `RichEditor.tsx` – main exported component.
  - `core/EditorCore.tsx` – low‑level wrapper around `react-native-pell-rich-editor`.
  - `toolbar/EditorToolbar.tsx` – default toolbar implementation.
  - `themes.ts` – theme presets and helpers.
  - `types/index.ts` – shared TypeScript types.
  - `utils/` – sanitization, stats, constants.
  - `hooks/` – shared hooks (debounce, format state, etc.).

This separation keeps editor logic, toolbar UI, styling, and helpers clean and easy to maintain.

---

## Contributing

Contributions are welcome.

- **Issues**: Use GitHub issues to report bugs or request features.
- **Pull Requests**:
  - Fork the repo.
  - Create a feature branch.
  - Add tests or update examples when applicable.
  - Run the app and ensure there are no TypeScript or lint errors.

Please keep code:

- Simple and readable.
- Well‑typed with TypeScript.
- Consistent with the existing folder structure.

---

## License

MIT License.  
You are free to use this library in commercial and open‑source projects.

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# 📝 Numeric Signature Pad

A reusable digital signature component for Vue.js applications. Capture handwritten signatures with mouse or touch input, export to multiple formats, and integrate seamlessly into your projects.

## ✨ Features

### 🎨 **Signature Capture**
- **Mouse & Touch Support**: Works on desktop and mobile devices
- **Natural Drawing**: Smooth, pressure-sensitive strokes
- **Customizable Styling**: Colors, line width, backgrounds
- **Grid Option**: Visual guide for signature placement

### 🛠️ **Rich Controls**
- **Clear & Undo**: Remove last stroke or clear entirely
- **Color Picker**: Choose from preset colors
- **Line Width**: Variable stroke thickness
- **Real-time Feedback**: Drawing status and statistics

### 💾 **Export Options**
- **PNG**: High-quality raster image
- **JPEG**: Compressed image format
- **SVG**: Scalable vector graphics
- **JSON**: Raw signature data for storage

### 🔧 **Developer Friendly**
- **TypeScript**: Full type safety
- **Vue 3**: Composition API support
- **Lightweight**: No heavy dependencies
- **Customizable**: Extensive configuration options

## 🚀 Quick Start

### Installation

```bash
npm install @visionary-studio/numeric-signature
```

### Basic Usage

```vue
<template>
  <SignaturePad
    :width="600"
    :height="300"
    @end="handleSignature"
  />
</template>

<script setup>
import SignaturePad from '@visionary-studio/numeric-signature'
import { ref } from 'vue'

const handleSignature = (data) => {
  console.log('Signature captured:', data)
}
</script>
```

### Advanced Configuration

```vue
<template>
  <SignaturePad
    :width="800"
    :height="400"
    color="#0066cc"
    background-color="#f8f9fa"
    :line-width="3"
    :show-controls="true"
    :show-color-picker="true"
    :show-line-width="true"
    :show-export="true"
    :colors="['#000000', '#0066cc', '#ff0000', '#008000']"
    :line-widths="[1, 2, 3, 4, 5]"
    @start="onStart"
    @draw="onDraw"
    @end="onEnd"
    @change="onChange"
  />
</template>
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `400` | Canvas width in pixels |
| `height` | `number` | `200` | Canvas height in pixels |
| `color` | `string` | `'#000000'` | Stroke color |
| `backgroundColor` | `string` | `'#ffffff'` | Canvas background |
| `lineWidth` | `number` | `2` | Stroke thickness |
| `smoothing` | `number` | `0.5` | Stroke smoothing (0-1) |
| `pressure` | `boolean` | `false` | Enable pressure sensitivity |
| `showControls` | `boolean` | `true` | Show control buttons |
| `showGrid` | `boolean` | `false` | Show background grid |
| `showColorPicker` | `boolean` | `true` | Show color selection |
| `showLineWidth` | `boolean` | `true` | Show line width options |
| `showExport` | `boolean` | `true` | Show export buttons |
| `colors` | `string[]` | `['#000000', '#0000ff', '#ff0000', '#008000']` | Available colors |
| `lineWidths` | `number[]` | `[1, 2, 3, 4]` | Available line widths |
| `texts` | `object` | See below | Custom button labels |

### Text Labels

```typescript
interface TextLabels {
  clear?: string;      // Default: 'Clear'
  undo?: string;       // Default: 'Undo'
  color?: string;      // Default: 'Color'
  lineWidth?: string;  // Default: 'Line Width'
  export?: string;     // Default: 'Export'
}
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `start` | `SignaturePoint` | Drawing started |
| `draw` | `SignaturePoint` | Drawing in progress |
| `end` | `SignatureData` | Drawing completed |
| `change` | `SignatureData \| null` | Signature data changed |
| `clear` | - | Canvas cleared |

### Exposed Methods

```vue
<template>
  <SignaturePad ref="signaturePad" />
  <button @click="saveSignature">Save</button>
</template>

<script setup>
import { ref } from 'vue'

const signaturePad = ref()

const saveSignature = () => {
  const data = signaturePad.value.getData()
  const png = signaturePad.value.toDataURL()
  const blob = signaturePad.value.toBlob()
}
</script>
```

| Method | Return | Description |
|--------|--------|-------------|
| `clear()` | `void` | Clear the canvas |
| `undo()` | `void` | Remove last stroke |
| `getData()` | `SignatureData \| null` | Get signature data |
| `setData(data)` | `void` | Set signature data |
| `toDataURL(format?, quality?)` | `string` | Export as data URL |
| `toBlob(format?, quality?)` | `Promise<Blob>` | Export as blob |

### Reactive Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEmpty` | `boolean` | Canvas is empty |
| `isDrawing` | `boolean` | Currently drawing |
| `signatureData` | `SignatureData \| null` | Current signature data |

## 📋 Data Types

### SignatureData

```typescript
interface SignatureData {
  strokes: SignatureStroke[]
  width: number
  height: number
  backgroundColor: string
  timestamp: number
}
```

### SignatureStroke

```typescript
interface SignatureStroke {
  points: SignaturePoint[]
  color: string
  width: number
  timestamp: number
}
```

### SignaturePoint

```typescript
interface SignaturePoint {
  x: number
  y: number
  pressure?: number
  timestamp?: number
}
```

## 🎯 Use Cases

### 📄 **Document Signing**
```vue
<template>
  <div class="document">
    <h2>Contract Agreement</h2>
    <p>Please sign below to confirm:</p>
    <SignaturePad
      :width="600"
      :height="200"
      @end="saveContractSignature"
    />
  </div>
</template>
```

### 📱 **Mobile Forms**
```vue
<template>
  <div class="mobile-form">
    <label>Customer Signature:</label>
    <SignaturePad
      :width="350"
      :height="150"
      :show-controls="false"
      :show-export="false"
      @end="captureMobileSignature"
    />
  </div>
</template>
```

### 🔐 **Authentication**
```vue
<template>
  <div class="auth-flow">
    <h3>Verify Your Identity</h3>
    <p>Draw your signature to continue:</p>
    <SignaturePad
      :width="400"
      :height="200"
      color="#0066cc"
      @end="verifySignature"
    />
  </div>
</template>
```

## 🛠️ Integration Examples

### With Pinia Store

```typescript
// stores/signature.js
import { defineStore } from 'pinia'

export const useSignatureStore = defineStore('signature', {
  state: () => ({
    signatures: []
  }),
  actions: {
    addSignature(data) {
      this.signatures.push({
        id: Date.now(),
        data,
        timestamp: new Date().toISOString()
      })
    }
  }
})
```

### With Form Validation

```vue
<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label>Signature *</label>
      <SignaturePad
        ref="signaturePad"
        :width="500"
        :height="200"
        @end="validateSignature"
      />
      <span v-if="signatureError" class="error">
        Signature is required
      </span>
    </div>
    <button type="submit" :disabled="!isValid">
      Submit Form
    </button>
  </form>
</template>
```

### Server Upload

```vue
<script setup>
const uploadSignature = async (signatureData) => {
  const blob = await signaturePad.value.toBlob()
  const formData = new FormData()
  formData.append('signature', blob, 'signature.png')
  
  try {
    const response = await fetch('/api/upload-signature', {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    console.log('Signature uploaded:', result)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>
```

## 🎨 Customization

### CSS Variables

```css
.signature-canvas {
  --signature-border-color: #e5e7eb;
  --signature-focus-color: #3b82f6;
  --signature-background: #ffffff;
}
```

### Custom Styling

```vue
<style scoped>
.signature-pad :deep(.signature-canvas) {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.signature-pad :deep(.btn) {
  border-radius: 8px;
  font-weight: 600;
}
</style>
```

## 🧪 Testing

The library includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- ✅ Canvas drawing functionality
- ✅ Touch and mouse events
- ✅ Export/import operations
- ✅ Data validation
- ✅ Vue component integration
- ✅ Composable behavior

## 📦 Build & Distribution

```bash
# Build for development
npm run dev

# Build library for distribution
npm run build-lib

# Build demo application
npm run build

# Type checking
npm run type-check
```

## 🔧 Development

### Project Structure

```
src/
├── components/
│   └── SignaturePad.vue      # Main Vue component
├── composables/
│   └── useSignature.ts       # Vue composable
├── utils/
│   ├── signature-canvas.ts   # Canvas logic
│   └── signature-utils.ts    # Utility functions
├── types/
│   └── signature.ts          # TypeScript types
├── App.vue                   # Demo application
├── main.ts                   # Entry point
└── index.ts                  # Library exports
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: support@visionary-studio.com
- 🐛 Issues: [GitHub Issues](https://github.com/visionary-studio/numeric-signature/issues)
- 📖 Documentation: [Full Docs](https://numeric-signature.visionary-studio.com)

## 🔗 Related Projects

- [@visionary-studio/js-toolbox](https://github.com/visionary-studio/js-toolbox) - JavaScript utility library
- [@visionary-studio/form-builder](https://github.com/visionary-studio/form-builder) - Dynamic form builder

---

Built with ❤️ by [Visionary Studio](https://visionary-studio.com)

<template>
  <div class="signature-pad" :class="{ 'is-drawing': isDrawing }">
    <div class="signature-container">
      <canvas
        ref="canvasRef"
        class="signature-canvas"
        :width="width"
        :height="height"
        @contextmenu.prevent
      />
      <div v-if="showGrid" class="signature-grid" />
    </div>
    
    <div v-if="showControls" class="signature-controls">
      <div class="control-group">
        <button
          type="button"
          class="btn btn-secondary"
          @click="clear"
          :disabled="isEmpty"
        >
          {{ texts.clear }}
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          @click="undo"
          :disabled="isEmpty"
        >
          {{ texts.undo }}
        </button>
      </div>
      
      <div v-if="showColorPicker" class="control-group">
        <label class="control-label">{{ texts.color }}:</label>
        <div class="color-picker">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            class="color-btn"
            :class="{ active: currentColor === color }"
            :style="{ backgroundColor: color }"
            @click="updateColor(color)"
          />
        </div>
      </div>
      
      <div v-if="showLineWidth" class="control-group">
        <label class="control-label">{{ texts.lineWidth }}:</label>
        <div class="line-width-picker">
          <button
            v-for="width in lineWidths"
            :key="width"
            type="button"
            class="width-btn"
            :class="{ active: currentLineWidth === width }"
            @click="updateLineWidth(width)"
          >
            <div class="width-line" :style="{ height: width + 'px' }" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showExport && !isEmpty" class="signature-export">
      <div class="export-group">
        <label class="control-label">{{ texts.export }}:</label>
        <div class="export-buttons">
          <button
            type="button"
            class="btn btn-primary"
            @click="exportPNG"
          >
            PNG
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="exportJPEG"
          >
            JPEG
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="exportSVG"
          >
            SVG
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="exportJSON"
          >
            JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSignature } from '../composables/useSignature';
import { SignatureUtils } from '../utils/signature-utils';
import type { SignatureOptions, SignatureData } from '../types/signature';

interface Props {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  lineWidth?: number;
  smoothing?: number;
  pressure?: boolean;
  showControls?: boolean;
  showGrid?: boolean;
  showColorPicker?: boolean;
  showLineWidth?: boolean;
  showExport?: boolean;
  colors?: string[];
  lineWidths?: number[];
  texts?: {
    clear?: string;
    undo?: string;
    color?: string;
    lineWidth?: string;
    export?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 200,
  color: '#000000',
  backgroundColor: '#ffffff',
  lineWidth: 2,
  smoothing: 0.5,
  pressure: false,
  showControls: true,
  showGrid: false,
  showColorPicker: true,
  showLineWidth: true,
  showExport: true,
  colors: () => ['#000000', '#0000ff', '#ff0000', '#008000'],
  lineWidths: () => [1, 2, 3, 4],
  texts: () => ({
    clear: 'Clear',
    undo: 'Undo',
    color: 'Color',
    lineWidth: 'Line Width',
    export: 'Export'
  })
});

const emit = defineEmits<{
  start: [point: any];
  draw: [point: any];
  end: [data: SignatureData];
  clear: [];
  change: [data: SignatureData | null];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const currentColor = ref(props.color);
const currentLineWidth = ref(props.lineWidth);

const options = computed<SignatureOptions>(() => ({
  width: props.width,
  height: props.height,
  color: currentColor.value,
  backgroundColor: props.backgroundColor,
  lineWidth: currentLineWidth.value,
  smoothing: props.smoothing,
  pressure: props.pressure
}));

const {
  isDrawing,
  isEmpty,
  signatureData,
  clear,
  undo,
  getData,
  setData,
  toDataURL,
  toBlob,
  updateOptions,
  on
} = useSignature(canvasRef, options.value);

watch(() => options.value, (newOptions: any) => {
  updateOptions(newOptions);
}, { deep: true });

watch(signatureData, (data: any) => {
  emit('change', data);
});

onMounted(() => {
  (on as any)('start', (point: any) => emit('start', point));
  (on as any)('end', (data: any) => emit('end', data));
});

const updateColor = (color: string) => {
  currentColor.value = color;
};

const updateLineWidth = (width: number) => {
  currentLineWidth.value = width;
};

const exportPNG = () => {
  const data = getData();
  if (data) {
    const dataURL = SignatureUtils.exportToPNG(data);
    downloadFile(dataURL, 'signature.png');
  }
};

const exportJPEG = () => {
  const data = getData();
  if (data) {
    const dataURL = SignatureUtils.exportToJPEG(data);
    downloadFile(dataURL, 'signature.jpg');
  }
};

const exportSVG = () => {
  const data = getData();
  if (data) {
    const svg = SignatureUtils.exportToSVG(data);
    downloadFile('data:image/svg+xml;base64,' + btoa(svg), 'signature.svg');
  }
};

const exportJSON = () => {
  const data = getData();
  if (data) {
    const json = SignatureUtils.exportToJSON(data);
    downloadFile('data:application/json;base64,' + btoa(json), 'signature.json');
  }
};

const downloadFile = (dataURL: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

defineExpose({
  clear,
  undo,
  getData,
  setData,
  toDataURL,
  toBlob,
  isEmpty,
  isDrawing
});
</script>

<style scoped>
.signature-pad {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.signature-container {
  position: relative;
  display: inline-block;
}

.signature-canvas {
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: v-bind('backgroundColor');
  cursor: crosshair;
  touch-action: none;
}

.signature-canvas:hover {
  border-color: #d1d5db;
}

.signature-pad.is-drawing .signature-canvas {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.signature-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(to right, #f3f4f6 1px, transparent 1px),
    linear-gradient(to bottom, #f3f4f6 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0.5;
}

.signature-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.color-picker {
  display: flex;
  gap: 0.25rem;
}

.color-btn {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #3b82f6;
}

.line-width-picker {
  display: flex;
  gap: 0.25rem;
}

.width-btn {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.25rem;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.width-btn:hover {
  transform: scale(1.1);
}

.width-btn.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #3b82f6;
}

.width-line {
  width: 1rem;
  background-color: #000000;
  border-radius: 1px;
}

.signature-export {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.export-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: #ffffff;
  border-color: #6b7280;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
  border-color: #4b5563;
}

@media (max-width: 640px) {
  .signature-controls,
  .signature-export {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-group,
  .export-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>

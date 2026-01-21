<template>
  <div class="app">
    <header class="app-header">
      <h1>Numeric Signature Pad</h1>
      <p>A reusable digital signature component for Vue.js</p>
    </header>

    <main class="app-main">
      <section class="demo-section">
        <h2>Basic Demo</h2>
        <SignaturePad
          ref="signaturePadRef"
          :width="600"
          :height="300"
          :show-controls="true"
          :show-export="true"
          :show-color-picker="true"
          :show-line-width="true"
          @start="onSignatureStart"
          @end="onSignatureEnd"
          @change="onSignatureChange"
        />
        
        <div class="demo-info">
          <p><strong>Status:</strong> {{ isDrawing ? 'Drawing...' : isEmpty ? 'Empty' : 'Signed' }}</p>
          <p><strong>Strokes:</strong> {{ strokeCount }}</p>
          <p><strong>Points:</strong> {{ pointCount }}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>Custom Styling</h2>
        <SignaturePad
          :width="400"
          :height="200"
          color="#0066cc"
          background-color="#f8f9fa"
          :line-width="3"
          :show-grid="true"
          :show-controls="true"
          :show-export="false"
          :texts="{
            clear: 'Effacer',
            undo: 'Annuler',
            color: 'Couleur',
            lineWidth: 'Épaisseur',
            export: 'Exporter'
          }"
        />
      </section>

      <section class="demo-section">
        <h2>Minimal Interface</h2>
        <SignaturePad
          :width="500"
          :height="250"
          :show-controls="false"
          :show-export="false"
          @end="handleMinimalSignature"
        />
        <button 
          v-if="minimalSignatureData"
          @click="clearMinimalSignature"
          class="btn btn-secondary"
        >
          Clear Signature
        </button>
      </section>

      <section class="demo-section">
        <h2>Programmatic Control</h2>
        <div class="control-panel">
          <button @click="clearAllSignatures" class="btn btn-danger">Clear All</button>
          <button @click="loadSampleSignature" class="btn btn-primary">Load Sample</button>
          <button @click="exportAllFormats" class="btn btn-success">Export All Formats</button>
        </div>
      </section>
    </main>

    <footer class="app-footer">
      <p>Built with Vue.js, TypeScript, and Canvas API</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SignaturePad from './components/SignaturePad.vue';
import type { SignatureData } from './types/signature';

const signaturePadRef = ref<InstanceType<typeof SignaturePad> | null>(null);
const isDrawing = ref(false);
const isEmpty = ref(true);
const strokeCount = ref(0);
const pointCount = ref(0);
const minimalSignatureData = ref<SignatureData | null>(null);

const onSignatureStart = (point: any) => {
  isDrawing.value = true;
  console.log('Signature started at:', point);
};

const onSignatureEnd = (data: SignatureData) => {
  isDrawing.value = false;
  isEmpty.value = data.strokes.length === 0;
  strokeCount.value = data.strokes.length;
  pointCount.value = data.strokes.reduce((total, stroke) => total + stroke.points.length, 0);
  console.log('Signature ended:', data);
};

const onSignatureChange = (data: SignatureData | null) => {
  if (data) {
    strokeCount.value = data.strokes.length;
    pointCount.value = data.strokes.reduce((total, stroke) => total + stroke.points.length, 0);
  } else {
    strokeCount.value = 0;
    pointCount.value = 0;
  }
};

const handleMinimalSignature = (data: SignatureData) => {
  minimalSignatureData.value = data;
  console.log('Minimal signature captured:', data);
};

const clearMinimalSignature = () => {
  minimalSignatureData.value = null;
};

const clearAllSignatures = () => {
  if (signaturePadRef.value) {
    signaturePadRef.value.clear();
  }
  minimalSignatureData.value = null;
};

const loadSampleSignature = () => {
  if (signaturePadRef.value) {
    const sampleData: SignatureData = {
      strokes: [
        {
          points: [
            { x: 50, y: 50, timestamp: Date.now() },
            { x: 100, y: 80, timestamp: Date.now() + 10 },
            { x: 150, y: 60, timestamp: Date.now() + 20 },
            { x: 200, y: 90, timestamp: Date.now() + 30 }
          ],
          color: '#000000',
          width: 2,
          timestamp: Date.now()
        },
        {
          points: [
            { x: 80, y: 120, timestamp: Date.now() + 40 },
            { x: 120, y: 140, timestamp: Date.now() + 50 },
            { x: 160, y: 130, timestamp: Date.now() + 60 }
          ],
          color: '#000000',
          width: 2,
          timestamp: Date.now() + 40
        }
      ],
      width: 600,
      height: 300,
      backgroundColor: '#ffffff',
      timestamp: Date.now()
    };
    
    signaturePadRef.value.setData(sampleData);
  }
};

const exportAllFormats = () => {
  if (signaturePadRef.value && !signaturePadRef.value.isEmpty) {
    const data = signaturePadRef.value.getData();
    if (data) {
      console.log('PNG:', signaturePadRef.value.toDataURL('image/png'));
      console.log('JPEG:', signaturePadRef.value.toDataURL('image/jpeg'));
      console.log('Signature Data:', data);
    }
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.app-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  border-left: 4px solid #667eea;
}

.demo-info p {
  margin: 0.25rem 0;
  color: #555;
}

.demo-info strong {
  color: #333;
}

.control-panel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.app-footer {
  background: #f8f9fa;
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}

.app-footer p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .demo-section {
    padding: 1rem;
    margin-bottom: 2rem;
  }
  
  .control-panel {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { SignatureCanvas } from '../utils/signature-canvas';
import type { SignatureOptions, SignatureData, SignatureCallbacks, SignaturePoint } from '../types/signature';

export function useSignature(canvasRef: Ref<HTMLCanvasElement | null>, options: SignatureOptions = {}) {
  const signatureCanvas = ref<SignatureCanvas | null>(null);
  const isDrawing = ref(false);
  const isEmpty = ref(true);
  const signatureData = ref<SignatureData | null>(null);
  
  const callbacks = ref<SignatureCallbacks>({});
  
  onMounted(() => {
    if (canvasRef.value) {
      try {
        signatureCanvas.value = new SignatureCanvas(canvasRef.value, options);
        
        // Set up event listeners
        const canvas = canvasRef.value;
        
        const handleStart = (e: Event) => {
          isDrawing.value = true;
          callbacks.value.onStart?.(signatureCanvas.value!.getPointFromEvent(e as any));
        };
        
        const handleEnd = () => {
          isDrawing.value = false;
          isEmpty.value = signatureCanvas.value!.isEmpty();
          signatureData.value = signatureCanvas.value!.getData();
          callbacks.value.onEnd?.(signatureData.value!);
        };
        
        const handleClear = () => {
          isEmpty.value = true;
          signatureData.value = null;
          callbacks.value.onClear?.();
        };
        
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('touchstart', handleStart);
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('mouseleave', handleEnd);
        
        // Store cleanup function
        const cleanup = () => {
          canvas.removeEventListener('mousedown', handleStart);
          canvas.removeEventListener('touchstart', handleStart);
          canvas.removeEventListener('mouseup', handleEnd);
          canvas.removeEventListener('touchend', handleEnd);
          canvas.removeEventListener('mouseleave', handleEnd);
        };
        
        onUnmounted(() => {
          cleanup();
          signatureCanvas.value?.destroy();
        });
        
      } catch (error) {
        console.error('Failed to initialize signature canvas:', error);
      }
    }
  });
  
  const clear = () => {
    signatureCanvas.value?.clear();
    isEmpty.value = true;
    signatureData.value = null;
  };
  
  const undo = () => {
    signatureCanvas.value?.undo();
    isEmpty.value = signatureCanvas.value!.isEmpty();
    signatureData.value = signatureCanvas.value!.getData();
  };
  
  const getData = (): SignatureData | null => {
    return signatureCanvas.value?.getData() || null;
  };
  
  const setData = (data: SignatureData) => {
    signatureCanvas.value?.setData(data);
    isEmpty.value = signatureCanvas.value!.isEmpty();
    signatureData.value = data;
  };
  
  const toDataURL = (format = 'image/png', quality = 1.0): string => {
    return signatureCanvas.value?.toDataURL(format, quality) || '';
  };
  
  const toBlob = async (format = 'image/png', quality = 1.0): Promise<Blob | null> => {
    return signatureCanvas.value?.toBlob(format, quality) || null;
  };
  
  const updateOptions = (newOptions: Partial<SignatureOptions>) => {
    signatureCanvas.value?.updateOptions(newOptions);
  };
  
  const on = (event: keyof SignatureCallbacks, callback: any) => {
    callbacks.value[event] = callback;
  };
  
  return {
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
  };
}

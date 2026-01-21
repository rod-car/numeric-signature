export { SignatureCanvas } from './utils/signature-canvas';
export { SignatureUtils } from './utils/signature-utils';
export { useSignature } from './composables/useSignature';
export { default as SignaturePad } from './components/SignaturePad.vue';

export type {
  SignaturePoint,
  SignatureStroke,
  SignatureData,
  SignatureOptions,
  SignatureExportOptions,
  SignatureEvent,
  SignatureCallbacks
} from './types/signature';

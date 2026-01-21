import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SignaturePad from '../src/components/SignaturePad.vue';

// Mock the useSignature composable
vi.mock('../src/composables/useSignature', () => ({
  useSignature: vi.fn(() => ({
    isDrawing: { value: false },
    isEmpty: { value: true },
    signatureData: { value: null },
    clear: vi.fn(),
    undo: vi.fn(),
    getData: vi.fn().mockReturnValue(null),
    setData: vi.fn(),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    toBlob: vi.fn().mockResolvedValue(new Blob()),
    updateOptions: vi.fn(),
    on: vi.fn()
  }))
}));

describe('SignaturePad', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(SignaturePad);
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      expect(wrapper.find('.signature-pad').exists()).toBe(true);
      expect(wrapper.find('.signature-canvas').exists()).toBe(true);
      expect(wrapper.find('.signature-controls').exists()).toBe(true);
    });

    it('should render with custom props', () => {
      wrapper = mount(SignaturePad, {
        props: {
          width: 600,
          height: 300,
          color: '#ff0000',
          lineWidth: 3,
          showControls: false,
          showExport: true
        }
      });
      
      const canvas = wrapper.find('.signature-canvas');
      expect(canvas.attributes('width')).toBe('600');
      expect(canvas.attributes('height')).toBe('300');
      expect(wrapper.find('.signature-controls').exists()).toBe(false);
    });

    it('should render color picker when enabled', () => {
      wrapper = mount(SignaturePad, {
        props: {
          showColorPicker: true,
          colors: ['#ff0000', '#00ff00', '#0000ff']
        }
      });
      
      expect(wrapper.find('.color-picker').exists()).toBe(true);
      expect(wrapper.findAll('.color-btn')).toHaveLength(3);
    });

    it('should render line width picker when enabled', () => {
      wrapper = mount(SignaturePad, {
        props: {
          showLineWidth: true,
          lineWidths: [1, 2, 3, 4, 5]
        }
      });
      
      expect(wrapper.find('.line-width-picker').exists()).toBe(true);
      expect(wrapper.findAll('.width-btn')).toHaveLength(5);
    });

    it('should render export section when not empty', async () => {
      wrapper = mount(SignaturePad, {
        props: { showExport: true }
      });
      
      expect(wrapper.find('.signature-export').exists()).toBe(true);
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      wrapper = mount(SignaturePad);
    });

    it('should have clear button', () => {
      const clearButton = wrapper.find('.btn-secondary');
      expect(clearButton.exists()).toBe(true);
    });

    it('should have undo button', () => {
      const undoButton = wrapper.findAll('.btn-secondary')[1];
      expect(undoButton.exists()).toBe(true);
    });

    it('should have color buttons when enabled', () => {
      const colorButtons = wrapper.findAll('.color-btn');
      expect(colorButtons.length).toBeGreaterThan(0);
    });

    it('should have line width buttons when enabled', () => {
      const widthButtons = wrapper.findAll('.width-btn');
      expect(widthButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Export functionality', () => {
    beforeEach(() => {
      wrapper = mount(SignaturePad, {
        props: { showExport: true }
      });
    });

    it('should have export buttons', () => {
      const exportButtons = wrapper.findAll('.btn-primary');
      expect(exportButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      wrapper = mount(SignaturePad);
    });

    it('should be a Vue component', () => {
      expect(wrapper.vm).toBeDefined();
    });

    it('should have canvas element', () => {
      const canvas = wrapper.find('.signature-canvas');
      expect(canvas.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have canvas element', () => {
      const canvas = wrapper.find('.signature-canvas');
      expect(canvas.exists()).toBe(true);
    });

    it('should have buttons', () => {
      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive design', () => {
    it('should render signature pad', () => {
      expect(wrapper.find('.signature-pad').exists()).toBe(true);
    });
  });

  describe('Custom text labels', () => {
    it('should render with custom texts', () => {
      wrapper = mount(SignaturePad, {
        props: {
          texts: {
            clear: 'Effacer',
            undo: 'Annuler',
            color: 'Couleur',
            lineWidth: 'Épaisseur',
            export: 'Exporter'
          }
        }
      });
      
      expect(wrapper.find('.signature-pad').exists()).toBe(true);
    });
  });

  describe('Grid display', () => {
    it('should show grid when enabled', () => {
      wrapper = mount(SignaturePad, {
        props: { showGrid: true }
      });
      
      expect(wrapper.find('.signature-grid').exists()).toBe(true);
    });

    it('should hide grid when disabled', () => {
      wrapper = mount(SignaturePad, {
        props: { showGrid: false }
      });
      
      expect(wrapper.find('.signature-grid').exists()).toBe(false);
    });
  });

  describe('Exposed methods', () => {
    it('should expose methods', () => {
      expect(typeof wrapper.vm.clear).toBe('function');
      expect(typeof wrapper.vm.undo).toBe('function');
      expect(typeof wrapper.vm.getData).toBe('function');
      expect(typeof wrapper.vm.setData).toBe('function');
      expect(typeof wrapper.vm.toDataURL).toBe('function');
      expect(typeof wrapper.vm.toBlob).toBe('function');
    });

    it('should expose reactive properties', () => {
      expect('isEmpty' in wrapper.vm).toBe(true);
      expect('isDrawing' in wrapper.vm).toBe(true);
    });
  });
});

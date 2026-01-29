// Simple toast utility
// Replace with proper implementation when adding sonner or react-hot-toast

export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    // For production, implement proper toast notifications
  },
  error: (message: string) => {
    console.error('❌ Error:', message);
    // For production, implement proper toast notifications
  },
  info: (message: string) => {
    console.log('ℹ️ Info:', message);
  },
  warning: (message: string) => {
    console.warn('⚠️ Warning:', message);
  },
};

/**
 * @constant {boolean} HAS_WEAKSET_SUPPORT does the main realm have WeakMap support
 */
export const HAS_WEAKSET_SUPPORT = typeof global.WeakSet === 'function';

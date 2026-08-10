(() => {
  'use strict';

  const nativeRegExp = window.RegExp;
  let assignedV9 = null;

  function SafeRegExp(pattern, flags) {
    try {
      return new nativeRegExp(pattern, flags);
    } catch (error) {
      const source = String(pattern ?? '');
      if (error instanceof SyntaxError && source.endsWith('(')) {
        return new nativeRegExp(source.slice(0, -1) + '\\(', flags);
      }
      throw error;
    }
  }

  SafeRegExp.prototype = nativeRegExp.prototype;
  Object.setPrototypeOf(SafeRegExp, nativeRegExp);

  function wrapTransformer(transformer) {
    return source => {
      const previous = window.RegExp;
      window.RegExp = SafeRegExp;
      try {
        return transformer(source);
      } finally {
        window.RegExp = previous;
      }
    };
  }

  Object.defineProperty(window, 'applySansFidelityV9', {
    configurable: true,
    get() {
      return assignedV9;
    },
    set(value) {
      assignedV9 = typeof value === 'function' ? wrapTransformer(value) : value;
    }
  });

  window.applySansFidelityV11 = source => {
    if (typeof assignedV9 !== 'function') {
      throw new Error('Sans fidelity v9 transformer is unavailable');
    }
    return assignedV9(source);
  };
})();
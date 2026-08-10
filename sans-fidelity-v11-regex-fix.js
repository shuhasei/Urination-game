(() => {
  'use strict';

  const nativeRegExp = window.RegExp;

  function SafeRegExp(pattern, flags) {
    try {
      return new nativeRegExp(pattern, flags);
    } catch (error) {
      const source = String(pattern ?? '');
      // sans-fidelity-v9 builds a function-search pattern whose final literal
      // opening parenthesis lost its escape while passing through a template
      // literal. Repair only that known malformed tail, then retry.
      if (error instanceof SyntaxError && source.endsWith('(')) {
        return new nativeRegExp(source.slice(0, -1) + '\\(', flags);
      }
      throw error;
    }
  }

  SafeRegExp.prototype = nativeRegExp.prototype;
  Object.setPrototypeOf(SafeRegExp, nativeRegExp);

  window.applySansFidelityV11 = source => {
    if (typeof window.applySansFidelityV9 !== 'function') {
      throw new Error('Sans fidelity v9 transformer is unavailable');
    }
    const previous = window.RegExp;
    window.RegExp = SafeRegExp;
    try {
      return window.applySansFidelityV9(source);
    } finally {
      window.RegExp = previous;
    }
  };
})();
import {
  shallowEqual
} from './utils';

/**
 * Extend Vue prototype + global mixin
 *
 * @param {Vue} Vue
 */

export function extendVue(Vue) {
  Vue.prototype.$connect = function(mapState) {
    const vm = this;
    const getMappedState = (state = this.$store.state) => mapState(state);

    const observeStore = (store, currState, select, onChange) => {
      if (typeof onChange !== 'function') return null;
      let currentState = currState || {};

      function handleChange() {
        const nextState = getMappedState();
        if (!shallowEqual(currentState, nextState)) {
          console.log(currentState, nextState)
          const previousState = currentState;
          currentState = nextState;
          onChange(currentState, previousState);
        }
      }

      const unsubscribe = store.subscribe(handleChange);
      handleChange();
      return unsubscribe
    }

    observeStore(this.$store, this.$store.state, getMappedState(), (newState, oldState) => {
      Object.keys(newState).forEach(key => {
        if(vm[key] === undefined) {
          console.warn(`[revue2] - you forgot to declare property **${key}** in your component's data function making it unreactive`)
        }
        vm[key] = newState[key];
      });
    });
  }

  Object.defineProperty(Vue.prototype, '$store', {
    get: function $store() {
      if (!this.$root.store) {
        throw new Error('[revue2] - No store provided to root component')
      }
      return this.$root.store
    }
  })
}
import VueClass from 'vue'
import ChangeDetector from './change-detector'
import { Getter, Setter, VueComputed, FromMobxEntry, IMobxMethods } from './types'

export { IMobxMethods }

declare module 'vue/types/options' {
  interface ComponentOptions<V extends VueClass> {
    fromMobx?: { [key: string]: (this: V) => any }
  }
}

export default function install(Vue: typeof VueClass, mobxMethods: IMobxMethods) {

  const changeDetector = new ChangeDetector(Vue, mobxMethods)

  function beforeCreate(this: VueClass) {
    const vm = this

    vm.$options.computed = getFromStoreEntries(vm).reduce(
      (computed, { key, set }) => {
        changeDetector.defineReactiveProperty(vm, key)

        return Object.assign(
          computed,
          { [key]: createComputedProperty(changeDetector, vm, key, set) }
        )
      },
      vm.$options.computed || {}
    )
  }

  function created(this: VueClass) {
    const vm = this

    changeDetector.defineReactionList(vm, getFromStoreEntries(vm))
  }

  function beforeDestroy(this: VueClass) {
    const vm = this

    changeDetector.removeReactionList(vm)
    getFromStoreEntries(vm).forEach(({ key }) => changeDetector.removeReactiveProperty(vm, key))
  }

  Vue.mixin({
    beforeCreate,
    created,
    beforeDestroy
  })
}

function createComputedProperty(
  changeDetector: ChangeDetector,
  vm: VueClass,
  key: string,
  setter?: Setter
): VueComputed {
  const getter: Getter = () => changeDetector.getReactiveProperty(vm, key)

  if (typeof setter === 'function') {
    return {
      get: getter,
      set: (value) => setter.call(vm, value)
    }
  }

  return getter
}

function getFromStoreEntries(vm) {
  var fromStore = vm.$options.fromMobx;
  if (vm.$options.mixins) {
    var fromStoreNew = vm.$options.mixins.map(function (mixin) { return mixin.fromMobx })
      .reduce(function (accum, mobx) {
        if (mobx) {
          return Object.assign({}, accum, mobx)
        } else {
          return accum
        }
      }, {})
    fromStore = Object.assign({}, fromStore, fromStoreNew)
  }

  if (!fromStore) {
    return [];
  }
  return Object.keys(fromStore).map(function (key) {
    var field = fromStore[key];
    var isFieldFunction = typeof field === 'function';
    var isSetterFunction = !isFieldFunction && typeof field.set === 'function';
    return {
      key: key,
      get: isFieldFunction ? field : field.get,
      set: isSetterFunction ? field.set : null
    };
  });
}

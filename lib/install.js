import ChangeDetector from './change-detector';
export default function install(Vue, mobxMethods) {
    var changeDetector = new ChangeDetector(Vue, mobxMethods);
    function beforeCreate() {
        var vm = this;
        vm.$options.computed = getFromStoreEntries(vm).reduce(function (computed, _a) {
            var key = _a.key, set = _a.set;
            changeDetector.defineReactiveProperty(vm, key);
            return Object.assign(computed, (_b = {}, _b[key] = createComputedProperty(changeDetector, vm, key, set), _b));
            var _b;
        }, vm.$options.computed || {});
    }
    function created() {
        var vm = this;
        changeDetector.defineReactionList(vm, getFromStoreEntries(vm));
    }
    function beforeDestroy() {
        var vm = this;
        changeDetector.removeReactionList(vm);
        getFromStoreEntries(vm).forEach(function (_a) {
            var key = _a.key;
            return changeDetector.removeReactiveProperty(vm, key);
        });
    }
    Vue.mixin({
        beforeCreate: beforeCreate,
        created: created,
        beforeDestroy: beforeDestroy
    });
}
function createComputedProperty(changeDetector, vm, key, setter) {
    var getter = function () { return changeDetector.getReactiveProperty(vm, key); };
    if (typeof setter === 'function') {
        return {
            get: getter,
            set: function (value) { return setter.call(vm, value); }
        };
    }
    return getter;
}
function getFromStoreEntries(vm) {
    var fromStore = vm.$options.fromMobx;
    if (vm.$options.mixins) {
        var fromStoreNew = vm.$options.mixins.map(function (mixin) { return mixin.fromMobx; })
            .reduce(function (accum, mobx) {
            if (mobx) {
                return Object.assign({}, accum, mobx);
            }
            else {
                return accum;
            }
        }, {});
        fromStore = Object.assign({}, fromStore, fromStoreNew);
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
//# sourceMappingURL=install.js.map
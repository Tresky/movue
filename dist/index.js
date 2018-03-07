(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.movue = {})));
}(this, (function (exports) { 'use strict';

var ChangeDetector = (function () {
    function ChangeDetector(Vue, mobxMethods) {
        this.defineReactive = Vue.util.defineReactive;
        this.mobxMethods = mobxMethods;
        this.changeDetector = new Vue();
    }
    ChangeDetector.prototype.defineReactiveProperty = function (vm, key) {
        var reactivePropertyKey = this._getReactivePropertyKey(vm, key);
        this.defineReactive(this.changeDetector, reactivePropertyKey, null, null, true);
    };
    ChangeDetector.prototype.getReactiveProperty = function (vm, key) {
        var reactivePropertyKey = this._getReactivePropertyKey(vm, key);
        return this.changeDetector[reactivePropertyKey];
    };
    ChangeDetector.prototype.updateReactiveProperty = function (vm, key, value) {
        var reactivePropertyKey = this._getReactivePropertyKey(vm, key);
        this.changeDetector[reactivePropertyKey] = value;
    };
    ChangeDetector.prototype.removeReactiveProperty = function (vm, key) {
        var reactivePropertyKey = this._getReactivePropertyKey(vm, key);
        delete this.changeDetector[reactivePropertyKey];
    };
    ChangeDetector.prototype.defineReactionList = function (vm, fromMobxEntries) {
        var _this = this;
        var reactivePropertyListKey = this._getReactionListKey(vm);
        var reactivePropertyList = fromMobxEntries.map(function (_a) {
            var key = _a.key, get = _a.get;
            var updateReactiveProperty = function (value) { _this.updateReactiveProperty(vm, key, value); };
            return _this.mobxMethods.reaction(function () { return get.call(vm); }, updateReactiveProperty, true);
        });
        this.changeDetector[reactivePropertyListKey] = reactivePropertyList;
    };
    ChangeDetector.prototype.removeReactionList = function (vm) {
        var reactivePropertyListKey = this._getReactionListKey(vm);
        this.changeDetector[reactivePropertyListKey].forEach(function (dispose) { return dispose(); });
        delete this.changeDetector[reactivePropertyListKey];
    };
    ChangeDetector.prototype._getReactionListKey = function (vm) {
        return vm._uid;
    };
    ChangeDetector.prototype._getReactivePropertyKey = function (vm, key) {
        return vm._uid + "." + key;
    };
    return ChangeDetector;
}());

function install(Vue, mobxMethods) {
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

function mapProps(store, propNames, mapProp) {
    var isArray = Array.isArray(propNames);
    return Object.keys(propNames).reduce(function (result, key) {
        var propAlias = isArray ? propNames[key] : key;
        var propName = propNames[key];
        return Object.assign(result, (_a = {},
            _a[propAlias] = mapProp(store, propName),
            _a));
        var _a;
    }, {});
}
function mapField(store, fieldDescription) {
    if (typeof fieldDescription === 'string') {
        return function () { return store[fieldDescription]; };
    }
    var fieldDescriptionGet = fieldDescription.get;
    var getter;
    if (typeof fieldDescriptionGet === 'function') {
        getter = function () { return fieldDescriptionGet.call(this, store); };
    }
    else {
        getter = function () { return store[fieldDescriptionGet]; };
    }
    var fieldDescriptionSet = fieldDescription.set;
    var setter;
    if (typeof fieldDescriptionSet === 'function') {
        setter = function (value) { fieldDescriptionSet.call(this, store, value); };
    }
    else if (typeof fieldDescriptionSet === 'string') {
        setter = function (value) { store[fieldDescriptionSet](value); };
    }
    return {
        get: getter,
        set: setter
    };
}
function mapFields(store, fieldNames) {
    return mapProps(store, fieldNames, mapField);
}
function mapMethod(store, methodName) {
    return store[methodName].bind(store);
}
function mapMethods(store, methodNames) {
    return mapProps(store, methodNames, mapMethod);
}
// helper method to use movue with vue-class-component
// It's not a good idea to introduce vue-class-component as either dependencies or peerDependencies,
// So we need to keep this method's logic compatible with vue-class-component's decorator logic.
// https://github.com/vuejs/vue-class-component/blob/2bc36c50551446972d4b423b2c69f9f6ebf21770/src/util.ts#L17
function FromMobx(target, key) {
    var Ctor = target.constructor;
    var decorators = Ctor.__decorators__ = Ctor.__decorators__ || [];
    decorators.push(function (options) {
        options.fromMobx = options.fromMobx || {};
        options.fromMobx[key] = options.computed[key];
        delete options.computed[key];
    });
}

var index = {
    install: install
};

exports['default'] = index;
exports.mapFields = mapFields;
exports.mapMethods = mapMethods;
exports.FromMobx = FromMobx;

Object.defineProperty(exports, '__esModule', { value: true });

})));

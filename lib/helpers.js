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
export function mapFields(store, fieldNames) {
    return mapProps(store, fieldNames, mapField);
}
function mapMethod(store, methodName) {
    return store[methodName].bind(store);
}
export function mapMethods(store, methodNames) {
    return mapProps(store, methodNames, mapMethod);
}
// helper method to use movue with vue-class-component
// It's not a good idea to introduce vue-class-component as either dependencies or peerDependencies,
// So we need to keep this method's logic compatible with vue-class-component's decorator logic.
// https://github.com/vuejs/vue-class-component/blob/2bc36c50551446972d4b423b2c69f9f6ebf21770/src/util.ts#L17
export function FromMobx(target, key) {
    var Ctor = target.constructor;
    var decorators = Ctor.__decorators__ = Ctor.__decorators__ || [];
    decorators.push(function (options) {
        options.fromMobx = options.fromMobx || {};
        options.fromMobx[key] = options.computed[key];
        delete options.computed[key];
    });
}
//# sourceMappingURL=helpers.js.map
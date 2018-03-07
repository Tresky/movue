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
export default ChangeDetector;
//# sourceMappingURL=change-detector.js.map
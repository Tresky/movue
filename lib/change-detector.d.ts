import VueClass from 'vue';
import { FromMobxEntry, IMobxMethods } from './types';
export default class ChangeDetector {
    defineReactive: Function;
    mobxMethods: IMobxMethods;
    changeDetector: VueClass;
    constructor(Vue: typeof VueClass, mobxMethods: IMobxMethods);
    defineReactiveProperty(vm: VueClass, key: string): void;
    getReactiveProperty(vm: VueClass, key: string): any;
    updateReactiveProperty(vm: VueClass, key: string, value: any): void;
    removeReactiveProperty(vm: VueClass, key: string): void;
    defineReactionList(vm: VueClass, fromMobxEntries: FromMobxEntry[]): void;
    removeReactionList(vm: VueClass): void;
    _getReactionListKey(vm: VueClass): string;
    _getReactivePropertyKey(vm: VueClass, key: string): string;
}

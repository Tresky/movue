import VueClass from 'vue';
import { IMobxMethods } from './types';
export { IMobxMethods };
declare module 'vue/types/options' {
    interface ComponentOptions<V extends VueClass> {
        fromMobx?: {
            [key: string]: (this: V) => any;
        };
    }
}
export default function install(Vue: typeof VueClass, mobxMethods: IMobxMethods): void;

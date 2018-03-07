export declare type Getter = () => any;
export declare type Setter = (value: any) => void;
export declare type VueComputed = Getter | {
    get: Getter;
    set: Setter;
};
export declare type FromMobxEntry = {
    key: string;
    get: Getter;
    set?: Setter;
};
export declare type Disposer = () => void;
export interface IMobxMethods {
    reaction: (getter: Getter, reaction: (value: any) => void, any) => Disposer;
}

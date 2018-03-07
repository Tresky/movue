import { Getter, Setter } from './types';
export declare type PropList<TPropType> = string[] | {
    [propAlias: string]: TPropType;
};
export declare type FieldDescription = {
    get: string | ((store: object) => any);
    set?: string | ((store: object, value: any) => void);
};
export declare type MappedField = Getter | {
    get: Getter;
    set?: Setter;
};
export declare type propMaper<TPropType, TResult> = (store: object, propName: TPropType) => TResult;
export declare function mapFields(store: object, fieldNames: PropList<string> | PropList<FieldDescription>): object;
export declare function mapMethods(store: object, methodNames: PropList<string>): object;
export declare function FromMobx(target: any, key: string): void;

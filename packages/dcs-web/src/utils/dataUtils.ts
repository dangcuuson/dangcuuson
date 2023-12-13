import _ from "lodash";

export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

export const isObj = (val: unknown): val is object => {
    return _.isObject(val);
};

export const makeString = <T extends string | undefined>(value: unknown, defaultVal: T) => {
    return typeof value === 'string' ? value : defaultVal;
};
export const makeNum = <T extends number | undefined>(value: unknown, defaultVal: T) => {
    return typeof value === 'number' ? value : defaultVal;
};
export const makeArr = <T>(args: {
    value: unknown,
    defaultVal?: T[],
    itemRestore: (item: unknown, index: number) => T | undefined
}): T[] => {
    const { value, itemRestore } = args;
    const defaultVal = args.defaultVal || [];

    if (_.isArray(value)) {
        const items = value.map((item, index) => itemRestore(item, index)).filter(isDefined);
        return items;
    } else {
        const item = itemRestore(value, 0);
        if (item) {
            return [item];
        }
    }
    return defaultVal;
};

export const hasStrField = <T extends string = string>(val: unknown, key: T): val is { [K in T]: string } => {
    if (!isObj(val)) {
        return false;
    }
    return typeof val[key as string] === 'string';
};

export const hasNumericStrField = <T extends string>(val: unknown, key: T): val is { [K in T]: string } => {
    if (!isObj(val)) {
        return false;
    }
    const field = val[key as string];
    return typeof field === 'string' && !!field && !isNaN(+field);
};

export const hasNumField = <T extends string>(val: unknown, key: T): val is { [K in T]: number } => {
    if (!isObj(val)) {
        return false;
    }
    return typeof val[key as string] === 'number';
};

export const hasStrArrField = <T extends string>(val: unknown, key: T): val is { [K in T]: string[] } => {
    if (!isObj(val)) {
        return false;
    }
    if (!hasArrField(val, key)) {
        return false;
    }
    return val[key].every(item => typeof item === 'string');
};

export const hasNumArrField = <T extends string>(val: unknown, key: T): val is { [K in T]: number[] } => {
    if (!isObj(val)) {
        return false;
    }
    if (!hasArrField(val, key)) {
        return false;
    }
    return val[key].every(item => typeof item === 'number');
};

export const hasArrField = <T extends string>(val: unknown, key: T): val is { [K in T]: any[] } => {
    if (!isObj(val)) {
        return false;
    }
    return _.isArray(val[key as string]);
};
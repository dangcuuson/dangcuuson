import _ from 'lodash';
import React from 'react';

// similar to use effect, the difference is that it won't
// trigger the first effect callback
export function useDidUpdate(
    effect: React.EffectCallback,
    dependencies?: any[]
) {
    const isFirstRef = React.useRef(true);
    React.useEffect(
        () => {
            if (isFirstRef.current) {
                isFirstRef.current = false;
            } else {
                return effect();
            }
        },
        dependencies
    );
}

export function useLocalStorage<T = string>(args: {
    key: string;
    getInitValue: (value: string | null) => T,
    stringify?: (value: T) => string
}): [T, React.Dispatch<React.SetStateAction<T>>] {
    const { key, getInitValue, stringify } = args;
    const [valueState, setValueState] = React.useState<T>(
        () => {
            const lsValue = localStorage.getItem(key);
            return getInitValue(lsValue);
        }
    )
    React.useEffect(
        () => {
            const strVal = stringify ? stringify(valueState) : (valueState + '');
            localStorage.setItem(key, strVal);
        },
        [valueState]
    )

    return [valueState, setValueState];
}

export function useIsWindowFocused() {
    const [isFocused, setIsFocused] = React.useState(document.hasFocus());
    React.useEffect(
        () => {
            const handleOnFocus = () => setIsFocused(true);
            const handleOnBlur = () => setIsFocused(false);
            window.addEventListener('focus', handleOnFocus);
            window.addEventListener('blur', handleOnBlur);
            return () => {
                window.removeEventListener('focus', handleOnFocus);
                window.removeEventListener('blur', handleOnBlur);
            }
        },
        []
    );
    return isFocused;
}

/**
 * Track if user has interacted with the site via click/touch
 * Mostly used for media autoplay
 */
export function useInteractionTracker(tracking: boolean) {
    const [count, setCount] = React.useState(0);
    React.useEffect(
        () => {
            const increaseCount = () => {
                if (tracking) {
                    setCount(p => p + 1)
                }
            };
            document.addEventListener('click', increaseCount);
            document.addEventListener('touchstart', increaseCount);
            return () => {
                document.removeEventListener('click', increaseCount);
                document.removeEventListener('touchstart', increaseCount);
            }
        },
        [tracking]
    );
    return count;
}

/**
 * Derived state from another value (e.g props)
 */
type MapStateFn<TState> = (prevState: TState | null) => TState;
export function useDerivedState<TState>(mapFn: MapStateFn<TState>, dependencies: any[]) {
    const [state, setState] = React.useState(() => mapFn(null));
    useDidUpdate(
        () => setState(prev => mapFn(prev)),
        dependencies
    );
    return [state, setState] as const;
}

// https://github.com/facebook/react/issues/16221
// basically allow we to replace object reference with custom equals
export function useCustomEqualIdentity<T>(value: T, customEquals: (x: T, y: T) => boolean): T {
    const copy = React.useRef(value);
    if (!customEquals(copy.current, value)) {
        copy.current = value;
    }
    return copy.current;
}

// this hook makes sure object does not change identity if deep comparison of prev & cur value are the same
export function useDeepEqualIdentity<T>(value: T): T {
    return useCustomEqualIdentity(value, _.isEqual);
}

const getWindowSize = () => {
    return {
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        outerHeight: window.outerHeight,
        outerWidth: window.outerWidth,
    };
};

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = React.useState(getWindowSize());

    // equivalent to componentDidMount & componentWillUnmount
    React.useEffect(
        () => {
            const handleResize = () => {
                setWindowSize(getWindowSize());
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        },
        []
    );

    return windowSize;
};

export const useForceUpdate = (): () => void => {
    const [, setState] = React.useState(0);
    return React.useCallback(
        () => setState(prev => prev + 1),
        [setState]
    );
};
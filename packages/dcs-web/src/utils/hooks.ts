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

type MapStateFn<TState> = (prevState: TState | null) => TState;
export function useDerivedState<TState>(mapFn: MapStateFn<TState>, dependencies: any[]) {
    const [state, setState] = React.useState(() => mapFn(null));
    useDidUpdate(
        () => setState(prev => mapFn(prev)),
        dependencies
    );
    return [state, setState] as const;
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
import { Hidden, HiddenProps } from '@mui/material';
import React from 'react';

type Props = HiddenProps & InnerProps;

const HiddenDetector: React.FC<Props> = props => {
    const { onVisible, onHide, ...hiddenProps } = props;
    return (
        <Hidden {...hiddenProps}>
            <InnerComponent onVisible={props.onVisible} onHide={props.onHide} />
        </Hidden>
    )
}

type InnerProps = {
    onVisible?: () => void;
    onHide?: () => void;
}
const InnerComponent: React.FC<InnerProps> = props => {
    React.useEffect(() => {
        props.onVisible?.();
        return () => {
            props.onHide?.();
        };
    }, []);
    return null;
}

export default HiddenDetector;
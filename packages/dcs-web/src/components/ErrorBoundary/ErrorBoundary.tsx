import React from 'react';
import ErrorBox from '../ErrorBox/ErrorBox';

interface Props {
    onClose?: () => void;
    onRetry?: () => void;
    children?: React.ReactNode;
}

interface State {
    error: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: '' };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: error + '' };
    }

    componentDidCatch(err: unknown, errInfo: React.ErrorInfo) {
        console.error(err);
    }

    closeError = (callback: () => void) => () => this.setState({ error: '' }, () => callback);

    render() {
        if (this.state.error) {
            return (
                <ErrorBox
                    error={this.state.error}
                    onClose={this.props.onClose ? this.closeError(this.props.onClose) : undefined}
                    onRetry={this.props.onRetry ? this.closeError(this.props.onRetry) : undefined}
                />
            );
        }

        return this.props.children || null;
    }
}
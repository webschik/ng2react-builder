import * as React from 'react';

export interface TestComponentProps {
    [key: string]: any;
}

const TestComponent: React.StatelessComponent<TestComponentProps> = (props) => {
    return <span>{localize(store, 'translation.key')}</span>;
};

export default TestComponent;

import * as React from 'react';

export interface TestComponentProps {
    [key: string]: any;
}

const TestComponent: React.StatelessComponent<TestComponentProps> = (props) => {
    return (
        <span title={localize('translation.label.555')} disabled={true} data-id="testId" data-name={'testName'}>
            {localize(store, 'translation.key')}
        </span>
    );
};

export default TestComponent;

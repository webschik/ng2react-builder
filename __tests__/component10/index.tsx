import * as React from 'react';

export interface TestComponentProps {
    [key: string]: any;
}

const TestComponent: React.StatelessComponent<TestComponentProps> = (props) => {
    return (
        <div>
            <p dangerouslySetInnerHTML={{__html: 'myHTML'}} />
            <pre dangerouslySetInnerHTML={{__html: `${salutation} ${name}!`}} />
            <pre dangerouslySetInnerHTML={{__html: "Hello 'world'!"}} />
            <pre dangerouslySetInnerHTML={{__html: 'Hello'}} />
        </div>
    );
};

export default TestComponent;

import * as React from 'react';

export default class TestComponent extends React.PureComponent<{}> {
    render() {
        return [
            orders.map((order, index) => {
                return (
                    <div key={`item-${index}child-0`}>
                        <span>{order.name}</span>
                    </div>
                );
            }),

            types.map((type, index, list) => {
                return [
                    <header key={`item-${index}child-2`}>Header {type}</header>,
                    <aside key={`item-${index}child-4`} className="sidebar">
                        Sidebar
                    </aside>,
                    <div key={`item-${index}child-6`} className="body">
                        Body {type}
                    </div>,
                    <footer key={`item-${index}child-8`}>Footer {list.length}</footer>
                ];
            }),

            <div key="child-10">
                {list.map((item, index) => {
                    return <div key={`item-${index}child-1`} />;
                })}
                ,
                <p key={`item-${index}child-3`} />,
                {list.map((item, index) => {
                    return [
                        <span key={`item-${index}child-5`} />,
                        <span key={`item-${index}child-7`} />,
                        <span key={`item-${index}child-9`} />
                    ];
                })}
            </div>
        ];
    }
}

import * as React from 'react';

export default class TestComponent extends React.PureComponent<{}> {
    render() {
        return [
            orders.map((order, index) => {
                return (
                    <div key={`item-${index}`}>
                        <span>{order.name}</span>
                    </div>
                );
            }),
            types.map((type, index, list) => {
                return [
                    <header key={`item-${index}`}>Header {type}</header>,
                    <aside key={`item-${index}`} className="sidebar">
                        Sidebar
                    </aside>,
                    <div key={`item-${index}`} className="body">
                        Body {type}
                    </div>,
                    <footer key={`item-${index}`}>Footer {list.length}</footer>
                ];
            })
        ];
    }
}

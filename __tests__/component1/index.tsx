import * as React from 'react';

export interface TestComponentProps {
    [key: string]: any;
}

export interface TestComponentState {
    [key: string]: any;
}

export default class TestComponent extends React.PureComponent<TestComponentProps, TestComponentState> {
    render() {
        return [
            formData.showStar ? (
                <button
                    key="child-0"
                    className="product-info-icon_star"
                    title={localize('translation.label.504')}
                    data-tooltip={`Product name: ${productInfo.name}`}
                    onClick={actions.toggleStatus}>
                    {formData.isFavourite ? <Icon type="star" /> : null}
                    {!formData.isFavourite ? <Icon type="star-o" /> : null}
                    {code} | {productInfo.name}
                </button>
            ) : null,

            !formData.showStar ? <div key="child-2" /> : null
        ];
    }
}

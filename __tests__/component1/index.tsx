import * as React from 'react';

export default class TestComponent extends React.PureComponent<{}> {
    render() {
        return formData.showStar ? (
            <button
                className="product-info-icon_star"
                title={localize('translation.label.504')}
                data-tooltip={`Product name: ${productInfo.name}`}
                onClick={actions.toggleStatus}>
                {formData.isFavourite ? <Icon type="star" /> : null}
                {!formData.isFavourite ? <Icon type="star-o" /> : null}
                {code} | {productInfo.name}
            </button>
        ) : null;
    }
}

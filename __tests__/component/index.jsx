import React from 'react';

export default class TestComponent extends React.PureComponent {
    render() {
        return formData.showStar ? (
            <button
                className="product-info-icon_star"
                title={localize('translation.label.504')}
                onClick={actions.toggleStatus}>
                {formData.isFavourite ? <Icon type="star" /> : null}
                {!formData.isFavourite ? <Icon type="star-o" /> : null}
            </button>
        ) : null;
    }
}

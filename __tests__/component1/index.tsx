import * as React from 'react';

export default class Component1 extends React.PureComponent<{}> {
    render () {
        const {formData, actions} = this.state;

        return (
            formData.showStar ? (
                <button className="product-info-icon_star"
                        title={localize('translation.label.504')}
                        onClick={actions.toggleStatus}>
                    {formData.isFavourite ? <span data-dg-icon="star"/> : null}
                    {!formData.isFavourite ? <span data-dg-icon="star-o"/> : null}
                </button>
            ) : null
        );
    }
}
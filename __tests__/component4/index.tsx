import * as React from 'react';
'use strict';

export interface PhoneListProps {
    [key: string]: any;
}

export interface PhoneListState {
    [key: string]: any;
}

class PhoneList extends React.Component<PhoneListProps, PhoneListState> {
    constructor (props: PhoneListProps, context?: any, $routeParams, Phone) {
        super(props, context);

        var self = this;
        self.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
            self.setImage(phone.images[0]);
        });

        self.setImage = function setImage(imageUrl) {
            self.mainImageUrl = imageUrl;
        };
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        {/*Sidebar content*/}

                        <p>
                            Search:
                            <input ng-model="$ctrl.query" />
                        </p>

                        <p>
                            Sort by:
                            <select ng-model="$ctrl.orderProp">
                                <option value="name">Alphabetical</option>
                                <option value="age">Newest</option>
                            </select>
                        </p>
                    </div>
                    <div className="col-md-10">
                        {/*Body content*/}

                        <ul className="phones">
                            {$ctrl.phones
                                .filter($ctrl.query)
                                .sort($ctrl.orderProp)
                                .map((phone, index: number) => {
                                    return (
                                        <li key={`item-${index}`} className="thumbnail phone-list-item">
                                            <a href={`#!/phones/${phone.id}`} className="thumb">
                                                <img src={phone.imageUrl} alt={phone.name} />
                                            </a>
                                            <a href={`#!/phones/${phone.id}`}>{phone.name}</a>
                                            <p>{phone.snippet}</p>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

// Register `phoneDetail` component, along with its associated controller and template
angular.
module('phoneDetail').
component('phoneDetail', {
    templateUrl: 'phone-detail/phone-detail.template.html',
    controller: ['$routeParams', 'Phone', PhoneList]
});
import * as React from 'react';
'use strict'; // Register `phoneDetail` component, along with its associated controller and template

export interface PhoneListProps {
    [key: string]: any;
}

export interface PhoneListState {
    [key: string]: any;
}

angular.module('phoneDetail').component('phoneDetail', {
    templateUrl: 'phone-detail/phone-detail.template.html',
    controller: [
        '$routeParams',
        'Phone',
        class PhoneList extends React.Component<PhoneListProps, PhoneListState> {
            constructor(props: PhoneListProps, context?: any, $routeParams, Phone) {
                super(props, context);

                var self = this;
                self.phone = Phone.get(
                    {
                        phoneId: $routeParams.phoneId
                    },
                    function(phone) {
                        self.setImage(phone.images[0]);
                    }
                );

                self.setImage = function setImage(imageUrl) {
                    self.mainImageUrl = imageUrl;
                };
            }
        }
    ]
});

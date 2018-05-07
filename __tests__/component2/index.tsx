import * as React from 'react';

export interface IconProps {
    [key: string]: any;
}

const Icon: React.StatelessComponent<IconProps> = (props) => {
    return (
        <span type={type} id={iconId} className={className} aria-disabled="">
            {order.value === -1 ? 'text' : number(order.value, {formatting: 'price'})}
        </span>
    );
};

export default Icon;

import * as React from 'react';

export interface IconProps {
    [key: string]: any;
}

const Icon: React.StatelessComponent<IconProps> = (props) => {
    return <span type={type} id={iconId} className={className} aria-disabled="" />;
};

export default Icon;

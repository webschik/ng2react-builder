import {AST} from 'parse5';

export default function ngToReactAttrs (attrs: AST.Default.Attribute[]) {
    return attrs.map((attr: AST.Default.Attribute) => {
        const preparedAttribute: AST.Default.Attribute = Object.assign({}, attr);

        switch (preparedAttribute.name) {
            case 'class':
                preparedAttribute.name = 'className';
                break;
            case 'for':
                preparedAttribute.name = 'htmlFor';
                break;
            default:
                preparedAttribute.name = preparedAttribute.name.replace('data-ng', 'ng');
        }

        return preparedAttribute;
    });

}
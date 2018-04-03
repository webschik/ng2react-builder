import {AST} from 'parse5';

export default function ngToReactAttrs (attrs: AST.Default.Attribute[]) {
    return attrs.map((attr: AST.Default.Attribute) => {
        return Object.assign({}, attr, {
            name: attr.name.replace('data-ng', 'ng')
        });
    });

}
import {parseFragment, treeAdapters, AST} from 'parse5';
import {Angular, AngularLexer, AngularParser} from '../index';
import ngToReactAttrs from './ng-to-react-attrs';

const {createElement, adoptAttributes} = treeAdapters.htmlparser2;
const treeAdapter: AST.TreeAdapter = Object.assign({}, treeAdapters.htmlparser2, {
    createElement (tagName: string, namespaceURI: string, attrs: AST.Default.Attribute[]) {
        return createElement.call(this, tagName, namespaceURI, ngToReactAttrs(attrs));
    },

    adoptAttributes (recipient: AST.Element, attrs: AST.Default.Attribute[]) {
        return adoptAttributes.call(this, recipient, ngToReactAttrs(attrs));
    }
});

export default function parseTemplate (angular: Angular, template: string) {
    const lexer: AngularLexer = new angular.Lexer({
        csp: false,
        expensiveChecks: false
    });
    const ngParser: AngularParser = new angular.AST(lexer, {
        literals: {
            true: true,
            false: false,
            null: null,
            undefined
        }
    });
    const fragment: AST.DocumentFragment = parseFragment(template, {
        treeAdapter
    });

    // const ast = ngParser.ast(template);

    // tslint:disable-next-line
    debugger;
}
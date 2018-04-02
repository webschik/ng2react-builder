import {parseFragment, treeAdapters, AST} from 'parse5';
import {Angular, AngularLexer, AngularParser, ComponentInfo, ComponentMethod} from '../index';
import ngToReactAttrs from './ng-to-react-attrs';

const Serializer = require('parse5/lib/serializer/index');
const defaultTreeAdapter: AST.TreeAdapter = treeAdapters.htmlparser2;
const {createElement, adoptAttributes} = defaultTreeAdapter;

export default function parseTemplate (angular: Angular, template: string): ComponentInfo {
    let outputTemplate: string = '';
    const methods: ComponentMethod[] = [];
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
    const treeAdapter: AST.TreeAdapter = Object.assign({}, defaultTreeAdapter, {
        createElement (tagName: string, namespaceURI: string, attrs: AST.Default.Attribute[]) {
            return createElement.call(this, tagName, namespaceURI, ngToReactAttrs(attrs));
        },

        adoptAttributes (recipient: AST.Element, attrs: AST.Default.Attribute[]) {
            return adoptAttributes.call(this, recipient, ngToReactAttrs(attrs));
        }
    });
    const fragment: AST.DocumentFragment = parseFragment(template, {
        treeAdapter
    });
    const serializer = new Serializer(fragment, {
        treeAdapter
    });
    const {_serializeElement} = serializer;

    serializer._serializeElement = function (node: AST.HtmlParser2.Element) {
        let condition: string = '';
        const {attribs} = node;
        const filteredAttibs: {[key: string]: string} = {};

        for (const name in attribs) {
            if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                const value: string = attribs[name];

                switch (name) {
                    case 'ng-if':
                    case 'ng-show':
                        condition += condition ? ` && ${ value }` : value;
                        break;
                    case 'ng-hide':
                        condition += condition ? ` && !${ value }` : `!${ value }`;
                        break;
                    default:
                        filteredAttibs[name] = value;
                }
            }
        }

        node.attribs = filteredAttibs;

        _serializeElement.apply(this, arguments);
    };

    serializer.serialize();

    // const ast = ngParser.ast(template);

    return {
        template: outputTemplate,
        methods
    };
}
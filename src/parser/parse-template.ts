import {parseFragment, treeAdapters, AST} from 'parse5';
import {ReactComponentOptions} from '../index';
import parseNgAttrs from './parse-ng-attrs';
import setReactTagName from './set-react-tag-name';
import serialize from '../serializer/serialize';

const defaultTreeAdapter: AST.TreeAdapter = treeAdapters.htmlparser2;
const {createElement, adoptAttributes} = defaultTreeAdapter;

export interface AngularIteratorInfo {
    valueIdentifier: string;
    collectionIdentifier: string;
    collectionTransform: string[];
    keyIdentifier?: string;
    aliasAs?: string;
}

export interface ASTElement extends AST.HtmlParser2.Element {
    reactTagName?: string;
    htmlEnd?: string;
    condition?: string;
    isIteratorChild?: boolean;
    isIteratorEnd?: boolean;
    isGroupIterator?: boolean;
    openedElementGroupsCount?: number;
    iteratorInfo?: AngularIteratorInfo;
}

export default function parseTemplate (template: string, componentOptions: ReactComponentOptions): string {
    const treeAdapter: AST.TreeAdapter = Object.assign({}, defaultTreeAdapter, {
        createElement (tagName: string, namespaceURI: string, attrs: AST.Default.Attribute[]) {
            const el: ASTElement = createElement.call(this, tagName, namespaceURI, attrs);

            setReactTagName(el, componentOptions);
            parseNgAttrs(el, componentOptions);

            return el;
        },
        adoptAttributes (el: ASTElement, attrs: AST.Default.Attribute[]) {
            adoptAttributes.call(this, el, attrs);

            setReactTagName(el, componentOptions);
            parseNgAttrs(el, componentOptions);
        }
    });
    const fragment: AST.HtmlParser2.DocumentFragment = parseFragment(template, {
        treeAdapter
    }) as AST.HtmlParser2.DocumentFragment;

    return serialize(fragment, {
        treeAdapter: Object.assign({}, treeAdapter, {
            getTagName (node: ASTElement) {
                return node.reactTagName || node.name;
            }
        })
    }, componentOptions);
}
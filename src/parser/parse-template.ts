import {parseFragment, treeAdapters, AST} from 'parse5';
import {ReactComponentOptions} from '../index';
import parseNgAttrs from './parse-ng-attrs';
import setReactTagName from './set-react-tag-name';
import serializeTemplate from '../serializer/serialize-template';

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

    return serializeTemplate(fragment, {
        treeAdapter: Object.assign({}, treeAdapter, {
            getTagName ({reactTagName, name}: ASTElement) {
                if (reactTagName) {
                    return reactTagName;
                }

                // It's a custom tag. Transform <my-custom-component /> to <MyCustomComponent />
                if (name.includes('-')) {
                    return name[0].toUpperCase() + name.slice(1).replace(/-([^\-])/g, (_: string, ch: string) => {
                        return ch.toUpperCase();
                    });
                }

                return name;
            }
        })
    }, componentOptions);
}
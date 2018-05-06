import * as ts from 'typescript';
import {ComponentOptions, TransformOptions} from '../index';

type FunctionNode = ts.FunctionDeclaration|ts.FunctionExpression;
type ClassNode = ts.ClassDeclaration|ts.ClassExpression;

class Replacement {
    constructor (readonly start: number, readonly end: number, readonly text = '', readonly priority = 0) {
    }

    static insert (pos: number, text: string, priority = 0) {
        return new Replacement(pos, pos, text, priority);
    }

    static delete (start: number, end: number) {
        return new Replacement(start, end, '');
    }
}

// https://github.com/urish/typewiz/blob/master/packages/typewiz-core/src/replacement.ts
function applyReplacements (source: string, replacements: Replacement[]) {
    replacements = replacements.sort((r1, r2) => {
        return r2.end !== r1.end ?
            r2.end - r1.end :
            r1.start !== r2.start ?
                r2.start - r1.start :
                r1.priority - r2.priority;
    });

    for (const replacement of replacements) {
        source = source.slice(0, replacement.start) + replacement.text + source.slice(replacement.end);
    }

    return source;
}

function createClassDeclaration (
    node: ClassNode|FunctionNode,
    componentPropsInterface: string,
    componentStateInterface: string,
    {componentType, componentName}: ComponentOptions,
    {react: {typescript}}: TransformOptions
): string {
    const {heritageClauses} = node as ClassNode;
    let heritageClause: string = '';

    if (!heritageClauses || !heritageClauses[0]) {
        heritageClause = ` extends React.${ componentType === 'pure' ? 'PureComponent' : 'Component' }${ typescript ?
            `<${ componentPropsInterface }, ${ componentStateInterface }>` :
            ''
            }`;
    }

    return `class ${ componentName } ${ heritageClause }`;
}

function createInterfaceDeclaration (name: string) {
    return `export interface ${ name } {[key: string]: any}`;
}

function removeNode (node: ts.Node): Replacement {
    return Replacement.delete(node.getStart(), node.getEnd());
}

export default function transformController (
    componentOptions: ComponentOptions,
    jsxResult: string,
    transformOptions: TransformOptions
): string {
    const {typescript} = transformOptions.react;
    const {controller, componentName} = componentOptions;
    const componentPropsInterface: string = `${ componentName }Props`;
    const componentStateInterface: string = `${ componentName }State`;
    const controllerName: string = controller.name;
    const sourceCode: string = controller.code;
    const replacements: Replacement[] = [];
    const sourceFile: ts.SourceFile = ts.createSourceFile(
        'controller.ts',
        sourceCode,
        ts.ScriptTarget.Latest,
        true
    );
    let lastRootImportEnd: number;

    function createConstructorDeclaration (parameters: ReadonlyArray<ts.ParameterDeclaration>) {
        let parametersStart: number;
        let parametersEnd: number;

        if (parameters[0]) {
            parametersStart = parameters[0].getStart();
            parametersEnd = parameters[parameters.length - 1].getEnd();
        }

        return `constructor (
            props${ typescript ? `:${ componentPropsInterface }` : '' },
            context${ typescript ? '?:any' : ''}${ parametersStart == null ?
                '' :
                `, /* ${ sourceCode.slice(parametersStart, parametersEnd) } */`
            }
        ) {super(props, context);\n`;
    }

    function isControllerDeclaration (node: ts.Node) {
        const {name} = node as FunctionNode|ClassNode;

        return Boolean(name && name.text === controllerName);
    }

    function traverse (node: ts.Node, replacements: Replacement[]) {
        switch (node.kind) {
            case ts.SyntaxKind.ReturnStatement: {
                const {parent} = node;

                if (parent && isControllerDeclaration(parent)) {
                    replacements.push(removeNode(node));
                }

                break;
            }
            case ts.SyntaxKind.ImportDeclaration: {
                const {parent} = node;

                if (parent && parent.kind === ts.SyntaxKind.SourceFile) {
                    lastRootImportEnd = node.getEnd();
                }

                break;
            }
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.FunctionDeclaration: {
                const fnNode: FunctionNode = node as FunctionNode;

                if (isControllerDeclaration(node)) {
                    const {body, parameters} = fnNode;
                    const declarationStart: number = fnNode.getStart();
                    const bodyStart: number = body.getStart();
                    const bodyEnd: number = body.getEnd();

                    replacements.push(
                        Replacement.delete(declarationStart, bodyStart),
                        Replacement.insert(declarationStart, createClassDeclaration(
                            fnNode,
                            componentPropsInterface,
                            componentStateInterface,
                            componentOptions,
                            transformOptions
                        )),
                        Replacement.insert(bodyStart + 1, createConstructorDeclaration(parameters)),
                        Replacement.insert(bodyEnd - 1, `}\n\nrender () {return ${ jsxResult };}`)
                    );
                }

                break;
            }
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.ClassExpression: {
                const classNode: ClassNode = node as ClassNode;

                if (isControllerDeclaration(node)) {
                    const {name, members} = classNode;
                    const declarationStart: number = classNode.getStart();
                    const nameEnd: number = name.getEnd();

                    replacements.push(
                        Replacement.delete(declarationStart, nameEnd),
                        Replacement.insert(declarationStart, createClassDeclaration(
                            classNode,
                            componentPropsInterface,
                            componentStateInterface,
                            componentOptions,
                            transformOptions
                        )),
                        Replacement.insert(classNode.getEnd() - 1, `\nrender () {return ${ jsxResult };}`)
                    );

                    members.some((node: ts.ClassElement) => {
                        if (node.kind === ts.SyntaxKind.Constructor) {
                            const {parameters, body} = node as ts.ConstructorDeclaration;
                            const nodeStart: number = node.getStart();
                            const nodeEnd: number = node.getEnd();
                            const bodyStart: number = body.getStart();
                            const bodyEnd: number = body.getEnd();

                            replacements.push(
                                Replacement.delete(nodeStart, nodeEnd),
                                Replacement.insert(nodeStart, `
                                    ${ createConstructorDeclaration(parameters) }
                                    ${ sourceCode.slice(bodyStart + 1, bodyEnd + 1) }
                                `)
                            );

                            return true;
                        }

                        return false;
                    });
                }

                break;
            }
            default:
            //
        }

        ts.forEachChild(node, (node: ts.Node) => traverse(node, replacements));
    }

    traverse(sourceFile, replacements);

    if (typescript) {
        replacements.push(Replacement.insert(
            lastRootImportEnd == null ? 0 : lastRootImportEnd,
            `
                \n${ createInterfaceDeclaration(componentPropsInterface) }
                \n${ createInterfaceDeclaration(componentStateInterface) }\n
            `
        ));
    }

    return applyReplacements(sourceCode, replacements)
        .replace(/["']ngInject["'];?/g, '')
        .replace(new RegExp(controllerName, 'g'), componentName);
}
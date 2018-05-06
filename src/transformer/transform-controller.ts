import * as ts from 'typescript';
import {ComponentOptions, TransformOptions} from '../index';

type FunctionNode = ts.FunctionDeclaration|ts.FunctionExpression;

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
    node: ts.ClassDeclaration|FunctionNode,
    componentPropsInterface: string,
    componentStateInterface: string,
    componentOptions: ComponentOptions,
    {react: {typescript}}: TransformOptions
): string {
    const {heritageClauses} = node as ts.ClassDeclaration;
    const heritageClause: string = heritageClauses ?
        '' :
        ` extends React.${ componentOptions.componentType === 'pure' }${ typescript ?
            `<${ componentPropsInterface }, ${ componentStateInterface }>` :
            ''
            }`;

    return `class ${ componentOptions.componentName }${ heritageClause }`;
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
    const {controller, componentName, componentType} = componentOptions;
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

    function isControllerFunction (node: ts.Node) {
        const {name} = node as FunctionNode;

        return Boolean(name && name.text === controllerName);
    }

    function traverse (node: ts.Node, replacements: Replacement[]) {
        switch (node.kind) {
            case ts.SyntaxKind.ExpressionStatement:
                const {expression} = node as ts.ExpressionStatement;
                const {text} = expression as ts.StringLiteral;

                if (expression.kind === ts.SyntaxKind.StringLiteral && text && text.indexOf('ng') === 0) {
                    replacements.push(removeNode(node));
                }

                break;
            case ts.SyntaxKind.ReturnStatement:
                const {parent} = node;

                if (parent && isControllerFunction(parent)) {
                    replacements.push(removeNode(node));
                }

                break;
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.FunctionDeclaration: {
                const fnNode: FunctionNode = node as FunctionNode;

                if (isControllerFunction(node)) {
                    const {body, parameters} = fnNode;
                    const declarationStart: number = fnNode.getStart();
                    const bodyStart: number = body.getStart();
                    const bodyEnd: number = body.getEnd();
                    let parametersStart: number;
                    let parametersEnd: number;

                    if (parameters[0]) {
                        parametersStart = parameters[0].getStart();
                        parametersEnd = parameters[parameters.length - 1].getEnd();
                    }

                    replacements.push(
                        Replacement.delete(declarationStart, bodyStart),
                        Replacement.insert(declarationStart, createClassDeclaration(
                            fnNode,
                            componentPropsInterface,
                            componentStateInterface,
                            componentOptions,
                            transformOptions
                        )),
                        Replacement.insert(
                            bodyStart + 1,
                            `constructor (
                                props${ typescript ? `:${ componentPropsInterface }` : '' },
                                context${ typescript ? ':?any' : ''}${ parametersStart == null ?
                                '' :
                                `, /* ${ sourceCode.slice(parametersStart, parametersEnd) } */` }
                            ) {super(props, context);`
                        ),
                        Replacement.insert(bodyEnd - 1, `return (${ jsxResult });}`)
                    );
                }

                break;
            }
            case ts.SyntaxKind.ClassDeclaration: {
                const {name} = node as ts.ClassDeclaration;

                if (name && name.text === controllerName) {
                    //
                }

                break;
            }
            default:
            //
        }

        ts.forEachChild(node, (node: ts.Node) => traverse(node, replacements));
    }

    traverse(sourceFile, replacements);

    return applyReplacements(sourceCode, replacements).replace(new RegExp(controllerName, 'g'), componentName);
}
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {createReactComponent} from '../src';

const readFile = promisify(fs.readFile);

describe('createReactComponent()', () => {
    function getSources (path1: string, path2: string): Promise<[string, string]> {
        return Promise.all([
            readFile(path.resolve(__dirname, path1), 'utf8'),
            readFile(path.resolve(__dirname, path2), 'utf8')
        ]);
    }

    xdescribe('component1', () => {
        it('should generate TSX component', () => {
            return getSources(
                './component1/template.html',
                './component1/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    replaceDirectives: {
                        'my-icon': {
                            tagName: 'Icon',
                            valueProp: 'type'
                        }
                    },
                    react: {
                        typescript: true,
                        componentName: 'TestComponent'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });

    xdescribe('component2', () => {
        it('should generate TSX component', () => {
            return getSources(
                './component2/template.html',
                './component2/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'Icon',
                        componentType: 'stateless'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });

    describe('component3', () => {
        it('should generate TSX component', () => {
            return getSources(
                './component3/template.html',
                './component3/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'TestComponent'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });

    xdescribe('component4', () => {
        it('should generate TSX component', () => {
            return getSources(
                './component4/template.html',
                './component4/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'PhoneList'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });

    xdescribe('component5', () => {
        it('should generate TSX component', () => {
            return getSources(
                './component5/template.html',
                './component5/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'PhoneDetail'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});
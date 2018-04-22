import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component7', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component7/template.html',
                './component7/controller.js',
                './component7/index.tsx'
            ).then(([template, controllerCode, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template,
                            controller: {
                                name: 'ArticleCtrl',
                                code: controllerCode
                            },
                            componentName: 'RealWorld'
                        }
                    ]
                });

                expect(generatedCode).toEqual([expectedCode]);
            });
        });
    });
});
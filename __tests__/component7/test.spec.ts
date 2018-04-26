import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component7', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component7/template.html',
                './component7/controller.js',
                './component7/index.tsx'
            ).then(([template, controllerCode, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            controller: {
                                name: 'ArticleCtrl',
                                code: controllerCode
                            },
                            componentName: 'RealWorldComponent'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});
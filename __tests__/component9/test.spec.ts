import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component9', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component9/template.html',
                './component9/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    directivesToTextNodes: {
                        i18n: {
                            callee: 'localize',
                            calleeArguments: ['store']
                        }
                    },
                    components: [
                        {
                            template: {code: template},
                            componentName: 'TestComponent',
                            componentType: 'stateless'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});
import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component10', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component10/template.html',
                './component10/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
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
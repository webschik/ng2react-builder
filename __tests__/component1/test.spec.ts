import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component1', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component1/template.html',
                './component1/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    replaceDirectives: {
                        'my-icon': {
                            tagName: 'Icon',
                            valueProp: 'type'
                        }
                    },
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            componentName: 'TestComponent'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});
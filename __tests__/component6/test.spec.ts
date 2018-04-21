import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component6', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component6/template.html',
                './component6/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'PhoneDetail'
                    },
                    replaceDirectives: {
                        'ng-view': {
                            tagName: 'Switch'
                        }
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});
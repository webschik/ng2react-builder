import {Angular, AngularLexer, AngularParser, initAngular} from '../../src/angular';
import stringifyNgExpression from '../../src/serializer/stringify-ng-expression';

describe('Serializer', () => {
    describe('stringifyNgExpression()', () => {
        const angular: Angular = initAngular();
        const lexer: AngularLexer = new angular.Lexer({
            csp: false,
            expensiveChecks: false
        });
        const ngParser: AngularParser = new angular.AST(lexer, {
            literals: {
                true: true,
                false: false,
                null: null,
                undefined
            }
        });

        it('should stringify call expression', () => {
            expect(stringifyNgExpression(ngParser, 'ctrl.run(arg1, arg2)')).toBe('ctrl.run(arg1, arg2)');
            expect(stringifyNgExpression(ngParser, 'ctrl.run()')).toBe('ctrl.run()');
            expect(stringifyNgExpression(ngParser, 'run()')).toBe('run()');
        });

        it('should stringify conditional expression', () => {
            expect(stringifyNgExpression(ngParser, 'test ? log(1) : log(1)')).toBe('test ? log(1) : log(1)');
            expect(stringifyNgExpression(ngParser, 'test ? undefined : "hello"')).toBe('test ? undefined : \'hello\'');
        });

        it('should stringify logical expression', () => {
            expect(stringifyNgExpression(ngParser, 'name || "hello"')).toBe('name || \'hello\'');
        });

        it('should stringify binary expression', () => {
            expect(stringifyNgExpression(ngParser, 'a == b')).toBe('a == b');
        });

        it('should not touch invalid expression', () => {
            expect(stringifyNgExpression(ngParser, '{{exp}}')).toBe('{{exp}}');
        });
    });
});
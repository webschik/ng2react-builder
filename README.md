# ng2react
[![Build Status](https://secure.travis-ci.org/webschik/ng2react.png?branch=master)](https://travis-ci.org/webschik/ng2react)
[![npm](https://img.shields.io/npm/dm/ng2react.svg)](https://www.npmjs.com/package/ng2react)
[![npm](https://img.shields.io/npm/v/ng2react.svg)](https://www.npmjs.com/package/ng2react)
[![npm](https://img.shields.io/npm/l/ng2react.svg)](https://www.npmjs.com/package/ng2react)
[![Coverage Status](https://coveralls.io/repos/github/webschik/ng2react/badge.svg?branch=master)](https://coveralls.io/github/webschik/ng2react?branch=master)

This module will help you to migrate [Angular 1](https://angularjs.org/) project
to [React.js](https://reactjs.org/)

## Examples
Check my [test components](__tests__) to see how this module works. There are:
* [Angular1 template](__tests__/component5/template.html)
* Generated component in [Typescript (TSX)](__tests__/component5/index.tsx)

## Usage
```shell
npm i -D ng2react
```

### via API
```js
import {createReactComponent} from 'ng2react';

createReactComponent({
    template: `<my-icon="user" class="icon"/>`,
    replaceDirectives: {
        'my-icon': {
            tagName: 'MyReactIcon',
            valueProp: 'type'
        }
    },
    react: {
        typescript: true,
        componentType: 'stateless',
        componentName: 'TestComponent'
    }
});
/*
    import * as React from 'react';

    const TestComponent: React.StatelessComponent<{}> = (props) => {
        return <MyReactIcon type="user" className="icon" />;
    };

    export default TestComponent;
*/

```

Method `createReactComponent` takes the next options:
* `template` **[required]** - string with Angular template
* `react` **[required]** - React component options
* `react.componentName` **[required]** - React component name
* `react.typescript` **[optional]** - output should be in Typescript. Default is **false**
* `react.componentType` **[optional]** - 'pure', 'stateless', 'stateful'.  Default is **pure**
* `replaceDirectives` **[optional]** - directives that you want to replace. It support tag names and attributes
* `prettier` **[optional]** - [Prettier config](https://prettier.io/docs/en/options.html)

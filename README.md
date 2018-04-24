# ng2react-builder
[![Build Status](https://secure.travis-ci.org/webschik/ng2react-builder.png?branch=master)](https://travis-ci.org/webschik/ng2react-builder)
[![npm](https://img.shields.io/npm/dm/ng2react-builder.svg)](https://www.npmjs.com/package/ng2react-builder)
[![npm](https://img.shields.io/npm/v/ng2react-builder.svg)](https://www.npmjs.com/package/ng2react-builder)
[![npm](https://img.shields.io/npm/l/ng2react-builder.svg)](https://www.npmjs.com/package/ng2react-builder)
[![Coverage Status](https://coveralls.io/repos/github/webschik/ng2react-builder/badge.svg?branch=master)](https://coveralls.io/github/webschik/ng2react-builder?branch=master)

This module will help you to migrate [Angular 1](https://angularjs.org/) project
to [React.js](https://reactjs.org/)

## Examples
Check my [test components](__tests__) to see how this module works. There are:
* [Angular1 template](__tests__/component5/template.html)
* Generated component in [Typescript (TSX)](__tests__/component5/index.tsx)

## Usage
```shell
npm i -D ng2react-builder
```

### via API
```js
import {transform} from 'ng2react-builder';

transform({
    replaceDirectives: {
        'my-icon': {
            tagName: 'MyReactIcon',
            valueProp: 'type'
        }
    },
    react: {
        typescript: true
    },
    components: [
        {
            componentType: 'stateless',
            componentName: 'TestComponent',
            template: {
                code: `
                    <div ng-app="todomvc">
                        <ng-view></ng-view>
                        <section class="todoapp">
                            <header class="header">
                                <h1>todos</h1>
                                <form class="todo-form" ng-submit="addTodo()">
                                    <input class="new-todo" placeholder="What needs to be done?" ng-model="newTodo" ng-disabled="saving"                                  autofocus>
                                </form>
                            </header>
                            <section class="main" ng-show="todos.length" ng-cloak>
                                <input id="toggle-all" class="toggle-all" type="checkbox" ng-model="allChecked"
                                        ng-click="markAll(allChecked)">
                                <label for="toggle-all">Mark all as complete</label>
                                <ul class="todo-list">
                                    <li ng-repeat="todo in todos | filter:statusFilter track by $index" ng-class="{completed: 
                                        todo.completed, editing: todo == editedTodo}">
                                        <div class="view">
                                            <input class="toggle" type="checkbox" ng-model="todo.completed"
                                                   ng-change="toggleCompleted(todo)">
                                            <label ng-dblclick="editTodo(todo)">{{todo.title}}</label>
                                            <button class="destroy" ng-click="removeTodo(todo)"></button>
                                        </div>
                                        <form ng-submit="saveEdits(todo, 'submit')">
                                            <input class="edit" ng-trim="false" ng-model="todo.title" todo-escape="revertEdits(todo)"
                                                   ng-blur="saveEdits(todo, 'blur')" todo-focus="todo == editedTodo">
                                        </form>
                                    </li>
                                </ul>
                            </section>
                            <footer class="footer" ng-show="todos.length" ng-cloak>
                                        <span class="todo-count"><strong>{{remainingCount}}</strong>
                                            <ng-pluralize count="remainingCount" when="{ one: 'item left', other: 'items left' }">
                                            </ng-pluralize>
                                        </span>
                                <ul class="filters">
                                    <li>
                                        <a ng-class="{selected: status == ''} " href="#/">All</a>
                                    </li>
                                    <li>
                                        <a ng-class="{selected: status == 'active'}" href="#/active">Active</a>
                                    </li>
                                    <li>
                                        <a ng-class="{selected: status == 'completed'}" href="#/completed">Completed</a>
                                    </li>
                                </ul>
                                <button class="clear-completed" ng-click="clearCompletedTodos()" ng-show="completedCount">
                                    Clear completed
                                </button>
                            </footer>
                        </section>
                        <footer class="info">
                            <p>Double-click to edit a todo</p>
                            <p>Credits:
                                <a href="http://twitter.com/cburgdorf">Christoph Burgdorf</a>,
                                <a href="http://ericbidelman.com">Eric Bidelman</a>,
                                <a href="http://jacobmumm.com">Jacob Mumm</a> and
                                <a href="http://blog.igorminar.com">Igor Minar</a>
                            </p>
                            <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
                        </footer>
                    </div>
                `
            }   
        }
    ]
});
/*
[{
code: `
import * as React from 'react';

export default class PhoneDetail extends React.PureComponent<{}> {
    render() {
        return (
            <div ng-app="todomvc">
                <Switch />
                <section className="todoapp">
                    <header className="header">
                        <h1>todos</h1>
                        <form className="todo-form" onSubmit={addTodo}>
                            <input
                                className="new-todo"
                                placeholder="What needs to be done?"
                                ng-model="newTodo"
                                disabled="saving"
                                autoFocus=""
                            />
                        </form>
                    </header>
                    {todos.length ? (
                        <section className="main">
                            <input
                                id="toggle-all"
                                className="toggle-all"
                                type="checkbox"
                                ng-model="allChecked"
                                onClick={markAll.bind(this, allChecked)}
                            />
                            <label htmlFor="toggle-all">Mark all as complete</label>
                            <ul className="todo-list">
                                {todos.filter(statusFilter).map((todo, index: number) => {
                                    return (
                                        <li
                                            key={\`item-${index}\`}
                                            className="{completed: todo.completed, editing: todo == editedTodo}">
                                            <div className="view">
                                                <input
                                                    className="toggle"
                                                    type="checkbox"
                                                    ng-model="todo.completed"
                                                    onChange={toggleCompleted.bind(this, todo)}
                                                />
                                                <label onDoubleClick={editTodo.bind(this, todo)}>{todo.title}</label>
                                                <button className="destroy" onClick={removeTodo.bind(this, todo)} />
                                            </div>
                                            <form onSubmit={saveEdits.bind(this, todo, 'submit')}>
                                                <input
                                                    className="edit"
                                                    ng-trim="false"
                                                    ng-model="todo.title"
                                                    todo-escape="revertEdits(todo)"
                                                    onBlur={saveEdits.bind(this, todo, 'blur')}
                                                    todo-focus="todo == editedTodo"
                                                />
                                            </form>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ) : null}
                    {todos.length ? (
                        <footer className="footer">
                            <span className="todo-count">
                                <strong>{remainingCount}</strong>
                                <ng-pluralize count="remainingCount" when="{ one: 'item left', other: 'items left' }" />
                            </span>
                            <ul className="filters">
                                <li>
                                    <a className="{selected: status == ''} " href="#/">
                                        All
                                    </a>
                                </li>
                                <li>
                                    <a className="{selected: status == 'active'}" href="#/active">
                                        Active
                                    </a>
                                </li>
                                <li>
                                    <a className="{selected: status == 'completed'}" href="#/completed">
                                        Completed
                                    </a>
                                </li>
                            </ul>
                            {completedCount ? (
                                <button className="clear-completed" onClick={clearCompletedTodos}>
                                    Clear completed
                                </button>
                            ) : null}
                        </footer>
                    ) : null}
                </section>
                <footer className="info">
                    <p>Double-click to edit a todo</p>
                    <p>
                        Credits:
                        <a href="http://twitter.com/cburgdorf">Christoph Burgdorf</a>,
                        <a href="http://ericbidelman.com">Eric Bidelman</a>,
                        <a href="http://jacobmumm.com">Jacob Mumm</a> and
                        <a href="http://blog.igorminar.com">Igor Minar</a>
                    </p>
                    <p>
                        Part of <a href="http://todomvc.com">TodoMVC</a>
                    </p>
                </footer>
            </div>
        );
    }
}
`
}]
*/

```

Method `transform` takes the next options:
* `components` **[required]** - list of components options
* `components[i].componentName` **[required]** - React component name
* `components[i].template` **[optional]** - info over Angular template
* `components[i].template.code` **[optional]** - string with Angular template
* `components[i].controller` **[optional]** - info over Angular Controller
* `components[i].componentType` **[optional]** - 'pure', 'stateless', 'stateful'.  Default is **pure**
* `replaceDirectives` **[optional]** - directives that you want to replace. It support tag names and attributes
* `react` **[optional]** - React component options
* `react.typescript` **[optional]** - output should be in Typescript. Default is **false**
* `react.prettier` **[optional]** - [Prettier config](https://prettier.io/docs/en/options.html)

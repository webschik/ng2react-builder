import * as React from 'react';

export interface PhoneDetailProps {
    [key: string]: any;
}

export interface PhoneDetailState {
    [key: string]: any;
}

export default class PhoneDetail extends React.PureComponent<PhoneDetailProps, PhoneDetailState> {
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
                                            key={`item-${index}`}
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
                                <NgPluralize count="remainingCount" when="{ one: 'item left', other: 'items left' }" />
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

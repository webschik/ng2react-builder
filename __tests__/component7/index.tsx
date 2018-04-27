import * as React from 'react';
import marked from 'marked';

export interface RealWorldComponentProps {
    [key: string]: any;
}

export interface RealWorldComponentState {
    [key: string]: any;
}

class RealWorldComponent extends React.PureComponent<RealWorldComponentProps, RealWorldComponentState> {
    constructor(props: RealWorldComponentProps, context?: any /*, article, User, Comments, $sce, $rootScope, */) {
        super(props, context);

        this.article = article;
        this._Comments = Comments;
        this.currentUser = User.current;
        $rootScope.setPageTitle(this.article.title);
        this.article.body = $sce.trustAsHtml(
            marked(this.article.body, {
                sanitize: true
            })
        );
        Comments.getAll(this.article.slug).then((comments) => (this.comments = comments));
        this.resetCommentForm();
    }

    resetCommentForm() {
        this.commentForm = {
            isSubmitting: false,
            body: '',
            errors: []
        };
    }

    addComment() {
        this.commentForm.isSubmitting = true;

        this._Comments.add(this.article.slug, this.commentForm.body).then(
            (comment) => {
                this.comments.unshift(comment);
                this.resetCommentForm();
            },
            (err) => {
                this.commentForm.isSubmitting = false;
                this.commentForm.errors = err.data.errors;
            }
        );
    }

    deleteComment(commentId, index) {
        this._Comments.destroy(commentId, this.article.slug).then((success) => {
            this.comments.splice(index, 1);
        });
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-light">
                    <div className="container">
                        <NavLink className="navbar-brand" to="app.home" ng-bind="::$ctrl.appName | lowercase" />

                        {/* Show this for logged out users */}
                        <ul show-authed="false" className="nav navbar-nav pull-xs-right">
                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.home">
                                    Home
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.login">
                                    Sign in
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.register">
                                    Sign up
                                </NavLink>
                            </li>
                        </ul>

                        {/* Show this for logged in users */}
                        <ul show-authed="true" className="nav navbar-nav pull-xs-right">
                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.home">
                                    Home
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.editor">
                                    <i className="ion-compose" />&nbsp;New Article
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink className="nav-link" activeClassName="active" to="app.settings">
                                    <i className="ion-gear-a" />&nbsp;Settings
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    activeClassName="active"
                                    to="app.profile.main({ username: $ctrl.currentUser.username})">
                                    <img src={$ctrl.currentUser.image} className="user-pic" />
                                    {$ctrl.currentUser.username}
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="editor-page">
                    <div className="container page">
                        <div className="row">
                            <div className="col-md-10 offset-md-1 col-xs-12">
                                <ListErrors errors="$ctrl.errors" />

                                <form>
                                    <fieldset disabled={$ctrl.isSubmitting}>
                                        <fieldset className="form-group">
                                            <input
                                                className="form-control form-control-lg"
                                                value={$ctrl.article.title}
                                                type="text"
                                                placeholder="Article Title"
                                            />
                                        </fieldset>

                                        <fieldset className="form-group">
                                            <input
                                                className="form-control"
                                                value={$ctrl.article.description}
                                                type="text"
                                                placeholder="What's this article about?"
                                            />
                                        </fieldset>

                                        <fieldset className="form-group">
                                            <textarea
                                                className="form-control"
                                                rows={8}
                                                value={$ctrl.article.body}
                                                placeholder="Write your article (in markdown)">
                                                {' '}
                                            </textarea>
                                        </fieldset>

                                        <fieldset className="form-group">
                                            <input
                                                className="form-control"
                                                type="text"
                                                placeholder="Enter tags"
                                                value={$ctrl.tagField}
                                                onKeyUp={$event.keyCode == 13 && $ctrl.addTag}
                                            />

                                            <div className="tag-list">
                                                {$ctrl.article.tagList.map((tag, index: number) => {
                                                    return (
                                                        <span key={`item-${index}`} className="tag-default tag-pill">
                                                            <i
                                                                className="ion-close-round"
                                                                onClick={$ctrl.removeTag.bind(this, tag)}
                                                            />
                                                            {tag}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>

                                        <button
                                            className="btn btn-lg pull-xs-right btn-primary"
                                            type="button"
                                            onClick={$ctrl.submit}>
                                            Publish Article
                                        </button>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <footer>
                    <div className="container">
                        <NavLink className="logo-font" to="app.home" ng-bind="::$ctrl.appName | lowercase" />
                        <span className="attribution">
                            © {date($ctrl.date, 'yyyy')}. An interactive learning project from{' '}
                            <a href="https://thinkster.io">Thinkster</a>. Code licensed under MIT.
                        </span>
                    </div>
                </footer>
            </div>
        );
    }
}

export default RealWorldComponent;

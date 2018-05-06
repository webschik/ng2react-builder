import * as React from 'react';

export interface ContactDetailProps {
    [key: string]: any;
}

export interface ContactDetailState {
    [key: string]: any;
}

class ContactDetail extends React.Component<ContactDetailProps, ContactDetailState> {
    constructor(props: ContactDetailProps, context?: any) {
        super(props, context);

        var ctrl = this;
        ctrl.$onInit = function() {
            ctrl.isNewContact = !ctrl.contact.$id;
        };
        ctrl.saveContact = function() {
            ctrl.onSave({
                $event: {
                    contact: ctrl.contact
                }
            });
        };
        ctrl.updateContact = function() {
            ctrl.onUpdate({
                $event: {
                    contact: ctrl.contact
                }
            });
        };
        ctrl.deleteContact = function() {
            ctrl.onDelete({
                $event: {
                    contact: ctrl.contact
                }
            });
        };
        ctrl.tagChange = function(event) {
            ctrl.contact.tag = event.tag;
            ctrl.updateContact();
        };
    }
    render() {
        return (
            <div className="contact">
                <form name="contactDetailForm" noValidate={true}>
                    <div>
                        <span className="contact__required">*</span> field is required
                    </div>
                    <div className="contact__box">
                        <h3 className="contact__sub-title">Personal</h3>
                        <div className="contact__field">
                            <label>
                                Name <span className="contact__required">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                length-check=""
                                required={true}
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.name}
                            />
                        </div>
                        <div className="contact__field">
                            <label>
                                Email
                                {!!contactDetailForm.email.$error.email ? (
                                    <span className="contact__error">Must be a valid email</span>
                                ) : null}
                            </label>
                            <input
                                type="email"
                                name="email"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.email}
                            />
                        </div>
                        <div className="contact__field">
                            <label>Job title</label>
                            <input
                                type="text"
                                name="jobTitle"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.job}
                            />
                        </div>
                        <div className="contact__field">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.location}
                            />
                        </div>
                    </div>
                    <div className="contact__box contact__box--no-margin">
                        <h3 className="contact__sub-title">Social</h3>
                        <div className="contact__field">
                            <label>Facebook</label>
                            <input
                                type="text"
                                name="facebook"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.social.facebook}
                            />
                        </div>
                        <div className="contact__field">
                            <label>GitHub</label>
                            <input
                                type="text"
                                name="github"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.social.github}
                            />
                        </div>
                        <div className="contact__field">
                            <label>Twitter</label>
                            <input
                                type="text"
                                name="twitter"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.social.twitter}
                            />
                        </div>
                        <div className="contact__field">
                            <label>LinkedIn</label>
                            <input
                                type="text"
                                name="linkedin"
                                length-check=""
                                onChange={() => {
                                    $ctrl.updateContact();
                                }}
                                ng-model-options={{
                                    updateOn: 'default blur',
                                    debounce: {
                                        default: 250,
                                        blur: 0
                                    }
                                }}
                                value={$ctrl.contact.social.linkedin}
                            />
                        </div>
                    </div>

                    <ContactTag tag="$ctrl.contact.tag" on-change="$ctrl.tagChange($event);" />

                    {$ctrl.isNewContact ? (
                        <div>
                            <button
                                className="contact__action button"
                                disabled={contactDetailForm.$invalid}
                                onClick={() => {
                                    $ctrl.saveContact();
                                }}>
                                Create contact
                            </button>
                        </div>
                    ) : null}
                    {!$ctrl.isNewContact ? (
                        <div>
                            <button
                                className="contact__action button delete"
                                onClick={() => {
                                    $ctrl.deleteContact();
                                }}>
                                Delete contact
                            </button>
                        </div>
                    ) : null}
                </form>
            </div>
        );
    }
}

angular.module('components.contact').controller('ContactDetail', ContactDetail);

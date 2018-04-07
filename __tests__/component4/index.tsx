import * as React from 'react';

export default class PhoneList extends React.PureComponent<{}> {
    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2">
                        {/*Sidebar content*/}

                        <p>
                            Search:
                            <input ng-model="$ctrl.query" />
                        </p>

                        <p>
                            Sort by:
                            <select ng-model="$ctrl.orderProp">
                                <option value="name">Alphabetical</option>
                                <option value="age">Newest</option>
                            </select>
                        </p>
                    </div>
                    <div className="col-md-10">
                        {/*Body content*/}

                        <ul className="phones">
                            {$ctrl.phones
                                .filter($ctrl.query)
                                .sort($ctrl.orderProp)
                                .map((phone, index) => {
                                    return (
                                        <li key={`item-${index}`} className="thumbnail phone-list-item">
                                            <a href={`#!/phones/${phone.id}`} className="thumb">
                                                <img src={phone.imageUrl} alt={phone.name} />
                                            </a>
                                            <a href={`#!/phones/${phone.id}`}>{phone.name}</a>
                                            <p>{phone.snippet}</p>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

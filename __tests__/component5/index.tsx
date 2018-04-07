import * as React from 'react';

export default class PhoneDetail extends React.PureComponent<{}> {
    render() {
        return [
            <div key="child-0" className="phone-images">
                {$ctrl.phone.images.map((img, index) => {
                    return (
                        <img
                            key={`item-${index}`}
                            src={img}
                            className="{selected: img === $ctrl.mainImageUrl}"
                        />
                    );
                })}
            </div>,

            <h1 key="child-2">{$ctrl.phone.name}</h1>,

            <p key="child-4">{$ctrl.phone.description}</p>,

            <ul key="child-6" className="phone-thumbs">
                {$ctrl.phone.images.map((img, index) => {
                    return (
                        <li key={`item-${index}`}>
                            <img src={img} onClick={$ctrl.setImage.bind(null, img)} />
                        </li>
                    );
                })}
            </ul>,

            <ul key="child-8" className="specs">
                <li>
                    <span>Availability and Networks</span>
                    <dl>
                        <dt>Availability</dt>
                        {$ctrl.phone.availability.map((availability, index) => {
                            return <dd key={`item-${index}`}>{availability}</dd>;
                        })}
                    </dl>
                </li>
                <li>
                    <span>Battery</span>
                    <dl>
                        <dt>Type</dt>
                        <dd>{$ctrl.phone.battery.type}</dd>
                        <dt>Talk Time</dt>
                        <dd>{$ctrl.phone.battery.talkTime}</dd>
                        <dt>Standby time (max)</dt>
                        <dd>{$ctrl.phone.battery.standbyTime}</dd>
                    </dl>
                </li>
                <li>
                    <span>Storage and Memory</span>
                    <dl>
                        <dt>RAM</dt>
                        <dd>{$ctrl.phone.storage.ram}</dd>
                        <dt>Internal Storage</dt>
                        <dd>{$ctrl.phone.storage.flash}</dd>
                    </dl>
                </li>
                <li>
                    <span>Connectivity</span>
                    <dl>
                        <dt>Network Support</dt>
                        <dd>{$ctrl.phone.connectivity.cell}</dd>
                        <dt>WiFi</dt>
                        <dd>{$ctrl.phone.connectivity.wifi}</dd>
                        <dt>Bluetooth</dt>
                        <dd>{$ctrl.phone.connectivity.bluetooth}</dd>
                        <dt>Infrared</dt>
                        <dd>{checkmark($ctrl.phone.connectivity.infrared)}</dd>
                        <dt>GPS</dt>
                        <dd>{checkmark($ctrl.phone.connectivity.gps)}</dd>
                    </dl>
                </li>
                <li>
                    <span>Android</span>
                    <dl>
                        <dt>OS Version</dt>
                        <dd>{$ctrl.phone.android.os}</dd>
                        <dt>UI</dt>
                        <dd>{$ctrl.phone.android.ui}</dd>
                    </dl>
                </li>
                <li>
                    <span>Size and Weight</span>
                    <dl>
                        <dt key={`item-${index}`}>Dimensions</dt>
                        {$ctrl.phone.sizeAndWeight.dimensions.map((dim, index) => {
                            return <dd key={`item-${index}`}>{dim}</dd>;
                        })}
                        <dt>Weight</dt>
                        <dd>{$ctrl.phone.sizeAndWeight.weight}</dd>
                    </dl>
                </li>
                <li>
                    <span>Display</span>
                    <dl>
                        <dt>Screen size</dt>
                        <dd>{$ctrl.phone.display.screenSize}</dd>
                        <dt>Screen resolution</dt>
                        <dd>{$ctrl.phone.display.screenResolution}</dd>
                        <dt>Touch screen</dt>
                        <dd>{checkmark($ctrl.phone.display.touchScreen)}</dd>
                    </dl>
                </li>
                <li>
                    <span>Hardware</span>
                    <dl>
                        <dt>CPU</dt>
                        <dd>{$ctrl.phone.hardware.cpu}</dd>
                        <dt>USB</dt>
                        <dd>{$ctrl.phone.hardware.usb}</dd>
                        <dt>Audio / headphone jack</dt>
                        <dd>{$ctrl.phone.hardware.audioJack}</dd>
                        <dt>FM Radio</dt>
                        <dd>{checkmark($ctrl.phone.hardware.fmRadio)}</dd>
                        <dt>Accelerometer</dt>
                        <dd>{checkmark($ctrl.phone.hardware.accelerometer)}</dd>
                    </dl>
                </li>
                <li>
                    <span>Camera</span>
                    <dl>
                        <dt>Primary</dt>
                        <dd>{$ctrl.phone.camera.primary}</dd>
                        <dt>Features</dt>
                        <dd>{$ctrl.phone.camera.features.join}</dd>
                    </dl>
                </li>
                <li>
                    <span>Additional Features</span>
                    <dd>{$ctrl.phone.additionalFeatures}</dd>
                </li>
            </ul>
        ];
    }
}

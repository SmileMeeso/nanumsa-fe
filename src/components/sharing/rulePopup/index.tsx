import { useState } from "react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

export interface SharingRulePopupProps {
    title: string;
    rules: string[];
}

import "./rulePopup.css";

const SharingRulePopup = ({ title, rules }: SharingRulePopupProps) => {
    const [isPopupOn, setIsPopupOn] = useState<boolean>(false);

    const handleClickTitle = () => {
        setIsPopupOn(!isPopupOn);
    };

    const handleClickCloseButton = () => {
        setIsPopupOn(false);
    };

    return (
        <div className="sharing warning">
            <div onClick={handleClickTitle}>
                <ExclamationCircleIcon className="icon" />
                {title}
            </div>
            {isPopupOn && (
                <div className="popup">
                    <div className="wrapper">
                        <div className="close-button-wapper">
                            <button onClick={handleClickCloseButton}>
                                <XMarkIcon className="icon" />
                            </button>
                        </div>
                        <ul className="list-disc pl-4">
                            {rules.map((rule, idx) => (
                                <li
                                    key={`sharing-rule-popup-list-${title}-${idx}}`}
                                >
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharingRulePopup;

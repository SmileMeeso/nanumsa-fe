import { PropsWithChildren } from "react";

import DimmedBackdrop from "@components/backdrop/dimmed";

import { XMarkIcon } from "@heroicons/react/24/outline";

import "./alertBox.css";

export interface AlertBoxProps extends PropsWithChildren {
    onClickCloseButton: () => void;
}

const AlertBox = ({ children, onClickCloseButton }: AlertBoxProps) => {
    return (
        <>
            <DimmedBackdrop />
            <div className="alertBox">
                <div className="wrapper">
                    <button className="xbutton" onClick={onClickCloseButton}>
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </>
    );
};

export default AlertBox;

import { ReactNode, MouseEvent } from "react";

import "./fullWidthButton.css";

export interface FullWidthButton {
    htmlId?: string;
    icon?: ReactNode;
    textColor?: string;
    backgroundColor?: string;
    border?: string;
    borderColor?: string;
    rounded?: string;
    text?: string;
    disabled?: boolean;
    onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
}

const FullWidthButtonWithRightButton = ({
    htmlId,
    icon,
    textColor,
    backgroundColor,
    border,
    borderColor,
    rounded,
    text,
    disabled,
    onClick,
}: FullWidthButton) => {
    const handleClickButton = (event: MouseEvent<HTMLButtonElement>) => {
        if (!onClick) {
            return;
        }
        onClick(event);
    };

    return (
        <div id={htmlId}>
            <button
                onClick={handleClickButton}
                disabled={disabled}
                className={`full-width-button w-full h-10 relative ${
                    textColor ?? "text-white"
                } ${backgroundColor ?? "bg-sky-500"} ${rounded ?? "rounded"} ${
                    border ?? "border"
                } ${borderColor ?? "border-white"}`}
            >
                {icon && <div className="icon">{icon}</div>}
                {text && <div className="w-full text-center">{text}</div>}
            </button>
        </div>
    );
};

export default FullWidthButtonWithRightButton;

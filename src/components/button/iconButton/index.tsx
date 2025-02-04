import { ReactNode, MouseEvent } from "react";

import "./IconButton.css";

export interface IconButton {
    htmlId?: string;
    icon?: ReactNode;
    backgroundColor?: string;
    border?: string;
    borderColor?: string;
    rounded?: string;
    disabled?: boolean;
    width?: string;
    height?: string;
    onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
}

const IconButton = ({
    htmlId,
    icon,
    backgroundColor,
    border,
    borderColor,
    rounded,
    disabled,
    width,
    height,
    onClick,
}: IconButton) => {
    const handleClickButton = (event: MouseEvent<HTMLButtonElement>) => {
        if (!onClick) {
            return;
        }
        onClick(event);
    };

    return (
        <div id={htmlId} className="icon-button">
            <button
                onClick={handleClickButton}
                disabled={disabled}
                className={`full-width-button relative overflow-hidden ${
                    width ?? "w-[40px]"
                } ${height ?? "h-[40px]"} ${backgroundColor ?? "bg-sky-500"} ${
                    rounded ?? "rounded"
                } ${border ?? "border"} ${borderColor ?? "border-white"}`}
            >
                {icon && <div className="icon">{icon}</div>}
            </button>
        </div>
    );
};

export default IconButton;

import React, { PropsWithChildren, ReactElement, MouseEvent } from "react";

export interface MenuWithIconButtonProps extends PropsWithChildren {
    Icon: ReactElement;
    backgroundColor: string;
    onClick: (event: MouseEvent<HTMLDivElement>) => void;
    borderRule?: string;
}

const MenuWithIconButton = ({
    Icon,
    onClick,
    backgroundColor,
    borderRule,
}: MenuWithIconButtonProps) => {
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        onClick(event);
    };

    return (
        <div
            className={`${backgroundColor} hover:${backgroundColor}/75 focus:ring w-8 h-8 p-1.5 ${
                borderRule ?? "rounded"
            } shadow cursor-pointer z-[1010]`}
            onClick={handleClick}
        >
            {Icon}
        </div>
    );
};

export default MenuWithIconButton;

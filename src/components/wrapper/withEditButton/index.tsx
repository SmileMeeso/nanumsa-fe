import { PropsWithChildren, useState } from "react";

import { PencilIcon } from "@heroicons/react/24/outline";

interface WrapperWithCopyButtonProps extends PropsWithChildren {
    onClick: () => void;
    isCopied?: boolean;
}
const WrapperWithCopyButton = ({
    children,
    onClick,
}: WrapperWithCopyButtonProps) => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const handleClickButton = () => {
        onClick();
    };

    const onHovering = () => {
        setIsHovering(true);
    };

    const offHovering = () => {
        setIsHovering(false);
    };

    return (
        <div
            className="wrapper-with-edit cursor-pointer w-full"
            onMouseEnter={onHovering}
            onMouseLeave={offHovering}
        >
            {children}
            {isHovering && (
                <PencilIcon
                    className="ml-1 w-6 h-6 inline-block"
                    onClick={handleClickButton}
                />
            )}
        </div>
    );
};

export default WrapperWithCopyButton;

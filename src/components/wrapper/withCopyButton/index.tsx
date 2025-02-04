import { PropsWithChildren, useState } from "react";

import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

interface WrapperWithCopyButtonProps extends PropsWithChildren {
    onClick: () => void;
    isCopied?: boolean;
}
const WrapperWithCopyButton = ({
    children,
    onClick,
    isCopied,
}: WrapperWithCopyButtonProps) => {
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const handleClickWrapper = () => {
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
            className="wrapper-with-copy"
            onClick={handleClickWrapper}
            onMouseEnter={onHovering}
            onMouseLeave={offHovering}
        >
            {children}
            {isHovering && (
                <>
                    {!isCopied ? (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                    ) : (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                    )}
                </>
            )}
        </div>
    );
};

export default WrapperWithCopyButton;

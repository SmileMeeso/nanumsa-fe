import { PropsWithChildren, useState } from "react";

import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import FlexHeightContainerWrapper from "@components/wrapper/container/flexHeight";

import "./foldableBox.css";

const FoldableBox = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState<boolean>(true);

    const toggleFoldableBox = () => {
        setOpen(!open);
    };

    return (
        <FlexHeightContainerWrapper>
            <div className="foldable-box">
                <button className="fold-button" onClick={toggleFoldableBox}>
                    {open ? (
                        <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                        <ChevronDownIcon className="w-6 h-6" />
                    )}
                </button>
                {open && children}
            </div>
        </FlexHeightContainerWrapper>
    );
};

export default FoldableBox;

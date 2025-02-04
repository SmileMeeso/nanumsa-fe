import { PropsWithChildren } from "react";

const FlexHeightContainerWrapper = function ({ children }: PropsWithChildren) {
    return (
        <div className="relative overflow-hidden flex flex-col  w-[24rem] max-w-[100vw] max-h-[calc(100vh-1rem)] m-2 rounded-lg text-sm z-[1010]">
            {children}
        </div>
    );
};

export default FlexHeightContainerWrapper;

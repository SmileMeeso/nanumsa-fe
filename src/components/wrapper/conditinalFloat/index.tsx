import { PropsWithChildren } from "react";

const ConditionalFloatWrapper = function ({ children }: PropsWithChildren) {
    return <div className="fixed top-0 right-0 z-[1000]">{children}</div>;
};

export default ConditionalFloatWrapper;

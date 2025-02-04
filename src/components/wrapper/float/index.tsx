import { PropsWithChildren } from "react";

import "./floatWrapper.css";

const FloatWrapper = function ({ children }: PropsWithChildren) {
    return <div className="float-wrapper">{children}</div>;
};

export default FloatWrapper;

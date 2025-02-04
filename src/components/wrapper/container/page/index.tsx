import { PropsWithChildren } from "react";

import "./pageContainer.css";

const PageContainerWrapper = function ({ children }: PropsWithChildren) {
    return <div className="page-container-wrapper">{children}</div>;
};

export default PageContainerWrapper;

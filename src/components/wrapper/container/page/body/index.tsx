import { forwardRef, PropsWithChildren } from "react";

import "./pageBody.css";

const PageContainerWrapperBody = forwardRef<HTMLDivElement, PropsWithChildren>(
    (props, ref) => {
        return (
            <div ref={ref} className="page-container-wrapper-body">
                {props.children}
            </div>
        );
    }
);

export default PageContainerWrapperBody;

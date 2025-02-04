import { PropsWithChildren, forwardRef, useContext } from "react";

import PageContainerWrapper from "../index";

import HeaderWithBackAndHomeButton from "../header/withBackAndHomeButton";

import PageContainerWrapperBody from "../body";

import "./pageWithBackButtonAndList.css";

const PageWithBackButtonAndListWrapper = forwardRef<
    HTMLDivElement,
    PropsWithChildren
>((props, ref) => {
    return (
        <PageContainerWrapper>
            <HeaderWithBackAndHomeButton />
            <PageContainerWrapperBody ref={ref}>
                {props.children}
            </PageContainerWrapperBody>
        </PageContainerWrapper>
    );
});

export default PageWithBackButtonAndListWrapper;

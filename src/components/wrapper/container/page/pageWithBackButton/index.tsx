import { PropsWithChildren, forwardRef, useContext } from "react";

import PageContainerWrapper from "../index";

import HeaderWithBackAndHomeAndUserInfoButton from "../header/withBackAndHomeAndUserInfoButton";
import PageContainerWrapperBody from "../body";

import { SearchContext } from "@/App";

import "./pageWithBackButton.css";

const PageWithBackButtonWrapper = forwardRef<HTMLDivElement, PropsWithChildren>(
    (props, ref) => {
        const { isMapView } = useContext(SearchContext);

        return isMapView ? (
            <HeaderWithBackAndHomeAndUserInfoButton />
        ) : (
            <PageContainerWrapper>
                <HeaderWithBackAndHomeAndUserInfoButton />
                <PageContainerWrapperBody ref={ref}>
                    {props.children}
                </PageContainerWrapperBody>
            </PageContainerWrapper>
        );
    }
);

export default PageWithBackButtonWrapper;

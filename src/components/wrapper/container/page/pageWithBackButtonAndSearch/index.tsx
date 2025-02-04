import React, {
    PropsWithChildren,
    forwardRef,
    Dispatch,
    useContext,
} from "react";

import PageContainerWrapper from "../index";

import HeaderWithSearchAreaAndUserInfoButton from "../header/withSearchAreaAndUserInfoButton";

import PageContainerWrapperBody from "../body";

import { SearchInfo } from "@components/menus/search";

import { SearchContext } from "@/App";

import "./pageWithBackButtonAndSearch.css";

const PageWithBackButtonAndSearchWrapper = forwardRef<
    HTMLDivElement,
    PropsWithChildren
>((props, ref) => {
    const { isMapView, setIsMapView } = useContext(SearchContext);

    const handleChangeMapView = () => {
        setIsMapView(!isMapView);
    };

    return !isMapView ? (
        <PageContainerWrapper>
            <HeaderWithSearchAreaAndUserInfoButton
                isMapView={isMapView}
                handleChangeMapView={handleChangeMapView}
            />
            <PageContainerWrapperBody ref={ref}>
                {props.children}
            </PageContainerWrapperBody>
        </PageContainerWrapper>
    ) : (
        <HeaderWithSearchAreaAndUserInfoButton
            isMapView={isMapView}
            handleChangeMapView={handleChangeMapView}
        />
    );
});

export default PageWithBackButtonAndSearchWrapper;

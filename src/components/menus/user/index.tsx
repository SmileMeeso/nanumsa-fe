import {
    useContext,
    useState,
    KeyboardEvent,
    ChangeEvent,
    useEffect,
} from "react";

import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { AuthContext, SearchContext } from "@/App";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonAndListWrapper from "@components/wrapper/container/page/pageWithBackButtonAndList";

const UserMenu = function () {
    const navigate = useNavigate();
    const location = useLocation();

    const { userInfo } = useContext(AuthContext);
    const { setIsMapView } = useContext(SearchContext);

    useEffect(() => {
        setIsMapView(false);
    }, []);

    useEffect(() => {
        if (userInfo.loading) {
            return;
        }
        if (!userInfo.isLogined && location.pathname !== "/user/login") {
            navigate("/user/login");
        }
    }, [userInfo.isLogined]);

    return (
        <FloatWrapper>
            <PageWithBackButtonAndListWrapper>
                <Outlet />
            </PageWithBackButtonAndListWrapper>
        </FloatWrapper>
    );
};

export default UserMenu;

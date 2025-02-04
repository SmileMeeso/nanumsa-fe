import { createBrowserRouter } from "react-router-dom";

// import SearchMenu from "./components/menus/search";
import UserMenu from "./components/menus/user";
import UserInfoMenu from "./components/menus/user/info";
import UserLoginMenu from "./components/menus/user/login";
import UserNewMenu from "./components/menus/user/new";
import UserEditMenu from "./components/menus/user/edit";
import UserEditNicknameMenu from "./components/menus/user/edit/nickname";
import UserEditPasswordMenu from "./components/menus/user/edit/password";
import UserEditContactMenu from "./components/menus/user/edit/contact";
import UserFindPasswordMenu from "./components/menus/user/find/password";
import UserExitMenu from "./components/menus/user/exit";
import SharingMenu from "./components/menus/sharing";
import SharingNewMenu from "./components/menus/sharing/new";
import SharingStarredMenu from "./components/menus/sharing/starred";
import SharingMyMenu from "./components/menus/sharing/my";
import SharingDetailMenu from "./components/menus/sharing/detail";
import VerifyEmailMenu from "./components/menus/verify/email";
import VerifyNaverMenu from "./components/menus/verify/naver";
import VerifyKakaoMenu from "./components/menus/verify/kakao";
import SearchMenu from "./components/menus/search";
import SearchResultMenu from "./components/menus/search/result";
import ChangePasswordMenu from "./components/menus/change/password";

import App from "./App";

const routes = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/user",
                element: <UserMenu />,
                children: [
                    {
                        path: "/user/info",
                        element: <UserInfoMenu />,
                    },
                    { path: "/user/login", element: <UserLoginMenu /> },
                    {
                        path: "/user/find/password",
                        element: <UserFindPasswordMenu />,
                    },
                    { path: "/user/new", element: <UserNewMenu /> },
                    {
                        path: "/user/find/password",
                        element: <UserFindPasswordMenu />,
                    },
                    { path: "/user/exit", element: <UserExitMenu /> },
                    {
                        path: "/user/edit",
                        element: <UserEditMenu />,
                        children: [
                            {
                                path: "/user/edit/nickname",
                                element: <UserEditNicknameMenu />,
                            },
                            {
                                path: "/user/edit/password",
                                element: <UserEditPasswordMenu />,
                            },
                            {
                                path: "/user/edit/contact",
                                element: <UserEditContactMenu />,
                            },
                        ],
                    },
                ],
            },
            {
                path: "/sharing",
                element: <SharingMenu />,
                children: [
                    { path: "/sharing/new", element: <SharingNewMenu /> },

                    {
                        path: "/sharing/starred",
                        element: <SharingStarredMenu />,
                    },
                    { path: "/sharing/my", element: <SharingMyMenu /> },
                    {
                        path: "/sharing/detail/:id",
                        element: <SharingDetailMenu />,
                    },
                ],
            },
            {
                path: "/search",
                element: <SearchMenu />,
                children: [
                    {
                        path: "/search/result",
                        element: <SearchResultMenu />,
                    },
                ],
            },
        ],
    },
    {
        path: "/verify/email",
        element: <VerifyEmailMenu />,
    },
    {
        path: "/verify/naver",
        element: <VerifyNaverMenu />,
    },
    {
        path: "/verify/kakao",
        element: <VerifyKakaoMenu />,
    },
    {
        path: "/change/password",
        element: <ChangePasswordMenu />,
    },
];

export default createBrowserRouter(routes);

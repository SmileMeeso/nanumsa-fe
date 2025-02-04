import { useState, useContext, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import { AuthContext } from "@/App";

import { MessageReturn, postLogout } from "@/api/request/requests";

import { ValidateResult } from "@components/menus/sharing";

import {
    PlusIcon,
    ChevronRightIcon,
    ListBulletIcon,
    StarIcon,
} from "@heroicons/react/16/solid";

import {
    FaceSmileIcon,
    KeyIcon,
    PhoneIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

const UserInfoMenu = () => {
    const navigate = useNavigate();

    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [isCopied, setIsCopied] = useState<boolean>(false);

    const [enablePostLogout, setEnablePostLogout] = useState<boolean>(false);

    const [logoutStatus, setLogoutStatus] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });

    useEffect(() => {
        if (userInfo.isLogined) {
            return;
        }

        navigate(-1);
    }, []);

    const { data: logoutResult, isLoading: logoutLoading } = useQuery<
        MessageReturn,
        Error
    >(
        [JSON.stringify(userInfo)],
        () => {
            setEnablePostLogout(false);

            return postLogout({
                token: userInfo.token,
            });
        },
        {
            enabled: Boolean(userInfo.token) && enablePostLogout,
            onSuccess: (response) => {
                if (response?.error) {
                    setLogoutStatus({
                        code: 1,
                        message: response?.error,
                        result: false,
                    });
                } else {
                    navigate("/user/login");
                    setLogoutStatus({
                        code: 0,
                        result: true,
                    });
                    setUserInfo({
                        token: "",
                        nickname: "",
                        tag: 0,
                        isSocial: false,
                        isLogined: false,
                        loading: false,
                    });
                    window.localStorage.removeItem("remain-login");
                    window.localStorage.removeItem("auth-token");
                }
            },
        }
    );

    const handleClickTagCopyButton = async () => {
        setIsCopied(false);

        try {
            await navigator.clipboard.writeText(userInfo.tag.toString());
            setIsCopied(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClickAddShareButton = () => {
        goToPage("/sharing/new");
    };

    const handleClickShareListButton = () => {
        goToPage("/sharing/my");
    };

    const handleClickShareStarredButton = () => {
        goToPage("/sharing/starred");
    };

    const handleClickEditNicknameButton = () => {
        goToPage("/user/edit/nickname");
    };

    const handleClickEditPasswordButton = () => {
        goToPage("/user/edit/password");
    };

    const handleClickAddContactButton = () => {
        goToPage("/user/edit/contact");
    };

    const handleClickDeleteUserButton = () => {
        goToPage("/user/exit?page=1");
    };

    const handleClickLogoutButton = () => {
        if (logoutLoading) {
            return;
        }
        setEnablePostLogout(true);
    };

    const goToPage = (pageName: string) => {
        navigate(pageName);
    };

    return (
        <div>
            <div className="mb-3">
                <div className="flex items-center justify-between">
                    <p className="text-lg inline-block">
                        <b className="text-amber-400">{userInfo.nickname}</b>님
                        안녕하세요!
                    </p>
                    <button
                        className="rounded border border-slate-300 text-slate-600 px-1 py-0.5"
                        onClick={handleClickLogoutButton}
                    >
                        로그아웃
                    </button>
                </div>
                <span className="text-xs text-slate-700">
                    <div className="align-middle inline-block">
                        내 태그: {userInfo.tag}
                    </div>
                    <div
                        className="border border-slate-400 px-1 ml-1 rounded-md text-xs inline-block align-middle text-slate-400 cursor-pointer"
                        onClick={handleClickTagCopyButton}
                    >
                        복사
                    </div>
                    {isCopied && (
                        <b className="ml-1 text-sky-400 text-xs">
                            복사되었습니다!
                        </b>
                    )}
                </span>
            </div>
            <div className="flex w-full align-middle justify-center gap-x-2 mb-3">
                <div
                    className="user-menu-share-menu-button"
                    onClick={handleClickAddShareButton}
                >
                    <div className="align-wrapper">
                        <div className="bg-green-400 icon">
                            <PlusIcon className="h-8 text-green-700" />
                        </div>
                        <br />
                        나눔 추가하기
                    </div>
                </div>
                <div
                    className="user-menu-share-menu-button"
                    onClick={handleClickShareListButton}
                >
                    <div className="align-wrapper">
                        <div className="bg-sky-300 icon">
                            <ListBulletIcon className="h-8 text-sky-600" />
                        </div>
                        <br />내 나눔 리스트
                    </div>
                </div>
                <div
                    className="user-menu-share-menu-button"
                    onClick={handleClickShareStarredButton}
                >
                    <div className="align-wrapper">
                        <div className="bg-yellow-200 icon">
                            <StarIcon className="h-8 text-amber-400" />
                        </div>
                        <br />
                        찜한 나눔 리스트
                    </div>
                </div>
            </div>
            <div className="user-menu-edit-user-info-menu justify-center flex flex-col bg-slate-100">
                <div
                    className="list-item"
                    onClick={handleClickEditNicknameButton}
                >
                    <div>
                        <FaceSmileIcon className="h-4 w-4 inline-block align-middle mr-1" />
                        닉네임 변경
                    </div>
                    <ChevronRightIcon className="h-5 w-5" />
                </div>
                {!userInfo.isSocial && (
                    <div
                        className="list-item"
                        onClick={handleClickEditPasswordButton}
                    >
                        <div>
                            <KeyIcon className="h-4 w-4 inline-block align-middle mr-1" />
                            비밀번호 변경
                        </div>
                        <ChevronRightIcon className="h-5 w-5" />
                    </div>
                )}
                <div
                    className="list-item"
                    onClick={handleClickAddContactButton}
                >
                    <div>
                        <PhoneIcon className="h-4 w-4 inline-block align-middle mr-1" />
                        연락처 추가
                    </div>
                    <ChevronRightIcon className="h-5 w-5" />
                </div>
                <div
                    className="list-item"
                    onClick={handleClickDeleteUserButton}
                >
                    <div>
                        <TrashIcon className="h-4 w-4 inline-block align-middle mr-1" />
                        회원 탈퇴
                    </div>
                    <ChevronRightIcon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

export default UserInfoMenu;

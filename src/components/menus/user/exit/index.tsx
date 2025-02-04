import React, {
    useState,
    useEffect,
    useRef,
    ChangeEvent,
    useContext,
} from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useQuery } from "react-query";

import AlertBox from "@components/alertBox";
import FullWidthButtonWithXFreeButton from "@components/button/fullWidthButtonWithXFreeButton";
import ShareListItem from "@components/sharing/list/itemForExit";

import {
    TrashIcon,
    ArrowRightIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import {
    ShareInfo,
    ShareInfoForResponse,
    ShareInfoId,
    ShareInfoTag,
} from "@components/menus/sharing";

import {
    ReturnWith,
    getMyShareList,
    updateComplexedShareItems,
    deleteShareItems,
    deleteUser,
} from "@/api/request/requests";

import { AuthContext } from "@/App";

import { format } from "date-fns";

import "./userExit.css";

const UserExitMenu = () => {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [enableLoadMyShare, setEnableLoadMyShare] = useState<boolean>(false);
    const [enableDeleteShareItem, setEnableDeleteShareItem] =
        useState<boolean>(false);
    const [enableComplexedUpdate, setEnableComplexedUpdate] =
        useState<boolean>(false);
    const [enableExitUser, setEnableExitUser] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);
    const [showIsNowOnlyYoursAlert, setShowIsNowOnlyYoursAlert] =
        useState<boolean>(false);
    const [shareList, setShareList] = useState<ShareInfo[]>([]);
    const [filteredShareList, setFilteredShareList] = useState<ShareInfo[]>([]);
    const [showOnlyAdminChecked, setShowOnlyAdminChecked] =
        useState<boolean>(true);
    const [checkedDeleteInfos, setCheckedDeleteInfos] = useState<ShareInfo[]>(
        []
    );
    const [disableSubmitButton, setDisableSubmitButton] =
        useState<boolean>(false);
    const [showExitCompleteAlert, setShowExitCompleteAlert] =
        useState<boolean>(false);

    const date = useRef(new Date());

    const { data: loadMyShareData, isLoading: loadingLoadMyShareDataQuery } =
        useQuery<ReturnWith<ShareInfoForResponse[]> | undefined, Error>(
            [
                "load-my-share",
                format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            ],
            () => {
                setEnableLoadMyShare(false);
                return getMyShareList();
            },
            {
                enabled: enableLoadMyShare,
                onSuccess: (response?: ReturnWith<ShareInfoForResponse[]>) => {
                    if (response?.success) {
                        setShareList(
                            response?.success.map((result) => ({
                                ...result,
                                admins: result.admins
                                    .split(",")
                                    .map((admin) => parseInt(admin)),
                                contacts: result.contacts.split(","),
                                goods: JSON.parse(result.goods),
                            }))
                        );
                    }
                },
            }
        );

    const {
        data: updateComplexedData,
        isLoading: loadingUpdateComplexedDataQuery,
    } = useQuery<ReturnWith<ShareInfoId[]>, Error>(
        [
            "update-complexed-data",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
        ],
        () => {
            console.log(
                checkedDeleteInfos.map((info) =>
                    info.admins.length === 1
                        ? { type: "DELETE", id: info.id }
                        : {
                              type: "UPDATE",
                              id: info.id,
                              admins: info.admins
                                  .filter((admin) => admin !== userInfo.tag)
                                  .join(","),
                          }
                )
            );
            setEnableComplexedUpdate(false);
            return updateComplexedShareItems(
                checkedDeleteInfos.map((info) =>
                    info.admins.length === 1
                        ? { type: "DELETE", id: info.id }
                        : {
                              type: "UPDATE",
                              id: info.id,
                              admins: info.admins
                                  .filter((admin) => admin !== userInfo.tag)
                                  .join(","),
                          }
                )
            );
        },
        {
            enabled: enableComplexedUpdate,
            onSuccess: (response?: ReturnWith<ShareInfoId[]>) => {
                if (response?.success) {
                    setShowIsNowOnlyYoursAlert(false);
                    setShareList(
                        shareList.filter(
                            (item) => !response?.success.includes(item.id)
                        )
                    );
                    setCheckedDeleteInfos([]);
                }
            },
        }
    );

    const { data: deleteShareData, isLoading: loadingDeleteShareDataQuery } =
        useQuery<ReturnWith<ShareInfoId[]>, Error>(
            [
                "delete-share-data",
                format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            ],
            () => {
                setEnableDeleteShareItem(false);
                return deleteShareItems(
                    checkedDeleteInfos.map((info) => info.id)
                );
            },
            {
                enabled: enableDeleteShareItem,
                onSuccess: (response?: ReturnWith<ShareInfoId[]>) => {
                    if (response?.success) {
                        setShowIsNowOnlyYoursAlert(false);
                        setShareList(
                            shareList.filter(
                                (item) => !response?.success.includes(item.id)
                            )
                        );
                        setCheckedDeleteInfos([]);
                    }
                },
            }
        );

    const { data: deleteUserData, isLoading: loadingDeleteUserQuery } =
        useQuery<ReturnWith<boolean>, Error>(
            [
                "delete-user",
                format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            ],
            () => {
                setEnableExitUser(false);
                return deleteUser();
            },
            {
                enabled: enableExitUser,
                onSuccess: (response?: ReturnWith<boolean>) => {
                    if (response?.success) {
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

                        setShowExitCompleteAlert(true);

                        setTimeout(() => {
                            navigate("/");
                        }, 5 * 1000);
                    }
                },
            }
        );

    useEffect(() => {
        setEnableLoadMyShare(true);
    }, []);

    useEffect(() => {
        if (filteredShareList.length === 0) {
            setFilteredShareList([...shareList]);
            return;
        }

        const clonedShareList = [...shareList];
        const filteredShareListIds = filteredShareList.map(
            (filteredItem) => filteredItem.id
        );

        setFilteredShareList(
            clonedShareList.filter((item) =>
                filteredShareListIds.includes(item.id)
            )
        );
    }, [shareList]);

    useEffect(() => {
        validateEnableSubmit();
    }, [shareList]);

    useEffect(() => {
        doSearch();
    }, [showOnlyAdminChecked, shareList]);

    const doSearch = () => {
        setFilteredShareList(
            shareList.filter((list) =>
                showOnlyAdminChecked
                    ? list.admins.includes(userInfo.tag) &&
                      list.admins.length === 1
                    : true
            )
        );
    };

    const handleClickGoToHomeNow = () => {
        goToHome();
    };

    const goToHome = () => {
        navigate("/");
    };

    const handleClickAlertBoxCloseButton = () => {
        setShowCompleteAlert(false);
    };

    const handleClickIsNowOnlyYoursAlertCloseButton = () => {
        setShowIsNowOnlyYoursAlert(false);
    };

    const handleClickExitCompleteAlertCloseButton = () => {
        navigate("/");
    };

    const handleClickIsNowOnlyYoursAlertDeleteButton = () => {
        setEnableComplexedUpdate(true);
    };

    const handleClickBottomSubmitButton = () => {
        if (searchParams.get("page") === "1") {
            searchParams.set("page", "2");
            setSearchParams(searchParams);
        } else {
            setEnableExitUser(true);
        }
    };

    const handleChangeOnlyAdminCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setShowOnlyAdminChecked(event.target.checked);
    };

    const handleChangeAllChecked = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setCheckedDeleteInfos([...filteredShareList]);
        } else {
            setCheckedDeleteInfos([]);
        }
    };

    const handleChangeAdminStatus = (id: ShareInfoId) => {
        setShareList(shareList.filter((item) => item.id !== id));
        setCheckedDeleteInfos(
            checkedDeleteInfos.filter((info) => info.id !== id)
        );
    };

    const handleChangeDeleteCheckbox = (item: ShareInfo, checked: boolean) => {
        if (checked) {
            setCheckedDeleteInfos([...checkedDeleteInfos, item]);
        } else {
            setCheckedDeleteInfos(
                checkedDeleteInfos.filter((info) => info.id !== item.id)
            );
        }
    };

    const handleClickAllDeleteCheckedItems = () => {
        if (checkedDeleteInfos.find((info) => info.admins.length > 1)) {
            setShowIsNowOnlyYoursAlert(true);
        } else {
            setEnableDeleteShareItem(true);
        }
    };

    const handleDeleteAdmin = (id: ShareInfoId) => {
        setShareList(shareList.filter((item) => item.id !== id));
    };

    const handleChangeAdminList = (
        id: ShareInfoId,
        adminList: ShareInfoTag[]
    ) => {
        setShareList(
            shareList.map((item) =>
                item.id !== id ? item : { ...item, admins: adminList }
            )
        );
    };

    const validateEnableSubmit = () => {
        setDisableSubmitButton(
            Boolean(
                shareList.find(
                    (item) =>
                        item.admins.length === 1 &&
                        item.admins[0] === userInfo.tag
                )
            )
        );
    };

    return (
        <div className="user-exit-sub-menu">
            {showExitCompleteAlert && (
                <AlertBox
                    onClickCloseButton={handleClickExitCompleteAlertCloseButton}
                >
                    <div className="alert-box-content">
                        <div className="text">
                            회원 탈퇴가 완료되었습니다.
                            <br />
                            5초 후 마이페이지로 이동합니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={
                                    handleClickExitCompleteAlertCloseButton
                                }
                            >
                                홈 화면으로 돌아가기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            {showIsNowOnlyYoursAlert && (
                <AlertBox
                    onClickCloseButton={
                        handleClickIsNowOnlyYoursAlertCloseButton
                    }
                >
                    <div className="alert-box-content">
                        <div className="text">
                            사용자 말고 다른 어드민이 포함된 나눔이 포함되어
                            있습니다.
                            <br />
                            정말 삭제를 계속하시겠습니까?
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={
                                    handleClickIsNowOnlyYoursAlertCloseButton
                                }
                            >
                                취소하기
                            </button>
                            <button
                                className="bg-red-500 text-white"
                                onClick={
                                    handleClickIsNowOnlyYoursAlertDeleteButton
                                }
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            <div className="title">
                <TrashIcon className="w-8 h-8 inline-block mr-0.5" />
                회원 탈퇴
            </div>
            <div className="page-area">
                {searchParams.get("page") === "1" ? (
                    <div className="warning-message">
                        회원 탈퇴를 하면 기존에 있던 회원 정보는 모두
                        제거됩니다.
                        <br />
                        단, 혼자 어드민으로 계신 나눔 정보가 있으면 회원 탈퇴를
                        하실 수 없습니다.
                        <br />
                        <br />
                        따라서
                        <br />
                        <ol>
                            <li>혼자 어드민으로 계신 나눔 정보를 삭제</li>
                            <li>
                                다른 어드민을 추가하고 회원님을 어드민에서 제거
                            </li>
                        </ol>
                        위 두 과정을 거쳐 나눔 정보를 모두 정리하신 후 탈퇴가
                        가능합니다.
                        <br />
                        <br />
                        또한 어드민으로 계시며 나눔에 등록하신 연락처 정보는
                        서비스에서 따로 삭제하지 않고 있으니 회원 탈퇴 전 꼭
                        확인 부탁드립니다.
                    </div>
                ) : (
                    <div className="admin-list">
                        <div className="check-input">
                            <div className="input-group">
                                <input
                                    checked={showOnlyAdminChecked}
                                    id="sharing-list-search-check-input-checkbox-status"
                                    type="checkbox"
                                    onChange={handleChangeOnlyAdminCheckBox}
                                />
                                <label htmlFor="sharing-list-search-check-input-checkbox-status">
                                    어드민이 나 혼자인 나눔만 보기
                                </label>
                            </div>
                            <div className="input-group">
                                {checkedDeleteInfos.length > 0 && (
                                    <button
                                        className="delete-all-button"
                                        onClick={
                                            handleClickAllDeleteCheckedItems
                                        }
                                    >
                                        {checkedDeleteInfos.length}개 일괄 삭제
                                        <XMarkIcon className="icon" />
                                    </button>
                                )}
                                {filteredShareList.length > 0 && (
                                    <input
                                        checked={
                                            checkedDeleteInfos.length ===
                                            filteredShareList.length
                                        }
                                        type="checkbox"
                                        onChange={handleChangeAllChecked}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="check-input-area">
                            {filteredShareList.length > 0 ? (
                                <div className="search-list-area">
                                    {filteredShareList.map((shareInfo, idx) => (
                                        <ShareListItem
                                            key={`sharing-menu sharing-my-menu-list-item-${idx}`}
                                            shareInfo={shareInfo}
                                            checked={Boolean(
                                                checkedDeleteInfos.find(
                                                    (info) =>
                                                        info.id === shareInfo.id
                                                )
                                            )}
                                            onChangeAdminStatus={
                                                handleChangeAdminStatus
                                            }
                                            onChangeDeleteCheckbox={
                                                handleChangeDeleteCheckbox
                                            }
                                            onDeleteItem={handleDeleteAdmin}
                                            onChangeAdminList={
                                                handleChangeAdminList
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="no-result">
                                    {showOnlyAdminChecked ? (
                                        <div className="message">
                                            어드민이 나 혼자인 나눔이 없습니다.
                                            <br />
                                            아래 버튼을 눌러 회원탈퇴를
                                            진행해주세요.
                                        </div>
                                    ) : (
                                        <div className="message">
                                            내가 어드민인 나눔이 없습니다.
                                            <br />
                                            아래 버튼을 눌러 회원탈퇴를
                                            진행해주세요.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="submit">
                <FullWidthButtonWithXFreeButton
                    onClick={handleClickBottomSubmitButton}
                    icon={
                        searchParams.get("page") === "1" && (
                            <div className="icon right-8">
                                <ArrowRightIcon className="w-5 h-5 text-white left-3/4" />
                            </div>
                        )
                    }
                    text={
                        searchParams.get("page") === "1"
                            ? "내가 어드민인 서비스 확인하기"
                            : "회원 탈퇴하기"
                    }
                    textColor="text-white"
                    backgroundColor="bg-sky-500"
                    rounded="rounded-md"
                    border=""
                    borderColor=""
                    disabled={
                        searchParams.get("page") === "2" && disableSubmitButton
                    }
                />
            </div>
        </div>
    );
};

export default UserExitMenu;

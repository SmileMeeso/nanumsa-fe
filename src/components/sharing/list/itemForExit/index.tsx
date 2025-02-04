import { useState, useRef, useContext, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import {
    ShareInfo,
    ShareInfoGoods,
    ShareInfoId,
    ShareInfoTag,
} from "@components/menus/sharing";

import {
    MapPinIcon,
    DevicePhoneMobileIcon,
    StarIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import {
    postChangeShareAdminStatus,
    getAdminInfoByTag,
    deleteShare,
    ReturnWith,
    patchChangeShareAdmins,
} from "@/api/request/requests";

import {
    StarIcon as FilledStarIcon,
    UserIcon as FilledUserIcon,
    UserMinusIcon,
    UserPlusIcon,
    TrashIcon,
} from "@heroicons/react/16/solid";

import SharingInputAdminsContent, {
    validateAdmins,
    validateTagInput,
} from "@components/sharing/input/admins/content";
import SharingInputAdminRulePopup from "@components/sharing/input/admins/rulePopup";

import { Admin } from "@components/menus/sharing";

import { format } from "date-fns";

import { AuthContext } from "@/App";

import "./listItemForExit.css";

export interface ShareListItemProps {
    shareInfo: ShareInfo;
    checked: boolean;
    onChangeAdminStatus: (id: ShareInfoId) => void;
    onChangeDeleteCheckbox: (id: ShareInfo, checked: boolean) => void;
    onDeleteItem: (id: ShareInfoId) => void;
    onChangeAdminList: (id: ShareInfoId, adminList: ShareInfoTag[]) => void;
}

export interface ShareListItemChangeAdminStatus {
    id: ShareInfoId;
    admins: string;
}

const ShareListItem = ({
    shareInfo,
    checked,
    onChangeAdminStatus,
    onChangeDeleteCheckbox,
    onDeleteItem,
    onChangeAdminList,
}: ShareListItemProps) => {
    const { userInfo } = useContext(AuthContext);

    const [popupOpen, setPopupOpen] = useState<boolean>(false);
    const [changeAdminStatus, setChangeAdminStatus] = useState<{
        id: ShareInfoId;
        status: boolean;
    } | null>(null);
    const [adminList, setAdminList] = useState<Admin[]>([]);

    const [enableDeleteShare, setEnableDeleteShare] = useState<boolean>(false);
    const [enableLoadAdminInfo, setEnableLoadAdminInfo] =
        useState<boolean>(false);
    const [enableEditShareAdmins, setEnableEditShareAdmins] =
        useState<boolean>(false);

    const [disableShareAdminsEditButton, setDisableShareAdminsEditButton] =
        useState<boolean>(true);

    const date = useRef(new Date());

    const {
        data: changeAdminStatusResult,
        isLoading: loadingChangeAdminStatusQuery,
    } = useQuery<ReturnWith<ShareListItemChangeAdminStatus> | undefined, Error>(
        [
            "change-star-status",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            JSON.stringify(changeAdminStatus),
        ],
        () => {
            if (changeAdminStatus === null) {
                return;
            }
            return postChangeShareAdminStatus({
                id: changeAdminStatus.id,
                to_be: !changeAdminStatus.status,
            });
        },
        {
            enabled: changeAdminStatus !== null,
            onSettled: () => {
                setChangeAdminStatus(null);
            },
            onSuccess: (
                response?: ReturnWith<ShareListItemChangeAdminStatus>
            ) => {
                if (response?.success === undefined) {
                    return;
                }
                onChangeAdminStatus(response?.success.id);
            },
        }
    );

    const { data: deleteShareData, isLoading: loadingDeleteShareQuery } =
        useQuery<ReturnWith<boolean> | undefined, Error>(
            [
                "delete-share",
                format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            ],
            () => {
                setEnableDeleteShare(false);

                if (!shareInfo) {
                    return;
                }

                return deleteShare(shareInfo.id);
            },
            {
                enabled: enableDeleteShare,
                onSuccess: (response?: ReturnWith<boolean>) => {
                    if (response?.success) {
                        onDeleteItem(shareInfo.id);
                    }
                },
            }
        );

    const {
        data: loadAdminInfoData,
        isLoading: loadingLoadAdminInfoDataQuery,
    } = useQuery<ReturnWith<Admin[]> | undefined, Error>(
        [shareInfo.admins.join(",")],
        () => {
            setEnableLoadAdminInfo(false);

            if (!shareInfo) {
                return;
            }

            return getAdminInfoByTag(shareInfo.admins.join(","));
        },
        {
            enabled: enableLoadAdminInfo,
            onSuccess: (response?: ReturnWith<Admin[]>) => {
                if (response?.success) {
                    setAdminList(response?.success);
                }
            },
        }
    );

    const {
        data: shareInfoEditAdminsResult,
        isLoading: loadingshareInfoEditAdminsQuery,
    } = useQuery<ReturnWith<string>, Error>(
        [`edit-contacts`, adminList.join(",")],
        () => {
            setEnableEditShareAdmins(false);
            return patchChangeShareAdmins({
                id: shareInfo.id,
                tag: userInfo.tag,
                admins: adminList.map((admin) => admin.tag).join(","),
            });
        },
        {
            enabled: enableEditShareAdmins,
            onSuccess: (response?: ReturnWith<string>) => {
                if (!shareInfo) {
                    return;
                }

                if (response?.success) {
                    onChangeAdminList(
                        shareInfo.id,
                        response?.success
                            .split(",")
                            .map((admin) => parseInt(admin))
                    );
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    useEffect(() => {
        if (!popupOpen) {
            return;
        }

        setEnableLoadAdminInfo(true);
    }, [popupOpen]);

    useEffect(() => {
        checkShareAdminsIsValidateAndChageEditButtonStatus();
    }, [adminList]);

    const makeGoodsStringPerType = (goods: ShareInfoGoods) => {
        if (goods.type === 0) {
            return `${goods.input.text} ${goods.input.number}개`;
        } else if ([1, 2].includes(goods.type)) {
            return `${goods.input.number?.toLocaleString()}원`;
        } else if ([3].includes(goods.type)) {
            return `${goods.input.text}`;
        }
    };

    const handleClickItemAdminButton = (id: ShareInfoId) => {
        if (
            shareInfo.admins.length === 1 &&
            shareInfo.admins[0] === userInfo.tag
        ) {
            setPopupOpen(!popupOpen);
            return;
        }

        setChangeAdminStatus({
            id,
            status: true,
        });
    };

    const handleClickDeleteButton = (id: ShareInfoId) => {
        setEnableDeleteShare(true);
    };

    const handleClickAddUserAsAdminButton = (newAdmin: Admin) => {
        setAdminList([...adminList, newAdmin]);
    };
    const handleClickAddAllCheckedUserAsAdminButton = (newAdmins: Admin[]) => {
        setAdminList([...adminList, ...newAdmins]);
    };

    const handleDeleteAdminLine = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };

    const handleDeleteAdmins = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };

    const handleClickCancelEditAdmin = () => {
        setPopupOpen(false);
    };

    const handleClickSubmitEditAdmin = () => {
        const result = checkShareAdminsIsValidateAndChageEditButtonStatus();

        if (result) {
            setEnableEditShareAdmins(true);
        }
    };

    const checkShareAdminsIsValidateAndChageEditButtonStatus = () => {
        const validationResult = validateAdmins(adminList);

        if (!validationResult.result) {
            setDisableShareAdminsEditButton(true);
            return false;
        }

        setDisableShareAdminsEditButton(false);
        return true;
    };

    return (
        <div className={`sharing-list-item type-${shareInfo.status}`}>
            <input
                className="delete-checkbox"
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                    onChangeDeleteCheckbox(shareInfo, event.target.checked)
                }
            />
            <button
                className="admin"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleClickItemAdminButton(shareInfo.id);
                }}
            >
                {shareInfo.admins.length === 1 ? (
                    <UserPlusIcon className="icon plus" />
                ) : (
                    <UserMinusIcon className="icon minus" />
                )}
            </button>
            {popupOpen && (
                <div className="admin-select-box">
                    <div className="admin-select-box-title">
                        <SharingInputAdminRulePopup />
                        <div className="buttons">
                            <button
                                className="cancel"
                                onClick={handleClickCancelEditAdmin}
                            >
                                취소
                            </button>
                            <button
                                className="save"
                                onClick={handleClickSubmitEditAdmin}
                                disabled={disableShareAdminsEditButton}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                    <div className="admin-select-box-contents">
                        <SharingInputAdminsContent
                            adminList={adminList}
                            handleAddAdminLine={handleClickAddUserAsAdminButton}
                            handleAddAdmins={
                                handleClickAddAllCheckedUserAsAdminButton
                            }
                            handleDeleteAdminLine={handleDeleteAdminLine}
                            handleDeleteAdmins={handleDeleteAdmins}
                        />
                    </div>
                </div>
            )}
            <>
                <button
                    className="delete"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        handleClickDeleteButton(shareInfo.id);
                    }}
                >
                    <TrashIcon className="icon" />
                </button>
            </>
            <div className="list-item-line list-item-title">
                {shareInfo.name}
                {typeof shareInfo.status !== "undefined" &&
                    shareInfo.status > -1 && (
                        <div
                            className={`sharing-status-badge type-${shareInfo.status}`}
                        >
                            {shareInfo.status === 0
                                ? "진행중"
                                : shareInfo.status === 1
                                ? "휴식중"
                                : shareInfo.status === 2
                                ? "마감"
                                : shareInfo.status === 3 && "신고 누적"}
                        </div>
                    )}
            </div>
            <div className="list-item-line list-item-goods">
                {shareInfo.goods[0] && (
                    <div
                        className={`goods-badge type-${shareInfo.goods[0].type}`}
                    >
                        {makeGoodsStringPerType(shareInfo.goods[0])}
                    </div>
                )}
                {shareInfo.goods[1] && (
                    <div
                        className={`list-item-line goods-badge type-${shareInfo.goods[0].type}`}
                    >
                        {makeGoodsStringPerType(shareInfo.goods[1])}
                    </div>
                )}
                {shareInfo.goods[2] && `외 ${shareInfo.goods.length - 2}개`}
            </div>
            <div className="list-item-line list-item-point-name">
                <MapPinIcon className="w-5 h-5" />
                <span>장소: {shareInfo.point_name}</span>
            </div>
            {shareInfo.contacts && (
                <div className="list-item-line list-item-contact-name">
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                    <span>연락처: {shareInfo.contacts[0]}</span>
                </div>
            )}
        </div>
    );
};

export default ShareListItem;

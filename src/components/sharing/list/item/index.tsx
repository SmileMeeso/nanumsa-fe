import { useState, useRef, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import {
    ShareInfo,
    ShareInfoGoods,
    ShareInfoId,
} from "@components/menus/sharing";

import {
    MapPinIcon,
    DevicePhoneMobileIcon,
    StarIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

import {
    postChangeShareStarStatus,
    postChangeShareAdminStatus,
    ReturnWith,
} from "@/api/request/requests";

import {
    StarIcon as FilledStarIcon,
    UserIcon as FilledUserIcon,
} from "@heroicons/react/16/solid";

import { ChangeStarStatusResponse } from "@components/menus/sharing/detail";

import { format } from "date-fns";

import { AuthContext } from "@/App";

import "./listItem.css";

export interface ShareListItemProps {
    shareInfo: ShareInfo;
    onChangeStarStatus: (id: ShareInfoId, status: boolean) => void;
    onChangeAdminStatus: (id: ShareInfoId, admins: string) => void;
}

export interface ShareListItemChangeAdminStatus {
    id: ShareInfoId;
    admins: string;
}

const ShareListItem = ({
    shareInfo,
    onChangeStarStatus,
    onChangeAdminStatus,
}: ShareListItemProps) => {
    const natigate = useNavigate();

    const { userInfo } = useContext(AuthContext);

    const [changeStarStatus, setChangeStarStatus] =
        useState<ChangeStarStatusResponse | null>(null);
    const [changeAdminStatus, setChangeAdminStatus] = useState<{
        id: ShareInfoId;
        status: boolean;
    } | null>(null);

    const [reasonPopupOpen, setReasonPopupOpen] = useState<boolean>(false);
    const [popupOpen, setPopupOpen] = useState<boolean>(false);

    const date = useRef(new Date());

    const {
        data: changeStarStatusResult,
        isLoading: loadingChangeStarStatusQuery,
    } = useQuery<ReturnWith<ChangeStarStatusResponse> | undefined, Error>(
        [
            "change-star-status",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            JSON.stringify(changeStarStatus),
        ],
        () => {
            if (changeStarStatus === null) {
                return;
            }
            return postChangeShareStarStatus({
                id: changeStarStatus.id,
                to_be: changeStarStatus.status,
            });
        },
        {
            enabled: changeStarStatus !== null,
            onSettled: () => {
                setChangeStarStatus(null);
            },
            onSuccess: (response?: ReturnWith<ChangeStarStatusResponse>) => {
                if (response?.success === undefined) {
                    return;
                }
                onChangeStarStatus(
                    response?.success.id,
                    response?.success.status
                );
            },
        }
    );

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
                onChangeAdminStatus(
                    response?.success.id,
                    response?.success.admins
                );
            },
        }
    );

    const makeGoodsStringPerType = (goods: ShareInfoGoods) => {
        if (goods.type === 0) {
            return `${goods.input.text} ${goods.input.number}개`;
        } else if ([1, 2].includes(goods.type)) {
            return `${goods.input.number?.toLocaleString()}원`;
        } else if ([3].includes(goods.type)) {
            return `${goods.input.text}`;
        }
    };

    const handleClickListItem = (id: number) => {
        natigate(`/sharing/detail/${id}`);
    };

    const handleClickItemStarButton = (id: number, starred?: boolean) => {
        setChangeStarStatus({
            id: id,
            status: !starred,
        });
    };

    const handleClickItemAdminButton = () => {
        if (
            shareInfo.admins.length === 1 &&
            shareInfo.admins[0] === userInfo.tag
        ) {
            setReasonPopupOpen(!reasonPopupOpen);
            return;
        }

        setPopupOpen(true);
    };

    const handleClickItemAdminSubmitButton = (
        id: ShareInfoId,
        isIncludesAdmin: boolean
    ) => {
        if (
            shareInfo.admins.length === 1 &&
            shareInfo.admins[0] === userInfo.tag
        ) {
            return;
        }
        setChangeAdminStatus({
            id,
            status: isIncludesAdmin,
        });
    };

    const handleClickItemAdminCloseReasonPopup = () => {
        setReasonPopupOpen(false);
    };

    return (
        <div
            className={`sharing-list-item type-${shareInfo.status}`}
            onClick={() => {
                if (!shareInfo.id) {
                    return;
                }
                handleClickListItem(shareInfo.id);
            }}
        >
            {shareInfo.admins.includes(userInfo.tag) && (
                <>
                    <button
                        className={`admin ${
                            shareInfo.admins.length === 1 &&
                            shareInfo.admins[0] === userInfo.tag &&
                            "disabled"
                        }`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            handleClickItemAdminButton();
                        }}
                    >
                        {shareInfo.admins.includes(userInfo.tag) ? (
                            <FilledUserIcon className="icon filled" />
                        ) : (
                            <UserIcon className="icon" />
                        )}
                    </button>
                    {reasonPopupOpen && (
                        <div className="popup">
                            최소 1명 이상의 어드민은 필요합니다.
                            <button
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    handleClickItemAdminCloseReasonPopup();
                                }}
                            >
                                <XMarkIcon className="icon" />
                            </button>
                        </div>
                    )}
                    {popupOpen && (
                        <div className="popup">
                            어드민을 그만두시겠어요?
                            <button
                                className="submit-button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    handleClickItemAdminSubmitButton(
                                        shareInfo.id,
                                        shareInfo.admins.includes(userInfo.tag)
                                    );
                                }}
                            >
                                네
                            </button>
                            <button
                                className="close-button"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    handleClickItemAdminCloseReasonPopup();
                                }}
                            >
                                <XMarkIcon className="icon" />
                            </button>
                        </div>
                    )}
                </>
            )}
            <button
                className="starred"
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleClickItemStarButton(shareInfo.id, shareInfo.starred);
                }}
                disabled={loadingChangeStarStatusQuery}
            >
                {shareInfo.starred ? (
                    <FilledStarIcon className="icon filled" />
                ) : (
                    <StarIcon className="icon" />
                )}
            </button>
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

import {
    useEffect,
    useState,
    useContext,
    KeyboardEvent,
    ChangeEvent,
    useRef,
} from "react";

import { useQuery } from "react-query";

import { useNavigate } from "react-router-dom";

import { MapContext, AuthContext } from "@/App";

import ShareListItem from "@components/sharing/list/item";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButton from "@components/wrapper/container/page/pageWithBackButton";
import AskAddShareScreenToMy from "@components/statusScreen/askShareToMy";

import { format } from "date-fns";

import {
    ShareInfo,
    ShareInfoForResponse,
    ShareInfoGoods,
    ShareInfoId,
    parseShareInfoResponseToShareInfo,
} from "..";

import { ReturnWith, getStarredShareList } from "@/api/request/requests";

import {
    StarIcon as FilledStarIcon,
    ShoppingBagIcon,
} from "@heroicons/react/16/solid";

import "./sharingStarred.css";

export interface SharingMyMenuProps {
    mapOnlyChecked: boolean;
    searchKeyword: string;
    enableSearchKeywordQuery: boolean;
}

const SharingStarMenu = () => {
    const natigate = useNavigate();

    const { userInfo } = useContext(AuthContext);

    const [shareList, setShareList] = useState<ShareInfo[]>([]);
    const [filteredShareList, setFilteredShareList] = useState<ShareInfo[]>([]);

    const [enableLoadMyShare, setEnableLoadMyShare] = useState<boolean>(false);

    const [showGoingStatusList, setShowGoingStatusList] =
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
                return getStarredShareList();
            },
            {
                enabled: enableLoadMyShare,
                onSuccess: (response?: ReturnWith<ShareInfoForResponse[]>) => {
                    if (response?.success) {
                        const parsedShareList = response?.success.map(
                            (result) => ({
                                ...result,
                                admins: result.admins
                                    .split(",")
                                    .map((admin) => parseInt(admin)),
                                contacts: result.contacts.split(","),
                                goods: JSON.parse(result.goods),
                            })
                        );

                        setShareList(parsedShareList);
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
        if (!userInfo.isLogined) {
            natigate(-1);
        }
    }, [userInfo]);

    useEffect(() => {
        doSearch();
    }, [showGoingStatusList]);

    const handleChangeGoingOnlyCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setShowGoingStatusList(event.target.checked);
    };

    const doSearch = () => {
        setFilteredShareList(
            shareList.filter((list) =>
                showGoingStatusList ? list.status === 0 : true
            )
        );
    };

    const handleChangeStarStatus = (id: ShareInfoId, status: boolean) => {
        setShareList(
            shareList.map((item) =>
                item.id !== id ? item : { ...item, starred: status }
            )
        );
    };

    const handleChangeAdminStatus = (id: ShareInfoId, status: string) => {
        setShareList(
            shareList.map((item) =>
                item.id !== id
                    ? item
                    : {
                          ...item,
                          admins: status
                              .split(",")
                              .map((admin) => parseInt(admin)),
                      }
            )
        );
    };

    return (
        <FloatWrapper>
            <PageWithBackButton>
                {!loadingLoadMyShareDataQuery && shareList.length === 0 ? (
                    <AskAddShareScreenToMy />
                ) : (
                    <div className="sharing-menu sharing-starred-menu">
                        <div className="search-input-area">
                            <b className="sharing-starred-menu-title">
                                <FilledStarIcon className="icon" />
                                찜한 나눔 리스트
                            </b>
                            <div className="check-input-area">
                                <div className="check-input">
                                    <input
                                        checked={showGoingStatusList}
                                        id="sharing-list-search-check-input-checkbox-status"
                                        type="checkbox"
                                        onChange={handleChangeGoingOnlyCheckBox}
                                    />
                                    <label htmlFor="sharing-list-search-check-input-checkbox-status">
                                        진행중인 나눔만 보기
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="search-list-area">
                            {filteredShareList.map((shareInfo, idx) => (
                                <ShareListItem
                                    key={`sharing-menu sharing-starred-menu-list-item-${idx}`}
                                    shareInfo={shareInfo}
                                    onChangeStarStatus={handleChangeStarStatus}
                                    onChangeAdminStatus={
                                        handleChangeAdminStatus
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}
            </PageWithBackButton>
        </FloatWrapper>
    );
};

export default SharingStarMenu;

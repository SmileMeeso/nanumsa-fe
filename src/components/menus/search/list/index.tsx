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

import { MapContext, AuthContext, SearchContext } from "@/App";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonAndSearchWrapper from "@components/wrapper/container/page/pageWithBackButtonAndSearch";
import SearchInput from "@components/input/searchInput";
import AskAddShareScreen from "@components/statusScreen/askAddShare";

import {
    MapPinIcon,
    DevicePhoneMobileIcon,
    StarIcon,
} from "@heroicons/react/24/outline";

import { StarIcon as FilledStarIcon } from "@heroicons/react/16/solid";

import { format } from "date-fns";

import {
    ShareInfo,
    ShareInfoGoods,
    ShareInfoId,
    parseShareInfoResponseToShareInfo,
} from "../../sharing";

import { postChangeShareStarStatus, ReturnWith } from "@/api/request/requests";
import { ChangeStarStatusResponse } from "@components/menus/sharing/detail";

import ShareListItem from "@components/sharing/list/item";

import "./sharingList.css";

const SharingListMenu = () => {
    const { shareInfosInBounds } = useContext(MapContext);
    const { userInfo } = useContext(AuthContext);

    const [shareInfos, setShareInfos] = useState<ShareInfo[]>([]);
    const [searchResults, setSearchResults] = useState<ShareInfo[]>([]);
    const [firstSearchDone, setFirstSearchDone] = useState<boolean>(false);

    const [showMyShareList, setShowMyShareList] = useState<boolean>(false);
    const [showGoingStatusList, setShowGoingStatusList] =
        useState<boolean>(false);

    useEffect(() => {
        setShareInfos(
            shareInfosInBounds.map((shareInfo) =>
                parseShareInfoResponseToShareInfo(shareInfo)
            )
        );
    }, [shareInfosInBounds]);

    useEffect(() => {
        doSearch();
    }, [showMyShareList, showGoingStatusList, shareInfos]);

    const handleChangeMyAdminOnlyCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setFirstSearchDone(true);

        if (event.target.checked) {
            setShowMyShareList(true);
        } else {
            setShowMyShareList(false);
        }
    };

    const handleChangeGoingOnlyCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setFirstSearchDone(true);

        if (event.target.checked) {
            setShowGoingStatusList(true);
        } else {
            setShowGoingStatusList(false);
        }
    };

    const doSearch = () => {
        setSearchResults(
            shareInfos.filter(
                (shareInfos) =>
                    (showMyShareList
                        ? shareInfos.admins.includes(userInfo.tag)
                        : true) &&
                    (showGoingStatusList ? shareInfos.status === 0 : true)
            )
        );
    };

    const handleChangeStarStatus = (id: ShareInfoId, status: boolean) => {
        setShareInfos(
            shareInfos.map((item) =>
                item.id !== id ? item : { ...item, starred: status }
            )
        );
    };

    const handleChangeAdminStatus = (id: ShareInfoId, status: string) => {
        setShareInfos(
            shareInfos.map((item) =>
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
        <div className="search-wrapper">
            {(!firstSearchDone ? shareInfos : searchResults).length === 0 ? (
                <AskAddShareScreen />
            ) : (
                <div className="sharing-menu sharing-list-menu">
                    <div className="search-input-area">
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
                            <div className="check-input">
                                <input
                                    checked={showMyShareList}
                                    id="sharing-list-search-check-input-checkbox-my"
                                    type="checkbox"
                                    onChange={handleChangeMyAdminOnlyCheckBox}
                                />
                                <label htmlFor="sharing-list-search-check-input-checkbox-my">
                                    내가 관리자인 나눔만 보기
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="search-list-area">
                        {(!firstSearchDone ? shareInfos : searchResults).map(
                            (shareInfo, idx) => (
                                <ShareListItem
                                    key={`sharing-menu sharing-list-menu-list-item-${idx}`}
                                    shareInfo={shareInfo}
                                    onChangeStarStatus={handleChangeStarStatus}
                                    onChangeAdminStatus={
                                        handleChangeAdminStatus
                                    }
                                />
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharingListMenu;

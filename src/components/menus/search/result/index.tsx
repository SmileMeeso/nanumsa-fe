import { useEffect, useState, useContext, ChangeEvent, useRef } from "react";

import { useSearchParams } from "react-router-dom";

import { useQuery } from "react-query";

import {
    ShareInfoForResponse,
    ShareInfoId,
    ShareInfo,
    ShareInfoPoint,
} from "@components/menus/sharing";

import { getViewportCorners } from "@components/map";
import ShareListItem from "@components/sharing/list/item";

import { MapContext, SearchContext, AuthContext } from "@/App";

import { ReturnWith, getSearchResult } from "@/api/request/requests";

import NoSearchResultStatusScreen from "@/components/statusScreen/noSearchKeyword";

import { format } from "date-fns";

const SearchResultMenu = () => {
    const { map, setShareInfosInBounds } = useContext(MapContext);
    const { userInfo } = useContext(AuthContext);
    const { searchInfo, setSearchInfo, enableSearch, setEnableSearch } =
        useContext(SearchContext);

    const [searchParams, setSearchParams] = useSearchParams();

    const [showMyShareList, setShowMyShareList] = useState<boolean>(false);
    const [showGoingStatusList, setShowGoingStatusList] =
        useState<boolean>(false);

    const [shareInfoList, setShareInfoList] = useState<ShareInfo[]>([]);
    const [filteredShareInfoList, setFilteredShareInfoList] = useState<
        ShareInfo[]
    >([]);

    const date = useRef(new Date());

    const {
        data: likeKeywordResultsData,
        isLoading: loadingGetLikeKeywordListQuery,
    } = useQuery<ReturnWith<ShareInfoForResponse[]> | undefined, Error>(
        [
            searchInfo.keyword,
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
        ],
        () => {
            setEnableSearch(false);
            if (!searchInfo.keyword) {
                return;
            }
            if (searchInfo.mapOnly) {
                const bounds = getViewportCorners(map);

                return getSearchResult({
                    keyword: searchInfo.keyword.trim().replace(/\b/g, ""),
                    map_only: searchInfo.mapOnly,
                    southwest_lng: bounds?.southwest.lng,
                    southwest_lat: bounds?.southwest.lat,
                    northeast_lng: bounds?.northeast.lng,
                    northeast_lat: bounds?.northeast.lat,
                });
            } else {
                return getSearchResult({
                    keyword: searchInfo.keyword.trim().replace(/\b/g, ""),
                });
            }
        },
        {
            enabled: searchInfo.keyword !== "" && enableSearch,
            onSuccess: (response?: ReturnWith<ShareInfoForResponse[]>) => {
                if (response?.success) {
                    const parsedResults = response?.success.map((result) => ({
                        ...result,
                        admins: result.admins
                            .split(",")
                            .map((admin) => parseInt(admin)),
                        contacts: result.contacts.split(","),
                        goods: JSON.parse(result.goods),
                    }));
                    setShareInfoList(parsedResults);
                    setShareInfosInBounds(response?.success);
                } else {
                    setShareInfoList([]);
                    setShareInfosInBounds([]);
                }
            },
            cacheTime: 0,
            staleTime: 0,
        }
    );

    useEffect(() => {
        if (searchInfo.keyword !== "") {
            setEnableSearch(true);

            searchParams.set("keyword", searchInfo.keyword);
            setSearchParams(searchParams);
            searchParams.set("map_only", searchInfo.mapOnly.toString());
            setSearchParams(searchParams);
        }
    }, [searchInfo]);

    useEffect(() => {
        const keyword = searchParams.get("keyword") ?? "";
        const mapOnly =
            searchParams.get("map_only") === "true"
                ? true
                : searchParams.get("map_only") === "false"
                ? false
                : true;

        if (searchInfo.keyword !== keyword || searchInfo.mapOnly !== mapOnly) {
            setSearchInfo({
                keyword: keyword,
                mapOnly: mapOnly,
            });
        }
    }, [searchParams]);

    useEffect(() => {
        setFilteredShareInfoList(
            [...shareInfoList].filter(
                (item) =>
                    (showGoingStatusList
                        ? item.status === 0
                            ? true
                            : false
                        : true) &&
                    (showMyShareList
                        ? item.admins.includes(userInfo.tag)
                            ? true
                            : false
                        : true)
            )
        );
    }, [shareInfoList, showGoingStatusList, showMyShareList]);

    useEffect(() => {
        if (filteredShareInfoList.length === 0) {
            return;
        }

        const points: [number, number][] = filteredShareInfoList
            .filter((item) => item.point?.coordinates)
            .map((item) => item.point?.coordinates as [number, number])
            .map((point) => [point[1], point[0]]);

        map?.fitBounds(points);
    }, [filteredShareInfoList]);

    const handleChangeGoingOnlyCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setShowGoingStatusList(event.target.checked);
    };

    const handleChangeMyAdminOnlyCheckBox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setShowMyShareList(event.target.checked);
    };

    const handleChangeStarStatus = (id: ShareInfoId, status: boolean) => {
        setShareInfoList(
            shareInfoList.map((item) =>
                item.id !== id ? item : { ...item, starred: status }
            )
        );
    };

    const handleChangeAdminStatus = (id: ShareInfoId, status: string) => {
        setShareInfoList(
            shareInfoList.map((item) =>
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
                    {filteredShareInfoList.length === 0 ? (
                        <NoSearchResultStatusScreen
                            keyword={searchInfo.keyword ?? ""}
                        />
                    ) : (
                        filteredShareInfoList.map((shareInfo, idx) => (
                            <ShareListItem
                                key={`search-result-list-item--${shareInfo.id}-${idx}`}
                                shareInfo={shareInfo}
                                onChangeStarStatus={handleChangeStarStatus}
                                onChangeAdminStatus={handleChangeAdminStatus}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultMenu;

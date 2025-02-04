import React, {
    ChangeEvent,
    KeyboardEvent,
    CompositionEvent,
    PropsWithChildren,
    forwardRef,
    useState,
    useContext,
    useEffect,
    MouseEvent,
    useRef,
} from "react";

import { useQuery, useQueryClient } from "react-query";

import {
    ChevronLeftIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    RocketLaunchIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/16/solid";

import PageContainerWrapper from "@components/wrapper/container/page";

import NoSearchKeyword from "@components/statusScreen/noSearchKeyword";
import NoRecentSearchKeywordScreen from "@/components/statusScreen/noRecentSearchKeyword";

import { useNavigate } from "react-router-dom";

import { AuthContext, MapContext } from "@/App";

import {
    ShareInfoDoroAddress,
    ShareInfoId,
    ShareInfoJibunAddress,
    ShareInfoName,
    ShareInfoPointLat,
    ShareInfoPointLng,
    ShareInfoForResponse,
} from "@components/menus/sharing";

import { ShareMapBounds } from "@components/map";

import {
    getRecentSearchKeyword,
    getLikeSearchKeywordsWithKeyword,
    postAddRecentSearchKeyword,
    deleteRecentSearchKeyword,
    deleteAllRecentSearchKeyword,
    ReturnWith,
    MessageReturn,
} from "@/api/request/requests";

import { format } from "date-fns";

import "@components/wrapper/container/page/pageWithBackButtonAndSearch/pageWithBackButtonAndSearch.css";

export type SearchKeyword = string;

export interface LikeSearchResultIdOnly {
    name: ShareInfoName;
    id: ShareInfoId;
}

export interface LikeSearchResultCount {
    name: ShareInfoName;
    count: number;
}

export interface RecentKeyword {
    id: number;
    keyword: SearchKeyword;
}

export type LikeSearchResult = LikeSearchResultCount | LikeSearchResultIdOnly;

export const recentSearchKeywordLocalstorageKey = "recent-keywords-list";

export interface SearchProps {
    handleChangeMapOnlyChecked: (checked: boolean) => void;
    handleChangeSearchKeyword: (keyword: string) => void;
    handleChangeEnableSearchQuery: (enabled: boolean) => void;
}

const Search = ({
    handleChangeMapOnlyChecked,
    handleChangeSearchKeyword,
    handleChangeEnableSearchQuery,
}: SearchProps) => {
    const { userInfo } = useContext(AuthContext);
    const { map, setShareInfosInBounds } = useContext(MapContext);

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [searchTriggerType, setSearchTriggerType] = useState<number | null>(
        null
    );
    const [inputValue, setInputValue] = useState<string>("");
    const [mapOnlyChecked, setMapOnlyChecked] = useState<boolean>(true);
    const [enableSearchKeywordQuery, setEnableSearchKeywordQuery] =
        useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [enableGetRecentKeywordQuery, setEnableGetRecentKeywordQuery] =
        useState<boolean>(false);
    const [enableSaveRecentKeywordQuery, setEnableSaveRecentKeywordQuery] =
        useState<boolean>(false);
    const [
        enableDeleteAllRecentKeywordQuery,
        setEnableDeleteAllRecentKeywordQuery,
    ] = useState<boolean>(false);
    const [recentKeywords, setRecentKeywords] = useState<RecentKeyword[]>([]);
    const [deleteRecentKeywordId, setDeleteRecentKeywordId] = useState<
        number | null
    >(null);
    const [keywordForLikeSearch, setKeywordForLikeSearch] =
        useState<SearchKeyword>("");
    const [keywords, setKeywords] = useState<LikeSearchResult[]>([]);

    const date = useRef(new Date());

    const {
        data: likeKeywordResultsData,
        isLoading: loadingGetLikeKeywordListQuery,
    } = useQuery<ReturnWith<LikeSearchResult[]>, Error>(
        [keywordForLikeSearch, mapOnlyChecked],
        () => {
            if (mapOnlyChecked) {
                const bounds = getViewportCorners();

                return getLikeSearchKeywordsWithKeyword({
                    keyword: keywordForLikeSearch,
                    map_only: mapOnlyChecked,
                    southwest_lng: bounds?.southwest.lng,
                    southwest_lat: bounds?.southwest.lat,
                    northeast_lng: bounds?.northeast.lng,
                    northeast_lat: bounds?.northeast.lat,
                });
            } else {
                return getLikeSearchKeywordsWithKeyword({
                    keyword: keywordForLikeSearch,
                });
            }
        },
        {
            enabled: keywordForLikeSearch !== "",
            onSuccess: (response?: ReturnWith<LikeSearchResult[]>) => {
                if (response?.success) {
                    console.log(response.success);
                }
            },
            retry: 0,
            cacheTime: 5 * 1000,
            staleTime: 5 * 1000,
            keepPreviousData: true,
        }
    );

    const {
        data: saveRecentSearchKeywordData,
        isLoading: loadingSaveRecentSearchKeywordDataQuery,
    } = useQuery<ReturnWith<RecentKeyword[]> | undefined, Error>(
        [searchKeyword],
        () => {
            setEnableSaveRecentKeywordQuery(false);

            if (searchTriggerType === null) {
                return;
            }
            return postAddRecentSearchKeyword({
                keyword: searchKeyword,
                type: searchTriggerType,
            });
        },
        {
            enabled:
                enableSaveRecentKeywordQuery &&
                searchKeyword !== "" &&
                searchTriggerType !== null &&
                userInfo.isLogined,
            onSettled: () => {
                setSearchTriggerType(null);
            },
            refetchOnWindowFocus: true,
            retry: 0,
            staleTime: 0,
        }
    );

    const {
        data: getRecentSearchKeywordData,
        isLoading: loadingGetRecentSearchKeywordDataQuery,
    } = useQuery<ReturnWith<RecentKeyword[]>, Error>(
        [
            "get-recent-search-keyword-data",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
        ],
        () => {
            setEnableGetRecentKeywordQuery(false);

            return getRecentSearchKeyword();
        },
        {
            enabled: enableGetRecentKeywordQuery,
            onSuccess: (response?: ReturnWith<RecentKeyword[]>) => {
                if (response?.success) {
                    setRecentKeywords(response.success);
                }
            },
            refetchOnWindowFocus: true,
            retry: 0,
            staleTime: 0,
        }
    );

    const {
        data: deleteRecentSearchKeywordData,
        isLoading: loadingDeleteRecentSearchKeywordDataQuery,
    } = useQuery<ReturnWith<number> | undefined, Error>(
        [deleteRecentKeywordId],
        () => {
            if (deleteRecentKeywordId === null) {
                return;
            }
            return deleteRecentSearchKeyword(deleteRecentKeywordId);
        },
        {
            enabled: deleteRecentKeywordId !== null,
            onSettled: () => {
                setDeleteRecentKeywordId(null);
            },
            onSuccess: (response?: ReturnWith<number>) => {
                if (response?.success) {
                    setRecentKeywords(
                        recentKeywords.filter(
                            (item) => item.id !== response?.success
                        )
                    );
                }
            },
            retry: 0,
        }
    );

    const {
        data: deleteAllRecentSearchKeywordData,
        isLoading: loadingDeleteAllRecentSearchKeywordDataQuery,
    } = useQuery<ReturnWith<MessageReturn>, Error>(
        [
            "delete-all-recent-search-keyword-data",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
        ],
        () => {
            setEnableDeleteAllRecentKeywordQuery(false);

            return deleteAllRecentSearchKeyword();
        },
        {
            enabled: enableDeleteAllRecentKeywordQuery,
            onSuccess: () => {
                setRecentKeywords([]);
            },
            refetchOnWindowFocus: true,
            retry: 0,
            staleTime: 0,
        }
    );

    useEffect(() => {
        if (userInfo.isLogined) {
            setEnableGetRecentKeywordQuery(true);
        } else {
            const recentKeywordsString = localStorage.getItem(
                recentSearchKeywordLocalstorageKey
            );
            setRecentKeywords(JSON.parse(recentKeywordsString ?? "[]"));
        }
    }, []);

    useEffect(() => {
        if (!likeKeywordResultsData?.success) {
            return;
        }
        setKeywords(likeKeywordResultsData?.success);
    }, [likeKeywordResultsData]);

    useEffect(() => {
        if (!saveRecentSearchKeywordData?.success) {
            return;
        }
        setRecentKeywords(saveRecentSearchKeywordData?.success);
    }, [saveRecentSearchKeywordData]);

    const getViewportCorners = (): ShareMapBounds | null => {
        if (!map) {
            return null;
        }

        const bounds = map.getBounds();

        const corners = {
            southwest: {
                lat: bounds.getSouthWest().lat,
                lng: bounds.getSouthWest().lng,
            }, // 남서쪽
            northwest: {
                lat: bounds.getNorthWest().lat,
                lng: bounds.getNorthWest().lng,
            }, // 북서쪽
            northeast: {
                lat: bounds.getNorthEast().lat,
                lng: bounds.getNorthEast().lng,
            }, // 북동쪽
            southeast: {
                lat: bounds.getSouthEast().lat,
                lng: bounds.getSouthEast().lng,
            }, // 남동쪽
        };

        return corners;
    };

    const handleClickBackButton = () => {
        goBack();
    };

    const handleClickMyPageButton = () => {
        if (userInfo.isLogined) {
            navigate("/user/info");
        } else {
            navigate("/user/login");
        }
    };

    const handleClickGoToDetailButton = (id: ShareInfoId) => {
        closeKeywordSearch();
        navigate(`/sharing/detail/${id}`);
    };

    const goBack = () => {
        navigate(-1);
    };

    const handleInputSearchKeywordInput = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setInputValue(event.target.value);
    };

    const handleKeyDownSearchKeywordInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.nativeEvent.isComposing) {
            return;
        }
        if (event.key !== "Enter") {
            return;
        }
        closeKeywordSearch();
        setSearchKeyword(inputValue);
        handleChangeSearchKeyword(inputValue);

        if (userInfo.isLogined) {
            setSearchTriggerType(0);
            setEnableSaveRecentKeywordQuery(true);
            setEnableSearchKeywordQuery(true);
            handleChangeEnableSearchQuery(true);
        } else {
            const newRecentKeywords = [
                { keyword: inputValue, type: 0 },
                ...recentKeywords,
            ].map((item, idx) => ({ ...item, id: idx }));

            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    const handleCompositionEndInput = (
        event: CompositionEvent<HTMLInputElement>
    ) => {
        setKeywordForLikeSearch(event.currentTarget.value);
    };

    const handleChangeOnlyMapCheckbox = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setMapOnlyChecked(event.target.checked);
        handleChangeMapOnlyChecked(event.target.checked);
    };

    const handleClickSearchButton = () => {
        closeKeywordSearch();
        setSearchKeyword(inputValue);
        handleChangeSearchKeyword(inputValue);

        if (userInfo.isLogined) {
            setSearchTriggerType(1);
            setEnableSaveRecentKeywordQuery(true);
            setEnableSearchKeywordQuery(true);
            handleChangeEnableSearchQuery(true);
        } else {
            const newRecentKeywords = [
                { keyword: inputValue, type: 1 },
                ...recentKeywords,
            ].map((item, idx) => ({ ...item, id: idx }));

            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    const toggleKeywordSearch = () => {
        setIsOpen(!isOpen);
    };

    const handleClickInput = () => {
        setIsOpen(true);
    };

    const closeKeywordSearch = () => {
        setIsOpen(false);
    };

    const handleClickSearchKeyword = (keyword: string) => {
        closeKeywordSearch();
        setSearchKeyword(keyword);
        handleChangeSearchKeyword(keyword);
        setInputValue(keyword);

        if (userInfo.isLogined) {
            setSearchTriggerType(2);
            setEnableSaveRecentKeywordQuery(true);
        } else {
            const newRecentKeywords = [
                { keyword: inputValue, type: 2 },
                ...recentKeywords,
            ].map((item, idx) => ({ ...item, id: idx }));

            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    const handleClickRecentKeyword = (keyword: string) => {
        closeKeywordSearch();
        setInputValue(keyword);
        setSearchKeyword(keyword);
        handleChangeSearchKeyword(keyword);

        if (userInfo.isLogined) {
            setSearchTriggerType(3);
            setEnableSaveRecentKeywordQuery(true);
        } else {
            const newRecentKeywords = [
                { keyword: keyword, type: 3 },
                ...recentKeywords,
            ].map((item, idx) => ({ ...item, id: idx }));

            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    const handleClickRecentKeywordDeleteButton = (
        event: MouseEvent<HTMLButtonElement>,
        id: number
    ) => {
        event.preventDefault();
        event.stopPropagation();

        if (userInfo.isLogined) {
            setDeleteRecentKeywordId(id);
        } else {
            const newRecentKeywords = recentKeywords.filter(
                (item) => item.id !== id
            );
            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    const handleClickDeleteAllRecentKeywordButton = () => {
        if (userInfo.isLogined) {
            setEnableDeleteAllRecentKeywordQuery(true);
        } else {
            const newRecentKeywords: RecentKeyword[] = [];
            setRecentKeywords(newRecentKeywords);

            localStorage.setItem(
                recentSearchKeywordLocalstorageKey,
                JSON.stringify(newRecentKeywords)
            );
        }
    };

    return (
        <div className="page-with-back-button-and-search">
            <div className="header">
                <div className="input-area">
                    <button
                        className="back-button"
                        onClick={handleClickBackButton}
                    >
                        <ChevronLeftIcon className="icon" />
                    </button>
                    <input
                        value={inputValue}
                        className="search-input"
                        type="text"
                        onChange={handleInputSearchKeywordInput}
                        onKeyDown={handleKeyDownSearchKeywordInput}
                        onCompositionEnd={handleCompositionEndInput}
                        onClick={handleClickInput}
                    />
                    <button
                        className="search-button"
                        onClick={handleClickSearchButton}
                    >
                        <MagnifyingGlassIcon className="icon" />
                    </button>
                    <button
                        className="userinfo-button"
                        onClick={handleClickMyPageButton}
                    >
                        <UserIcon className="icon" />
                    </button>
                </div>
                <div className="only-map">
                    <div>
                        <input
                            id="search-in-map-only-checkbox"
                            type="checkbox"
                            checked={mapOnlyChecked}
                            onChange={handleChangeOnlyMapCheckbox}
                        />
                        <label htmlFor="search-in-map-only-checkbox">
                            지도 내에서만 검색하기
                        </label>
                    </div>
                    <div
                        className="close-keyword-search"
                        onClick={toggleKeywordSearch}
                    >
                        {isOpen ? "키워드 검색 닫기" : "키워드 검색 열기"}
                        <button>
                            {isOpen ? (
                                <ChevronUpIcon className="icon" />
                            ) : (
                                <ChevronDownIcon className="icon" />
                            )}
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <div className="keyword-relative">
                        <div className="wrapper">
                            {inputValue === "" ? (
                                <div className="result recent-results">
                                    {recentKeywords.length === 0 ? (
                                        <NoRecentSearchKeywordScreen />
                                    ) : (
                                        <ul>
                                            {recentKeywords.map((item, idx) => (
                                                <li
                                                    key={`page-with-back-button-and-search-recent-keyword-item-${idx}`}
                                                    className="result-line"
                                                    onClick={() => {
                                                        handleClickRecentKeyword(
                                                            item.keyword
                                                        );
                                                    }}
                                                >
                                                    {item.keyword}
                                                    <button
                                                        className="tail-button"
                                                        onClick={(event) => {
                                                            handleClickRecentKeywordDeleteButton(
                                                                event,
                                                                item.id
                                                            );
                                                        }}
                                                    >
                                                        <XMarkIcon className="icon" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : keywords.length > 0 ? (
                                <div className="result search-results">
                                    {keywords.map((keyword, idx) => (
                                        <li
                                            key={`page-with-back-button-and-search-result-keyword-${idx}`}
                                            className="result-line"
                                            onClick={() => {
                                                if ("id" in keyword) {
                                                    handleClickGoToDetailButton(
                                                        keyword.id
                                                    );
                                                } else if ("count" in keyword) {
                                                    handleClickSearchKeyword(
                                                        keyword.name
                                                    );
                                                }
                                            }}
                                        >
                                            <div>
                                                {keyword.name
                                                    .split(
                                                        new RegExp(
                                                            `(${keywordForLikeSearch})`,
                                                            "g"
                                                        )
                                                    )
                                                    .filter(Boolean)
                                                    .map((chopped) =>
                                                        chopped !==
                                                        keywordForLikeSearch ? (
                                                            chopped
                                                        ) : (
                                                            <b className="matched-keyword">
                                                                {chopped}
                                                            </b>
                                                        )
                                                    )}
                                                {"count" in keyword &&
                                                    keyword.count > 1 &&
                                                    `(${keyword.count})`}
                                            </div>
                                            {"id" in keyword && (
                                                <div>
                                                    <span className="search-result-direct-tail">
                                                        바로 이동하기
                                                    </span>
                                                    <button className="tail-button">
                                                        <RocketLaunchIcon className="icon" />
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </div>
                            ) : (
                                keywords.length === 0 && (
                                    <div className="result no-results">
                                        <NoSearchKeyword
                                            keyword={keywordForLikeSearch}
                                        />
                                    </div>
                                )
                            )}
                            <div className="tail-area">
                                {inputValue === "" && (
                                    <div className="delete-all">
                                        <button
                                            onClick={
                                                handleClickDeleteAllRecentKeywordButton
                                            }
                                            disabled={
                                                loadingDeleteAllRecentSearchKeywordDataQuery ||
                                                recentKeywords.length === 0
                                            }
                                        >
                                            전부 지우기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;

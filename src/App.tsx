import { createContext, useEffect, useState } from "react";

import "./App.css";

import { Outlet, useLocation } from "react-router-dom";

import { useQuery } from "react-query";

import MapComponent from "@components/map";
import SearchDefaultMenu from "@/components/menus/search/default";
import { Map } from "leaflet";

import {
    UserToken,
    postTokenLogin,
    AddUserReturn,
} from "@/api/request/requests";

import { SearchInfo } from "@components/menus/search";

import { ShareInfoForResponse } from "@components/menus/sharing";

export interface UserInfo {
    token: string;
    nickname: string;
    tag: number;
    isSocial: boolean;
    isLogined: boolean;
    loading: boolean;
}

interface MapContextType {
    map: Map | undefined;
    setMap: (map: Map) => void;
    shareInfosInBounds: ShareInfoForResponse[];
    setShareInfosInBounds: (ShareInfo: ShareInfoForResponse[]) => void;
}

interface SearchContextType {
    enableSearch: boolean;
    setEnableSearch: React.Dispatch<React.SetStateAction<boolean>>;
    searchInfo: SearchInfo;
    setSearchInfo: React.Dispatch<React.SetStateAction<SearchInfo>>;
    isMapView: boolean;
    setIsMapView: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultMapContextState = {
    map: undefined,
    setMap: () => {},
    shareInfosInBounds: [],
    setShareInfosInBounds: () => {},
};
const defaultAuthContextState = {
    userInfo: {
        token: "",
        nickname: "",
        tag: 0,
        isSocial: false,
        isLogined: false,
        loading: true,
    },
    setUserInfo: (userInfo: UserInfo) => {},
};
const defaultSearchContextState = {
    enableSearch: false,
    setEnableSearch: () => {},
    searchInfo: {
        keyword: "",
        mapOnly: true,
    },
    setSearchInfo: () => {},
    isMapView: window.innerWidth > 1024 ? false : true,
    setIsMapView: () => {},
};

export const MapContext = createContext<MapContextType>(defaultMapContextState);
export const AuthContext = createContext(defaultAuthContextState);
export const SearchContext = createContext<SearchContextType>(
    defaultSearchContextState
);

function App() {
    const location = useLocation();
    const [map, setMap] = useState<Map | undefined>();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        token: "",
        nickname: "",
        tag: 0,
        isSocial: false,
        isLogined: false,
        loading: true,
    });
    const [shareInfosInBounds, setShareInfosInBounds] = useState<
        ShareInfoForResponse[]
    >([]);
    const [userToken, setUserToken] = useState<UserToken | null>(null);
    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [enableSearch, setEnableSearch] = useState<boolean>(false);
    const [searchInfo, setSearchInfo] = useState<SearchInfo>({
        keyword: "",
        mapOnly: true,
    });
    const [isMapView, setIsMapView] = useState(
        window.innerWidth > 1024 ? false : true
    );

    const { data: loginData, isLoading } = useQuery<
        AddUserReturn | undefined,
        Error
    >(
        [userToken],
        () => {
            setEnableQuery(false);
            if (userToken === null) {
                setUserInfo({
                    ...userInfo,
                    isLogined: false,
                    loading: false,
                });

                return;
            }
            return postTokenLogin({ token: userToken });
        },
        {
            enabled: enableQuery && userInfo.loading,
            onSuccess: (response?: AddUserReturn) => {
                if (response?.success) {
                    setUserInfo({
                        ...response?.success,
                        isLogined: true,
                        loading: false,
                    });
                } else {
                    setUserInfo({
                        ...userInfo,
                        isLogined: false,
                        loading: false,
                    });
                }
            },
            retry: 1,
        }
    );

    useEffect(() => {
        setTokenIfExist();
    }, []);

    useEffect(() => {
        if (searchInfo.keyword !== "") {
            setIsMapView(false);
        }
    }, [searchInfo]);

    useEffect(() => {
        if (userInfo.loading) {
            return;
        }
        if (userInfo.isLogined) {
            return;
        }

        setEnableQuery(true);
    }, [userInfo]);

    const setTokenIfExist = () => {
        const isRemain = window.localStorage.getItem("remain-login");
        const token = window.localStorage.getItem("auth-token");

        if (isRemain) {
            setUserToken(token);
            setEnableQuery(true);
        } else {
            setUserInfo({
                ...userInfo,
                isLogined: false,
                loading: false,
            });
        }
    };

    return (
        <AuthContext.Provider value={{ userInfo, setUserInfo }}>
            <SearchContext.Provider
                value={{
                    enableSearch,
                    setEnableSearch,
                    searchInfo,
                    setSearchInfo,
                    isMapView,
                    setIsMapView,
                }}
            >
                <MapContext.Provider
                    value={{
                        map,
                        setMap,
                        shareInfosInBounds,
                        setShareInfosInBounds,
                    }}
                >
                    <MapComponent mapId="main-map" />
                    {!userInfo.loading && location.pathname === "/" && (
                        <SearchDefaultMenu />
                    )}
                    {!userInfo.loading && <Outlet />}
                </MapContext.Provider>
            </SearchContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;

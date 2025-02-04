import urls from "./urls";
import { fetchGet, fetchPost, fetchPatch, fetchDelete } from "./fetch";
import { AddressSearchResult } from "@components/jusoSearch";
import {
    ShareInfoDoroAddress,
    ShareInfoForRequest,
    ShareInfoJibunAddress,
    ShareInfoPointLat,
    ShareInfoPointLng,
    SharePointName,
    ShareInfoForResponse,
    SharePointInfo,
    ShareInfoId,
    Admin,
} from "@components/menus/sharing";
import { ShareMapBounds } from "@components/map";
import { LikeSearchResult, RecentKeyword } from "@components/search";
import { ChangeStarStatusResponse } from "@components/menus/sharing/detail";
import { ShareListItemChangeAdminStatus } from "@/components/sharing/list/item";

export type AuthToken = string;

export interface VerifyEmailTokenReturn {
    token: AuthToken;
}

export interface VerifyEmailEmailReturn {
    email: string;
}
export interface VerifyEmailFailReturn {
    result: number;
}

export interface AddUserReturnSuccess {
    isSocial: boolean;
    token: string;
    tag: number;
    nickname: string;
}
export interface AddUserReturn {
    success?: AddUserReturnSuccess;
    error?: string;
}
export interface GetContactsReturn {
    success?: { contacts: string };
    error?: string;
}
export interface GetTagsReturn {
    success?: { tag: number; nickname: string }[];
    error?: string;
}
export interface MessageReturn {
    success?: string;
    error?: string;
}

export interface User {
    email: string;
    password: string;
    nickname: string;
    name: string;
    contacts: string[];
}

export interface SocialUser {
    email?: string;
    social_type: number;
    social_uid?: string;
    naver_client_id?: string;
    kakao_user_id?: number;
}

export interface LogoutUser {
    token: string;
}

export interface TokenUser {
    token: string;
}

export interface UpdateSharePointRequestBody {
    id: ShareInfoId;
    tag: number;
    jibun_address?: ShareInfoJibunAddress;
    doro_address?: ShareInfoDoroAddress;
    point_lat?: ShareInfoPointLat;
    point_lng?: ShareInfoPointLng;
    point_name?: SharePointName;
    name?: string;
    goods?: string;
    contacts?: string;
}

export type UserToken = string;

export type VerifyEmailReturn = VerifyEmailEmailReturn | VerifyEmailFailReturn;

export type ReturnWith<T> = {
    success: T;
    error?: string;
};

export const getAddressWithLatLngUsingKeyword = (
    keyword: string
): AddressSearchResult[] => {
    const addressWithLatLng = fetchGet<AddressSearchResult[]>(
        urls.GET.ADDRESS,
        {
            keyword: keyword,
        }
    );

    return addressWithLatLng as unknown as AddressSearchResult[];
};

export const postEmailLogin = (
    email: string,
    password: string
): AddUserReturn | undefined => {
    const authToken = fetchPost<AddUserReturn>(urls.POST.LOGIN_BY_EMAIL, {
        email,
        password,
    });

    return authToken as unknown as AddUserReturn;
};

export const postSocialLogin = (
    user?: SocialUser
): AddUserReturn | undefined => {
    if (!user) {
        return;
    }
    const authToken = fetchPost<AddUserReturn>(urls.POST.LOGIN_BY_SOCIAL, user);

    return authToken as unknown as AddUserReturn;
};

export const postTokenLogin = (user: TokenUser): AddUserReturn => {
    const response = fetchPost<AddUserReturn>(urls.POST.LOGIN_BY_TOKEN, user);

    return response as unknown as AddUserReturn;
};

export const postVerifyEmailToken = (
    email: string
): Promise<VerifyEmailTokenReturn> => {
    const authToken = fetchPost<VerifyEmailTokenReturn>(
        urls.POST.VERIFY_EMAIL,
        {
            email,
        }
    );

    return authToken;
};

export const postVerifyEmail = (token: string): Promise<VerifyEmailReturn> => {
    const email = fetchPost<VerifyEmailReturn>(urls.POST.MAKE_EMAIL_VERIFIED, {
        token,
    });

    return email;
};

export const postNewUser = (user?: User): AddUserReturn | undefined => {
    if (!user) {
        return;
    }

    const result = fetchPost<AddUserReturn>(urls.POST.ADD_USER, user);

    return result as unknown as AddUserReturn;
};

export const postNewSocialUser = (
    user?: SocialUser
): AddUserReturn | undefined => {
    if (!user) {
        return;
    }

    const result = fetchPost<AddUserReturn>(urls.POST.ADD_SOCIAL_USER, user);

    return result as unknown as AddUserReturn;
};

export const postLogout = (user: LogoutUser): MessageReturn => {
    const result = fetchPost<MessageReturn>(urls.POST.LOGOUT, user);

    return result as unknown as MessageReturn;
};

export const postCheckCurrentUserPassword = (info: {
    password: string;
}): MessageReturn => {
    const result = fetchPost<MessageReturn>(
        urls.POST.CHECK_CURRENT_USER_PASSWORD,
        info
    );

    return result as unknown as MessageReturn;
};

export const postSendChangePasswordEmail = (email: string): MessageReturn => {
    const result = fetchPost<MessageReturn>(
        urls.POST.SEND_CHANGE_PASSWORD_MAIL,
        {
            email,
        }
    );

    return result as unknown as MessageReturn;
};

export const patchUpdateNickname = (nickname: string): MessageReturn => {
    const result = fetchPatch<MessageReturn>(urls.PATCH.UPDATE_NICKNAME, {
        nickname,
    });

    return result as unknown as MessageReturn;
};

export const patchUpdatePassword = (info: {
    password: string;
}): MessageReturn => {
    const result = fetchPatch<MessageReturn>(urls.PATCH.UPDATE_PASSWORD, info);

    return result as unknown as MessageReturn;
};

export const patchUpdatePasswordWithToken = (info: {
    password: string;
    token: string;
}): MessageReturn => {
    const result = fetchPatch<MessageReturn>(
        urls.PATCH.UPDATE_PASSWORD_WITH_TOKEN,
        info
    );

    return result as unknown as MessageReturn;
};

export const patchUpdateContacts = (info: {
    contacts: string;
    token: UserToken;
}): MessageReturn => {
    const result = fetchPatch<MessageReturn>(urls.PATCH.UPDATE_CONTACTS, info);

    return result as unknown as MessageReturn;
};

export const getContacts = (): GetContactsReturn => {
    const result = fetchGet<GetContactsReturn>(urls.GET.CONTACTS);

    return result as unknown as GetContactsReturn;
};

export const getTagsByTokens = (
    info: null,
    urlParmas: { tags: string }
): GetTagsReturn => {
    const result = fetchGet<GetTagsReturn>(urls.GET.TAGS, info, urlParmas);

    return result as unknown as GetTagsReturn;
};

export const postAddShareInfo = (
    shareInfo: ShareInfoForRequest
): ReturnWith<ShareInfoId> => {
    const result = fetchPost<ReturnWith<ShareInfoId>>(
        urls.POST.ADD_SHARE_INFO,
        shareInfo
    );

    return result as unknown as ReturnWith<ShareInfoId>;
};

export const postGetShareInfosInBounds = (
    bounds: ShareMapBounds
): ReturnWith<ShareInfoForResponse[]> => {
    const result = fetchPost<ReturnWith<ShareInfoForResponse[]>>(
        urls.POST.GET_SHARE_INFOS_WITH_MAP_BOUNDS,
        bounds
    );

    return result as unknown as ReturnWith<ShareInfoForResponse[]>;
};

export const getShareInfo = (
    id: ShareInfoId
): ReturnWith<ShareInfoForResponse> => {
    const result = fetchGet<ReturnWith<ShareInfoForResponse>>(
        urls.GET.SHARE_INFO,
        null,
        {
            id,
        }
    );

    return result as unknown as ReturnWith<ShareInfoForResponse>;
};

export const patchChangeShareStatus = (shareInfo: {
    id: ShareInfoId;
    status: number;
    tag: number;
}): ReturnWith<number> => {
    const result = fetchPatch<ReturnWith<number>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SHARE_STATUS,
        shareInfo
    );

    return result as unknown as ReturnWith<number>;
};

export const patchChangeGoodsQuantity = (shareInfo: {
    id: ShareInfoId;
    goods: string;
    tag: number;
}): ReturnWith<string> => {
    const result = fetchPatch<ReturnWith<string>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SAHRE_GOODS_QUANTITY,
        shareInfo
    );

    return result as unknown as ReturnWith<string>;
};

export const patchChangeShareName = (shareInfo: {
    id: ShareInfoId;
    tag: number;
    name: string;
}): ReturnWith<string> => {
    const result = fetchPatch<ReturnWith<string>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SHARE_NAME,
        shareInfo
    );

    return result as unknown as ReturnWith<string>;
};

export const patchChangeSharePoint = (shareInfo: {
    id: ShareInfoId;
    tag: number;
    jibun_address: ShareInfoJibunAddress;
    doro_address: ShareInfoDoroAddress;
    point_lat: ShareInfoPointLat;
    point_lng: ShareInfoPointLng;
    point_name: SharePointName;
}): ReturnWith<SharePointInfo> => {
    const result = fetchPatch<
        ReturnWith<SharePointInfo>,
        UpdateSharePointRequestBody
    >(urls.PATCH.UPDATE_SHARE_POINT, { id: shareInfo.id }, shareInfo);

    return result as unknown as ReturnWith<SharePointInfo>;
};

export const patchChangeShareGoods = (shareInfo: {
    id: ShareInfoId;
    tag: number;
    goods: string;
}): ReturnWith<string> => {
    const result = fetchPatch<ReturnWith<string>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SHARE_GOODS,
        shareInfo
    );

    return result as unknown as ReturnWith<string>;
};

export const patchChangeShareContacts = (shareInfo: {
    id: ShareInfoId;
    tag: number;
    contacts: string;
}): ReturnWith<string> => {
    const result = fetchPatch<ReturnWith<string>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SHARE_CONTACTS,
        shareInfo
    );

    return result as unknown as ReturnWith<string>;
};

export const patchChangeShareAdmins = (shareInfo: {
    id: ShareInfoId;
    tag: number;
    admins: string;
}): ReturnWith<string> => {
    const result = fetchPatch<ReturnWith<string>, UpdateSharePointRequestBody>(
        urls.PATCH.UPDATE_SHARE_ADMINS,
        shareInfo
    );

    return result as unknown as ReturnWith<string>;
};

export const getLikeSearchKeywordsWithKeyword = (searchInfo: {
    keyword: string;
    map_only?: boolean;
    southwest_lng?: number;
    southwest_lat?: number;
    northeast_lng?: number;
    northeast_lat?: number;
}): ReturnWith<LikeSearchResult[]> => {
    let result;
    if (
        searchInfo.map_only &&
        searchInfo.southwest_lng &&
        searchInfo.southwest_lat &&
        searchInfo.northeast_lng &&
        searchInfo.northeast_lng
    ) {
        result = fetchGet<ReturnWith<LikeSearchResult[]>>(
            urls.GET.LIKE_KEYWORD_LIST,
            {
                map_only: String(searchInfo.map_only),
                southwest_lng: searchInfo.southwest_lng,
                southwest_lat: searchInfo.southwest_lat,
                northeast_lng: searchInfo.northeast_lng,
                northeast_lat: searchInfo.northeast_lng,
            },
            { keyword: searchInfo.keyword }
        );
    } else {
        result = fetchGet<ReturnWith<LikeSearchResult[]>>(
            urls.GET.LIKE_KEYWORD_LIST,
            {},
            { keyword: searchInfo.keyword }
        );
    }

    return result as unknown as ReturnWith<LikeSearchResult[]>;
};

export const postAddRecentSearchKeyword = (recentSearchKeywordInfo: {
    keyword: string;
    type: number;
}): ReturnWith<RecentKeyword[]> => {
    const result = fetchPost<ReturnWith<RecentKeyword[]>>(
        urls.POST.ADD_RECENT_SEARCH_KEYWORD,
        recentSearchKeywordInfo
    );

    return result as unknown as ReturnWith<RecentKeyword[]>;
};

export const getRecentSearchKeyword = (): ReturnWith<RecentKeyword[]> => {
    const result = fetchGet<ReturnWith<RecentKeyword[]>>(
        urls.GET.RECENT_SEARCH_KEYWORD_LIST
    );

    return result as unknown as ReturnWith<RecentKeyword[]>;
};

export const deleteRecentSearchKeyword = (id: number): ReturnWith<number> => {
    const result = fetchDelete<ReturnWith<number>>(
        urls.DELETE.DELETE_RECENT_SEARCH_KEYWORD,
        { id }
    );

    return result as unknown as ReturnWith<number>;
};

export const deleteAllRecentSearchKeyword = (): ReturnWith<MessageReturn> => {
    const result = fetchDelete<MessageReturn>(
        urls.DELETE.DELETE_ALL_RECENT_SEARCH_KEYWORD
    );

    return result as unknown as ReturnWith<MessageReturn>;
};

export const postChangeShareStarStatus = (info: {
    id: ShareInfoId;
    to_be: boolean;
}): ReturnWith<ChangeStarStatusResponse> => {
    const result = fetchPost<ReturnWith<ChangeStarStatusResponse>>(
        urls.POST.ADD_SHARE_STAR,
        info
    );

    return result as unknown as ReturnWith<ChangeStarStatusResponse>;
};

export const postChangeShareAdminStatus = (info: {
    id: ShareInfoId;
    to_be: boolean;
}): ReturnWith<ShareListItemChangeAdminStatus> => {
    const result = fetchPost<ReturnWith<ShareListItemChangeAdminStatus>>(
        urls.POST.CHANGE_ADMIN_STATUS,
        info
    );

    return result as unknown as ReturnWith<ShareListItemChangeAdminStatus>;
};

export const getMyShareList = (): ReturnWith<ShareInfoForResponse[]> => {
    const result = fetchGet<ReturnWith<ShareInfoForResponse[]>>(
        urls.GET.MY_SHARE_LIST
    );

    return result as unknown as ReturnWith<ShareInfoForResponse[]>;
};

export const getStarredShareList = (): ReturnWith<ShareInfoForResponse[]> => {
    const result = fetchGet<ReturnWith<ShareInfoForResponse[]>>(
        urls.GET.STARRED_SHARE_LIST
    );

    return result as unknown as ReturnWith<ShareInfoForResponse[]>;
};

export const getAdminInfoByTag = (tags: string): ReturnWith<Admin[]> => {
    const result = fetchGet<ReturnWith<Admin[]>>(
        urls.GET.ADMIN_INFO_LIST_BY_TAG,
        { tags }
    );

    return result as unknown as ReturnWith<Admin[]>;
};

export const deleteShare = (id: number): ReturnWith<boolean> => {
    const result = fetchDelete<ReturnWith<boolean>>(urls.DELETE.DELETE_SHARE, {
        id,
    });

    return result as unknown as ReturnWith<boolean>;
};

export const getSearchResult = (searchInfo: {
    keyword: string;
    map_only?: boolean;
    southwest_lng?: number;
    southwest_lat?: number;
    northeast_lng?: number;
    northeast_lat?: number;
}): ReturnWith<ShareInfoForResponse[]> => {
    let result;
    if (
        searchInfo.map_only &&
        searchInfo.southwest_lng &&
        searchInfo.southwest_lat &&
        searchInfo.northeast_lng &&
        searchInfo.northeast_lng
    ) {
        result = fetchGet<ReturnWith<ShareInfoForResponse[]>>(
            urls.GET.SEARCH_RESULT,
            {
                map_only: String(searchInfo.map_only),
                southwest_lng: searchInfo.southwest_lng,
                southwest_lat: searchInfo.southwest_lat,
                northeast_lng: searchInfo.northeast_lng,
                northeast_lat: searchInfo.northeast_lng,
            },
            { keyword: searchInfo.keyword }
        );
    } else {
        result = fetchGet<ReturnWith<ShareInfoForResponse[]>>(
            urls.GET.SEARCH_RESULT,
            {},
            { keyword: searchInfo.keyword }
        );
    }

    return result as unknown as ReturnWith<ShareInfoForResponse[]>;
};

export const deleteShareItems = (
    ids: ShareInfoId[]
): ReturnWith<ShareInfoId[]> => {
    const result = fetchDelete<ReturnWith<ShareInfoId[]>>(
        urls.DELETE.DELETE_SHARES,
        { ids: ids.join(",") }
    );

    return result as unknown as ReturnWith<ShareInfoId[]>;
};

export const updateComplexedShareItems = (
    data: {
        type: "DELETE" | "UPDATE";
        id: ShareInfoId;
        admins?: string;
    }[]
): ReturnWith<ShareInfoId[]> => {
    const result = fetchPost<ReturnWith<ShareInfoId[]>>(
        urls.POST.UPDATE_COMPLEXED_SHARED,
        { data }
    );

    return result as unknown as ReturnWith<ShareInfoId[]>;
};

export const deleteUser = (): ReturnWith<boolean> => {
    const result = fetchDelete<ReturnWith<boolean>>(urls.DELETE.USER);

    return result as unknown as ReturnWith<boolean>;
};

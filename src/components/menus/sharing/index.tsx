import { Outlet } from "react-router-dom";

export interface Admin {
    nickname: string;
    tag: ShareInfoTag;
}

export interface ValidateResult {
    code: number;
    message?: string;
    result: boolean;
}

export type ShareInfoId = number;
export type ShareInfoName = string;
export type ShareInfoTag = number;
export type ShareInfoContact = string;
export type SharePointName = string;
export type ShareInfoJibunAddress = string | null;
export type ShareInfoDoroAddress = string | null;
export type ShareInfoPointLat = number | null;
export type ShareInfoPointLng = number | null;
export interface ShareInfoGoods {
    type: number; // 0, 1, 2, 3
    input: {
        number?: number;
        text?: string;
    };
}
export type ShareInfoPoint = {
    coordinates: [number, number];
    type: "Point";
} | null;

export type UserId = number;

export interface ShareInfoForRequest {
    name: ShareInfoName;
    admins: string;
    contacts: string | null;
    jibun_address: string | null;
    doro_address: string | null;
    point_lat: number | null;
    point_lng: number | null;
    point_name: string;
    goods: string;
}

export interface ShareInfoForResponse {
    id: number;
    name: ShareInfoName;
    admins: string;
    contacts: string;
    jibun_address: string | null;
    doro_address: string | null;
    point_lat: number | null;
    point_lng: number | null;
    point: ShareInfoPoint | null;
    point_name: string;
    goods: string;
    status: number;
}

export interface ShareInfo {
    id: number;
    name: ShareInfoName;
    admins: number[];
    contacts: string[];
    jibun_address: string | null;
    doro_address: string | null;
    point_lat: number | null;
    point_lng: number | null;
    point?: ShareInfoPoint | null;
    point_name: string;
    goods: ShareInfoGoods[];
    status: number;
    starred?: boolean;
}

export interface SharePointInfo {
    jibun_address: string | null;
    doro_address: string | null;
    point_lat: number | null;
    point_lng: number | null;
    point_name: string;
    point?: ShareInfoPoint | null;
}

export const parseShareInfoResponseToShareInfo = (
    shareInfoResponse: ShareInfoForResponse
): ShareInfo => {
    return {
        ...shareInfoResponse,
        goods: JSON.parse(shareInfoResponse.goods),
        contacts: shareInfoResponse.contacts.split(","),
        admins: shareInfoResponse.admins
            .split(",")
            .map((admin) => parseInt(admin)),
    };
};

const SharingMenu = () => {
    return <Outlet />;
};

export default SharingMenu;

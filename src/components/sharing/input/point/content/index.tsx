import { useState, useEffect, useContext } from "react";

import { MapContext } from "@/App";

import Leaflet, { LayerGroup, Marker } from "leaflet";

import JusoSearch, { AddressSearchResult } from "@components/jusoSearch";
import FullWidthButton from "@components/button/fullWidthButton";
import TextInput from "@components/input/textInput";

import {
    ValidateResult,
    ShareInfoJibunAddress,
    ShareInfoDoroAddress,
    ShareInfoPointLat,
    ShareInfoPointLng,
    SharePointName,
} from "@components/menus/sharing";

export const validateSharePointName = (input: string): ValidateResult => {
    // 초기값
    if (input === "") {
        return {
            code: 3,
            result: false,
        };
    }

    if (input.length < 1 || input.length > 20) {
        return {
            code: 1,
            message: "1~20글자 사이의 이름만 사용할 수 있습니다.",
            result: false,
        };
    }

    const regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9\s_-]+$/;
    const result = regex.test(input);

    if (!result) {
        return {
            code: 2,
            message: "한글, 영어 대소문자, 띄어쓰기만 사용할 수 있습니다.",
            result: false,
        };
    }

    return {
        code: 0,
        result: true,
    };
};

export const validatSharePoint = (
    addressInfo: AddressSearchResult
): ValidateResult => {
    let flag = false;
    if (addressInfo.doroAddress) {
        flag = true;
    }
    if (addressInfo.jibunAddress) {
        flag = true;
    }
    if (addressInfo.lat && addressInfo.lng) {
        flag = true;
    }

    if (flag) {
        return {
            code: 0,
            result: true,
        };
    } else {
        return {
            code: 1,
            message: "위치를 나타낼 수 있는 값이 없습니다.",
            result: false,
        };
    }
};

interface SharingInputPointContentProps {
    sharePointName: SharePointName;
    sharePointJibunAddress: ShareInfoJibunAddress;
    sharePointDoroAddress: ShareInfoDoroAddress;
    sharePointLatLng: [ShareInfoPointLat, ShareInfoPointLng] | null;
    onClickGoToMapPointMode: () => void;
    onClickAddressSearchResult: (addressInfo: AddressSearchResult) => void;
    onChangeSharePointName: (input: string) => void;
}

const SharingInputPointContent = ({
    sharePointName,
    sharePointJibunAddress,
    sharePointDoroAddress,
    sharePointLatLng,
    onClickGoToMapPointMode,
    onClickAddressSearchResult,
    onChangeSharePointName,
}: SharingInputPointContentProps) => {
    const [sharePointCondtion, setSharePointCondtion] = useState<
        "address" | "map"
    >("address");

    const [sharePointNameErrorState, setSharePointNameErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    useEffect(() => {
        if (sharePointJibunAddress || sharePointDoroAddress) {
            setSharePointCondtion("address");
        } else {
            setSharePointCondtion("map");
        }
    }, [sharePointJibunAddress, sharePointDoroAddress]);

    const handleClickSharePointConditionButton = (
        condition: "address" | "map"
    ) => {
        setSharePointCondtion(condition);
    };

    const handleClickAddressSearchResult = (
        addressInfo: AddressSearchResult
    ) => {
        onClickAddressSearchResult(addressInfo);
    };

    const handleClickGoToMapPoint = () => {
        onClickGoToMapPointMode();
    };

    const handleChangeSharePointNameInput = (input: string) => {
        const validateResult = validateSharePointName(input);

        setSharePointNameErrorState(validateResult);
        onChangeSharePointName(input);
    };

    return (
        <>
            <div className="toggle-button">
                <button
                    className={sharePointCondtion === "address" ? "active" : ""}
                    onClick={() =>
                        handleClickSharePointConditionButton("address")
                    }
                >
                    주소 검색으로 선택하기
                </button>
                <button
                    className={sharePointCondtion === "map" ? "active" : ""}
                    onClick={() => handleClickSharePointConditionButton("map")}
                >
                    지도에서 선택하기
                </button>
            </div>
            <div className="map mb-2 p-2 bg-slate-200">
                {sharePointCondtion === "address" ? (
                    <JusoSearch
                        checkOnClickResult
                        onClickSearchResult={handleClickAddressSearchResult}
                    />
                ) : (
                    <FullWidthButton
                        onClick={handleClickGoToMapPoint}
                        text="지도에서 선택하러가기"
                        textColor="text-black"
                        backgroundColor="bg-amber-400"
                        rounded="rounded-md"
                        border="border"
                        borderColor="border-black"
                    />
                )}
            </div>
            {(sharePointJibunAddress ||
                sharePointDoroAddress ||
                sharePointLatLng) && (
                <span>
                    선택된 장소는 "
                    <b>
                        {!sharePointJibunAddress &&
                        !sharePointDoroAddress &&
                        sharePointLatLng
                            ? "지도에 표시된 지점"
                            : sharePointJibunAddress
                            ? sharePointJibunAddress
                            : sharePointDoroAddress && sharePointDoroAddress}
                    </b>
                    " 입니다.
                </span>
            )}
            <TextInput
                value={sharePointName}
                placeholder="장소의 이름을 입력해주세요."
                onChangeInput={handleChangeSharePointNameInput}
                isError={
                    !sharePointNameErrorState.result &&
                    sharePointNameErrorState.code !== 3
                }
                errorMessage={sharePointNameErrorState.message}
            />
        </>
    );
};

export default SharingInputPointContent;

import { useState, useRef, useCallback, useEffect, useContext } from "react";

import { useQuery } from "react-query";

import { useNavigate } from "react-router-dom";

import { MapContext, AuthContext } from "@/App";

import Leaflet, { LatLng, LayerGroup, Marker } from "leaflet";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonContainerWrapper from "@components/wrapper/container/page/pageWithBackButton";
import { CheckboxListItemIdType } from "@components/checkBoxList";
import { CheckBoxListEditItem } from "@components/checkBoxList/editableCheckBoxList";

import AlertBox from "@components/alertBox";

import {
    ShareInfoForRequest,
    ValidateResult,
    Admin,
    ShareInfoContact,
    ShareInfoPointLat,
    ShareInfoPointLng,
    ShareInfoGoods,
} from "..";

import { postAddShareInfo, ReturnWith } from "@/api/request/requests";

import { XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/16/solid";

import { AddressSearchResult } from "@components/jusoSearch";

import FullWidthButton from "@components/button/fullWidthButton";
import FoldableBox from "@components/foldableBox";
import NeedLoginStatusScreen from "@components/statusScreen/needLogin";

import SharingInputNameContent, {
    validateShareName,
} from "@components/sharing/input/name/content";
import SharingInputAdminsContent, {
    validateAdmins,
} from "@components/sharing/input/admins/content";
import SharingInputContactsContent, {
    validateContacts,
} from "@components/sharing/input/contacts/content";
import SharingInputPointContent, {
    validatSharePoint,
    validateSharePointName,
} from "@components/sharing/input/point/content";
import SharingInputGoodsContent, {
    validateShareGoodsInfo,
} from "@components/sharing/input/goods/content";
import SharingRulePopup from "@components/sharing/rulePopup";

import "../sharing.css";

// TODO: 유저를 검색하는 함수는 많이 사용할 것 같으니까 밖으로 빼기
// 태그는 유저 하나당 고유한 값을 가지므로 당연히 하나만 리턴함

// {
//     text: "특정 품목을 일정 수량만큼 나눔하는 방식이에요.",
//     value: 0,
//     inputType: "text number",
//     inputPlaceholder: "품목명|수량",
//     defaultSelect: true,
// },
// {
//     text: "일정 금액을 가게에 선지급해서 나눔 받는 사람들이 사용하는 방식이에요.",
//     value: 1,
//     inputType: "number",
//     inputPlaceholder: "선지급한 금액을 숫자만 입력해주세요.",
// },
// {
//     text: "사람들이 나눔 품목을 구매하고 구매된 만큼 가게에 후지급하는 방식이에요.",
//     value: 2,
//     inputType: "number",
//     inputPlaceholder: "최대 금액을 입력해주세요.",
// },
// {
//     text: "정해진 방식이 아닌 자유로운 텍스트를 입력하고 싶어요.",
//     value: 3,
//     inputType: "text",
//     inputPlaceholder:
//         "한글, 영어 대소문자, 특수문자 #!^~@, 이모지, 띄어쓰기 포함 30자 이하로 입력해주세요.",
// },

export type ShareInfoId = number;

const SharingNewMenu = function () {
    const navigate = useNavigate();

    const { map } = useContext(MapContext);
    const { userInfo } = useContext(AuthContext);

    // 백단에 보낼 데이터들
    const [shareName, setShareName] = useState<string>("");
    const [adminList, setAdminList] = useState<Admin[]>([
        {
            nickname: userInfo.nickname,
            tag: userInfo.tag,
        },
    ]);
    const [contacts, setContacts] = useState<ShareInfoContact[]>([]);
    const [sharePointJibunAddress, setSharePointJibunAddress] = useState<
        string | null
    >(null);
    const [sharePointDoroAddress, setSharePointDoroAddress] = useState<
        string | null
    >(null);
    const [sharePointLatLng, setSharePointLatLng] = useState<
        [ShareInfoPointLat, ShareInfoPointLng] | null
    >(null);
    const [sharePointName, setSharePointName] = useState<string>("");
    const [shareGoodsInfoList, setShareGoodsInfoList] = useState<
        ShareInfoGoods[]
    >([]);

    // 나머지
    const [selectMapPointMode, setSelectMapPointMode] =
        useState<boolean>(false);
    const [moveToSharePointSection, setMoveToSharePointSection] =
        useState<boolean>(false);

    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

    const [enableAddShareInfoQuery, setEnableAddShareInfoQuery] =
        useState<boolean>(false);

    const [disableSubmitButton, setDisableSubmitButton] =
        useState<boolean>(true);

    const [successSubmit, setSuccessSubmit] = useState<boolean>(false);

    const sharingPointElement = useRef<HTMLDivElement | null>(null);
    const containerElementRef = useRef<HTMLDivElement | null>(null);

    const addressMarkerRef = useRef<Marker | null>(null);

    const sharingPointElementCallback = useCallback(
        (ele: HTMLDivElement | null) => {
            if (ele) {
                sharingPointElement.current = ele;
            }
        },
        []
    );
    const containerElementRefCallback = useCallback(
        (ele: HTMLDivElement | null) => {
            if (ele) {
                containerElementRef.current = ele;
            }
        },
        []
    );

    const layerGroupRef = useRef<LayerGroup | null>(null);
    const mapMarkerRef = useRef<Marker | null>(null);
    const mapMarkerPrevRef = useRef<Marker | null>(null);

    const getShareInfo = (): ShareInfoForRequest => {
        return {
            name: shareName,
            admins: adminList.map((admin) => admin.tag).join(","),
            contacts: contacts.length > 0 ? contacts.join(",") : null,
            jibun_address: sharePointJibunAddress,
            doro_address: sharePointDoroAddress,
            point_lat: sharePointLatLng?.[0] ?? null,
            point_lng: sharePointLatLng?.[1] ?? null,
            point_name: sharePointName,
            goods: JSON.stringify(shareGoodsInfoList),
        };
    };

    const { data: addShareInfoResult, isLoading: loadingAddShareInfoQuery } =
        useQuery<ReturnWith<ShareInfoId>, Error>(
            [JSON.stringify(getShareInfo())],
            () => {
                setEnableAddShareInfoQuery(false);

                return postAddShareInfo(getShareInfo());
            },
            {
                enabled: enableAddShareInfoQuery,
                onSuccess: (response?: ReturnWith<ShareInfoId>) => {
                    if (response?.success) {
                        setShowCompleteAlert(true);
                        setSuccessSubmit(true);
                    }
                },
            }
        );

    useEffect(() => {
        if (!successSubmit) {
            return;
        }

        const timeout = setTimeout(() => {
            navigate(`/sharing/detail/${addShareInfoResult?.success}`);
        }, 5 * 1000);

        return () => {
            return clearTimeout(timeout);
        };
    }, [successSubmit]);

    useEffect(() => {
        if (selectMapPointMode || !moveToSharePointSection) {
            return;
        }
        goToSharePointSection();
    }, [selectMapPointMode, moveToSharePointSection]);

    useEffect(() => {
        return () => {
            clearAllMarkersOnLayer();
        };
    }, []);

    useEffect(() => {
        if (!map || layerGroupRef.current) {
            return;
        }
        layerGroupRef.current = Leaflet.layerGroup().addTo(map);
    }, [map]);

    useEffect(() => {
        // 백단에 보낼 데이터 업데이트 될 때 마다 버튼 활성화/비활성화 변경
        changeSubmitButton();
    }, [
        shareName,
        adminList,
        sharePointJibunAddress,
        sharePointDoroAddress,
        sharePointLatLng,
        sharePointName,
        shareGoodsInfoList,
    ]);

    useEffect(() => {
        if (!map || !layerGroupRef?.current) {
            return;
        }
        if (!selectMapPointMode) {
            return;
        }

        mapMarkerPrevRef.current = mapMarkerRef.current;

        let addMarkerToMapCenter = () => {};

        mapMarkerRef.current = new Leaflet.Marker(map.getCenter());
        mapMarkerRef.current?.addTo(layerGroupRef.current);

        if (selectMapPointMode) {
            addMarkerToMapCenter = () => {
                const center = map.getCenter();
                mapMarkerRef.current?.setLatLng(center);
            };

            map.on("move", addMarkerToMapCenter);
        }

        return () => {
            map.off("move", addMarkerToMapCenter);
        };
    }, [selectMapPointMode]);

    const handleClickAddressSearchResult = (
        addressInfo: AddressSearchResult
    ) => {
        setSharePointJibunAddress(addressInfo.jibunAddress ?? null);
        setSharePointDoroAddress(addressInfo.doroAddress ?? null);
        if (addressInfo.lat !== null && addressInfo.lng !== null) {
            setSharePointLatLng([addressInfo.lat, addressInfo.lng]);

            // 아직은 하나의 마커만 사용 가능하므로 이전 마커를 붙이진 않음
            const markerPoint = Leaflet.latLng(
                addressInfo.lat,
                addressInfo.lng
            );

            moveToPoint(markerPoint);
            addMarkerToPoint(markerPoint);
        } else {
            setSharePointLatLng(null);
        }
    };

    const handleChangeShareNameInput = (input: string) => {
        setShareName(input);
    };

    const moveToPoint = (latlngPoint: LatLng) => {
        if (!map) {
            return;
        }

        map.setView(latlngPoint, 18);
    };

    const handleClickAddUserAsAdminButton = (newAdmin: Admin) => {
        setAdminList([...adminList, newAdmin]);
    };
    const handleClickAddAllCheckedUserAsAdminButton = (newAdmins: Admin[]) => {
        setAdminList([...adminList, ...newAdmins]);
    };

    const handleClickGoToPrevious = () => {
        setSelectMapPointMode(false);
        makeMoveToSharePointSection();

        if (mapMarkerRef.current && map) {
            map.removeLayer(mapMarkerRef.current);
        }
    };

    const goToMapPointMode = () => {
        setSelectMapPointMode(true);
    };

    const addNewContact = (newContact: ShareInfoContact) => {
        setContacts([...contacts, newContact]);
    };
    const addNewContacts = (newContacts: ShareInfoContact[]) => {
        setContacts([...contacts, ...newContacts]);
    };

    const goToSharePointSection = () => {
        if (!sharingPointElement.current || !containerElementRef.current) {
            return;
        }

        const y =
            containerElementRef.current.scrollHeight -
            sharingPointElement.current.getBoundingClientRect().top +
            containerElementRef.current.clientHeight / 2;

        containerElementRef.current.scrollTop = y;
    };

    const addNewShareGoods = (newGoods: ShareInfoGoods) => {
        setShareGoodsInfoList([...shareGoodsInfoList, newGoods]);
    };

    const handleDeleteShareGoodsLine = (id: CheckboxListItemIdType) => {
        setShareGoodsInfoList(
            shareGoodsInfoList.filter((_, idx) => idx !== id)
        );
    };
    const handleDeleteShreGoodsAllChecked = (ids: CheckboxListItemIdType[]) => {
        setShareGoodsInfoList(
            shareGoodsInfoList.filter((_, idx) => !ids.includes(idx))
        );
    };

    const addMarkerToPoint = (latlngPoint: LatLng) => {
        clearAllMarkersOnLayer();

        if (!map || !layerGroupRef.current) {
            return;
        }

        addressMarkerRef.current = Leaflet.marker(latlngPoint).addTo(
            layerGroupRef.current
        );
    };

    const handleClickSaveMapPoint = () => {
        if (!map) {
            return;
        }

        if (mapMarkerPrevRef.current) {
            mapMarkerPrevRef.current.remove();
        }
        if (addressMarkerRef.current) {
            addressMarkerRef.current.remove();
        }

        const point = map.getCenter();
        setSharePointJibunAddress(null);
        setSharePointDoroAddress(null);
        setSharePointLatLng([point.lat, point.lng]);
        setSelectMapPointMode(false);
        makeMoveToSharePointSection();
    };

    const handleClickSubmitShareButton = () => {
        setEnableAddShareInfoQuery(true);
    };

    const handleChangeSharePointName = (input: string) => {
        setSharePointName(input);
    };

    const changeSubmitButton = () => {
        if (!checkSubmitFormIsValid().result) {
            setDisableSubmitButton(true);
            return;
        }

        setDisableSubmitButton(false);
    };

    const checkSubmitFormIsValid = (): ValidateResult => {
        // 나눔 이름 체크
        const shareNameCheckResult = validateShareName(shareName);

        if (!shareNameCheckResult.result) {
            return shareNameCheckResult;
        }

        // 관리자 체크
        const adminListCheckResult = validateAdmins(adminList);

        if (!adminListCheckResult.result) {
            return adminListCheckResult;
        }

        // 연락처 체크
        const contactsCheckResult = validateContacts(contacts);
        if (!contactsCheckResult.result) {
            return contactsCheckResult;
        }

        // 나눔 장소 체크
        const sharePointCheckResult = validatSharePoint({
            doroAddress: sharePointDoroAddress,
            jibunAddress: sharePointJibunAddress,
            lat: sharePointLatLng && sharePointLatLng[0],
            lng: sharePointLatLng && sharePointLatLng[1],
        });
        const sharePointNameCheckResult =
            validateSharePointName(sharePointName);

        if (!sharePointCheckResult.result) {
            return sharePointCheckResult;
        }
        if (!sharePointNameCheckResult.result) {
            return sharePointNameCheckResult;
        }

        // 나눔 품목 체크
        const shareGoodsInfoCheckResult =
            validateShareGoodsInfo(shareGoodsInfoList);

        if (!shareGoodsInfoCheckResult.result) {
            return shareGoodsInfoCheckResult;
        }

        return {
            code: 0,
            result: true,
        };
    };

    const handleDeleteContact = (items: CheckBoxListEditItem[]) => {
        const tags = items.map((item) => item.text);
        setContacts(contacts.filter((contact) => !tags.includes(contact)));
    };

    const handleEditContact = (
        item: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => {
        setContacts(
            contacts.map((contact, idx) => (id !== idx ? contact : item.text))
        );
    };

    const handleResetContact = (ids?: CheckboxListItemIdType[]) => {
        if (ids) {
            setContacts(contacts.filter((_, idx) => !ids.includes(idx)));
        } else {
            setContacts([]);
        }
    };

    const handleDeleteAdminLine = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };
    const handleDeleteAdmins = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };

    const handleClickGoNow = () => {
        navigate(`/sharing/detail/${addShareInfoResult?.success}`);
    };

    const handleClickAddMore = () => {
        setShowCompleteAlert(false);
        setSuccessSubmit(false);
        navigate("/sharing/new");
        resetAllForm();
    };

    const makeMoveToSharePointSection = () => {
        setMoveToSharePointSection(true);

        setTimeout(() => {
            setMoveToSharePointSection(false);
        }, 3 * 1000);
    };

    const clearAllMarkersOnLayer = () => {
        if (!map || !layerGroupRef?.current) {
            return;
        }
        if (map.hasLayer(layerGroupRef.current)) {
            layerGroupRef.current.clearLayers();
        }
    };

    const resetAllForm = () => {
        setShareName("");
        setAdminList([
            {
                nickname: userInfo.nickname,
                tag: userInfo.tag,
            },
        ]);
        setContacts([]);
        setSharePointJibunAddress(null);
        setSharePointDoroAddress(null);
        setSharePointLatLng(null);
        setSharePointName("");
        setShareGoodsInfoList([]);
    };

    const handleClickAlertBoxCloseButton = () => {
        setShowCompleteAlert(false);
    };

    return (
        <FloatWrapper>
            {!selectMapPointMode ? (
                <PageWithBackButtonContainerWrapper
                    ref={containerElementRefCallback}
                >
                    {!userInfo.loading && userInfo.isLogined ? (
                        <>
                            {showCompleteAlert && (
                                <AlertBox
                                    onClickCloseButton={
                                        handleClickAlertBoxCloseButton
                                    }
                                >
                                    <div className="sharing-menu alert-box-content">
                                        <div className="text">
                                            나눔 품목 등록이 완료되었습니다.
                                            <br />
                                            5초 후 리스트로 이동합니다
                                        </div>
                                        <div className="buttons">
                                            <button
                                                className="bg-amber-400 text-black border border-black"
                                                onClick={handleClickAddMore}
                                            >
                                                더 추가하기
                                            </button>
                                            <button
                                                className="bg-sky-500 text-white"
                                                onClick={handleClickGoNow}
                                            >
                                                지금 이동하기
                                            </button>
                                        </div>
                                    </div>
                                </AlertBox>
                            )}
                            <div className="sharing-menu flex gap-y-6 flex-col">
                                <div className="section">
                                    <div className="title">
                                        <div className="decoration"></div>
                                        나눔 이름
                                        <SharingRulePopup
                                            title="이름 규칙"
                                            rules={[
                                                "1~30글자 사이",
                                                "한글, 영어대소문자, 숫자, 특수문자 #!^~@",
                                                "이모지 사용 가능",
                                            ]}
                                        />
                                    </div>
                                    <div className="content">
                                        <SharingInputNameContent
                                            shareName={shareName}
                                            onChangeInput={
                                                handleChangeShareNameInput
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="title">
                                        <div className="decoration"></div>
                                        관리자 추가
                                        <SharingRulePopup
                                            title="관리자 규칙"
                                            rules={[
                                                "반드시 1명 이상",
                                                "쉼표와 숫자만 입력 가능",
                                                "여러명 검색 가능",
                                                "예시: 6625,2335,3193",
                                                "태그는 8자리의 숫자",
                                                "태그는 마이페이지에서 확인 가능",
                                            ]}
                                        />
                                    </div>
                                    <div className="content">
                                        <SharingInputAdminsContent
                                            adminList={adminList}
                                            handleAddAdminLine={
                                                handleClickAddUserAsAdminButton
                                            }
                                            handleAddAdmins={
                                                handleClickAddAllCheckedUserAsAdminButton
                                            }
                                            handleDeleteAdminLine={
                                                handleDeleteAdminLine
                                            }
                                            handleDeleteAdmins={
                                                handleDeleteAdmins
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="title">
                                        <div className="decoration"></div>
                                        연락처 추가
                                        <div className="warning">
                                            <ExclamationCircleIcon className="icon" />
                                            최소 1가지 이상 필요해요.
                                        </div>
                                    </div>
                                    <div className="content">
                                        <SharingInputContactsContent
                                            contacts={contacts}
                                            addNewContact={addNewContact}
                                            addNewContacts={addNewContacts}
                                            handleDeleteContact={
                                                handleDeleteContact
                                            }
                                            handleEditContact={
                                                handleEditContact
                                            }
                                            handleResetContact={
                                                handleResetContact
                                            }
                                        />
                                    </div>
                                </div>
                                <div
                                    className="section"
                                    ref={sharingPointElementCallback}
                                >
                                    <div className="title">
                                        <div className="decoration"></div>
                                        나눔 장소 선택
                                        <div className="warning">
                                            <ExclamationCircleIcon className="icon" />
                                            1곳만 선택 가능해요.
                                        </div>
                                    </div>
                                    <div className="content">
                                        <SharingInputPointContent
                                            sharePointName={sharePointName}
                                            sharePointJibunAddress={
                                                sharePointJibunAddress
                                            }
                                            sharePointDoroAddress={
                                                sharePointDoroAddress
                                            }
                                            sharePointLatLng={sharePointLatLng}
                                            onClickGoToMapPointMode={
                                                goToMapPointMode
                                            }
                                            onClickAddressSearchResult={
                                                handleClickAddressSearchResult
                                            }
                                            onChangeSharePointName={
                                                handleChangeSharePointName
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="section">
                                    <div className="title">
                                        <div className="decoration"></div>
                                        나눔 품목 작성
                                        <SharingRulePopup
                                            title="나눔 물품 규칙"
                                            rules={[
                                                "반드시 1가지 이상 필요해요.",
                                                "텍스트 입력칸은 한글, 영어 대소문자, 특수문자 #!^~@, 이모지, 띄어쓰기 포함 30자 이하로 입력해주세요.",
                                                "숫자 입력칸에는 숫자만 입력 가능합니다.",
                                                "만들어진 나눔 물품은 수정이 불가능해요. 삭제하고 다시 생성해주세요.",
                                            ]}
                                        />
                                    </div>
                                    <div className="content sharing-goods">
                                        <SharingInputGoodsContent
                                            shareGoodsInfoList={
                                                shareGoodsInfoList
                                            }
                                            addNewShareGoods={addNewShareGoods}
                                            handleDeleteShareGoodsLine={
                                                handleDeleteShareGoodsLine
                                            }
                                            handleDeleteShreGoodsAllChecked={
                                                handleDeleteShreGoodsAllChecked
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="section">
                                    <button
                                        className="submit-button"
                                        disabled={
                                            disableSubmitButton ||
                                            loadingAddShareInfoQuery
                                        }
                                        onClick={handleClickSubmitShareButton}
                                    >
                                        등록하기
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <NeedLoginStatusScreen />
                    )}
                </PageWithBackButtonContainerWrapper>
            ) : (
                <FoldableBox>
                    <div className="text-center">
                        지도를 움직여서 가운데에 원하는 위치가 위치하도록
                        해주세요.
                        <br />
                        원하는 위치를 맞췄으면 아래 버튼을 눌러 결과를
                        저장하세요.
                        <br />
                        <br />
                        <div className="flex gap-y-2 flex-col">
                            <FullWidthButton
                                onClick={handleClickSaveMapPoint}
                                text="선택된 포인트를 저장하기"
                                textColor="text-black"
                                backgroundColor="bg-amber-400"
                                rounded="rounded-md"
                                border="border"
                                borderColor="border-black"
                            />
                            <FullWidthButton
                                onClick={handleClickGoToPrevious}
                                text="이전 화면으로 돌아가기"
                                textColor="text-white"
                                backgroundColor="bg-slate-400"
                                rounded="rounded-md"
                                border=""
                                borderColor=""
                            />
                        </div>
                    </div>
                </FoldableBox>
            )}
        </FloatWrapper>
    );
};

export default SharingNewMenu;

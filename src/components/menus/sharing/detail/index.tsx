import {
    useContext,
    useEffect,
    useState,
    useRef,
    ChangeEvent,
    SyntheticEvent,
} from "react";

import { useParams } from "react-router-dom";

import { useQuery } from "react-query";

import { useNavigate } from "react-router-dom";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonContainerWrapper from "@components/wrapper/container/page/pageWithBackButton";
import NoItemStatusScreen from "@components/statusScreen/noItem";
import WrapperWithCopyButton from "@components/wrapper/withCopyButton";
import WrapperWithEditButton from "@components/wrapper/withEditButton";
import FoldableBox from "@components/foldableBox";
import FullWidthButton from "@components/button/fullWidthButton";
import { AddressSearchResult } from "@components/jusoSearch";
import { CheckboxListItemIdType } from "@components/checkBoxList";
import { CheckBoxListEditItem } from "@components/checkBoxList/editableCheckBoxList";
import AlertBox from "@components/alertBox";

import {
    getShareInfo,
    patchChangeShareStatus,
    patchChangeGoodsQuantity,
    patchChangeShareName,
    patchChangeSharePoint,
    patchChangeShareGoods,
    patchChangeShareContacts,
    patchChangeShareAdmins,
    postChangeShareStarStatus,
    deleteShare,
    getAdminInfoByTag,
    ReturnWith,
} from "@/api/request/requests";

import { MapContext, AuthContext, SearchContext } from "@/App";

import { format } from "date-fns";

import {
    ShareInfoForResponse,
    ShareInfo,
    parseShareInfoResponseToShareInfo,
    ShareInfoGoods,
    SharePointInfo,
    ShareInfoContact,
    ShareInfoName,
    Admin,
} from "..";

import {
    MapPinIcon,
    PhoneIcon,
    PencilIcon,
    GiftIcon,
    EllipsisVerticalIcon,
    StarIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";

import { StarIcon as FilledStarIcon } from "@heroicons/react/16/solid";

import Leaflet, { LayerGroup, Marker, LatLng } from "leaflet";

import SharingInputNameContent, {
    validateShareName,
} from "@components/sharing/input/name/content";
import SharingInputNameRulePopup from "@components/sharing/input/name/rulePopup";

import SharingInputPointContent, {
    validatSharePoint,
    validateSharePointName,
} from "@components/sharing/input/point/content";
import SharingInputSharePointRulePopup from "@/components/sharing/input/point/rulePopup";

import SharingInputGoodsContent, {
    validateShareGoodsInfo,
} from "@components/sharing/input/goods/content";
import SharingInputShareGoodsRulePopup from "@/components/sharing/input/goods/rulePopup";

import SharingInputContactsContent, {
    validateContacts,
    validateContactInput,
} from "@components/sharing/input/contacts/content";
import SharingInputShareContactsRulePopup from "@/components/sharing/input/contacts/rulePopup";

import SharingInputAdminsContent, {
    validateAdmins,
    validateTagInput,
} from "@components/sharing/input/admins/content";
import SharingInputAdminRulePopup from "@components/sharing/input/admins/rulePopup";

import "./SharingDetail.css";

export interface ChangeStarStatusResponse {
    id: number;
    status: boolean;
}

const SharingDetailMenu = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const { map, shareInfosInBounds, setShareInfosInBounds } =
        useContext(MapContext);
    const { userInfo } = useContext(AuthContext);
    const { isMapView, setIsMapView } = useContext(SearchContext);

    const [enableGetShareInfoQuery, setEnableGetShareInfoQuery] =
        useState<boolean>(false);
    const [enableEditGoodsQuantity, setEnableEditGoodsQuantity] =
        useState<boolean>(false);
    const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
    const [isNoShareInfo, setIsNoShareInfo] = useState<boolean>(false);
    const [copiedText, setCopiedText] = useState<string>("");
    const [isOpenUtilMenu, setIsOpenUtilMenu] = useState<boolean>(false);
    const [changeStatusNumber, setChangeStatusNumber] = useState<number | null>(
        null
    );
    const [enableChangeShareStatusQuery, setEnableChangeShareStatusQuery] =
        useState<boolean>(false);
    const [enableChangeStarStatus, setEnableChangeStarStatus] =
        useState<boolean>(false);

    const [editMode, setEditMode] = useState({
        name: false,
        point: false,
        goods: false,
        contacts: false,
    });
    const [editShareName, setEditShareName] = useState<ShareInfoName>("");
    const [editSharePointInfo, setEditSharePointInfo] =
        useState<SharePointInfo>({
            jibun_address: null,
            doro_address: null,
            point_lat: null,
            point_lng: null,
            point_name: "",
        });
    const [editGoodsInfo, setEditGoodsInfo] = useState<ShareInfoGoods[]>([]);
    const [editContactsInfo, setEditContactsInfo] = useState<
        ShareInfoContact[]
    >([]);
    const [editGoodsQuantity, setEditGoodsQuantity] = useState<string>("");

    const [shareGoodsCalculatorInputs, setShareGoodsCalculatorInputs] =
        useState<(number | string)[]>([]);

    const [selectMapPointMode, setSelectMapPointMode] =
        useState<boolean>(false);
    const [moveToSharePointSection, setMoveToSharePointSection] =
        useState<boolean>(false);

    const [disableShareNameEditButton, setDisableShareNameEditButton] =
        useState<boolean>(true);
    const [disableSharePointEditButton, setDisableSharePointEditButton] =
        useState<boolean>(true);
    const [disableShareGoodsEditButton, setDisableShareGoodsEditButton] =
        useState<boolean>(true);
    const [disableShareContactsEditButton, setDisableShareContactsEditButton] =
        useState<boolean>(true);
    const [disableShareAdminsEditButton, setDisableShareAdminsEditButton] =
        useState<boolean>(true);

    const [enableEditShareName, setEnableEditShareName] =
        useState<boolean>(false);
    const [enableEditSharePoint, setEnableEditSharePoint] =
        useState<boolean>(false);
    const [enableEditShareGoods, setEnableEditShareGoods] =
        useState<boolean>(false);
    const [enableEditShareContacts, setEnableEditShareContacts] =
        useState<boolean>(false);
    const [enableEditShareAdmins, setEnableEditShareAdmins] =
        useState<boolean>(false);

    const [showEditAdminMenu, setShowEditAdminMenu] = useState<boolean>(false);
    const [enableLoadAdminInfo, setEnableLoadAdminInfo] =
        useState<boolean>(false);
    const [adminList, setAdminList] = useState<Admin[]>([]);

    const [showDeleteShareAlert, setShowDeleteShareAlert] =
        useState<boolean>(false);
    const [showDeleteShareCompleteAlert, setShowDeleteShareCompleteAlert] =
        useState<boolean>(false);
    const [enableDeleteShare, setEnableDeleteShare] = useState<boolean>(false);
    const [deleteSuccessSubmit, setDeleteSuccessSubmit] = useState<
        boolean | null
    >(null);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const mapLayerRef = useRef<LayerGroup>();
    const layerGroupRef = useRef<LayerGroup | null>(null);
    const mapMarkerRef = useRef<Marker | null>(null);
    const mapMarkerPrevRef = useRef<Marker | null>(null);
    const addressMarkerRef = useRef<Marker | null>(null);

    const date = useRef(new Date());

    const { data: shareInfoQueryResult, isLoading: loadingGetShareInfoQuery } =
        useQuery<ReturnWith<ShareInfoForResponse> | undefined, Error>(
            [`get-sharing-info-data`, id],
            () => {
                if (!id || isNaN(parseInt(id))) {
                    return;
                }
                setEnableGetShareInfoQuery(false);
                return getShareInfo(parseInt(id));
            },
            {
                enabled: enableGetShareInfoQuery,
                onSuccess: (response?: ReturnWith<ShareInfoForResponse>) => {
                    if (response?.error) {
                        setIsNoShareInfo(true);
                    }
                },
            }
        );

    const {
        data: shareInfoChangeStatusResult,
        isLoading: loadinhChangeShareStatusQuery,
    } = useQuery<ReturnWith<number> | undefined, Error>(
        [`change-sharing-stauts`, id, changeStatusNumber],
        () => {
            if (
                !id ||
                isNaN(parseInt(id)) ||
                !shareInfo ||
                changeStatusNumber === null
            ) {
                return;
            }
            setEnableChangeShareStatusQuery(false);
            return patchChangeShareStatus({
                id: parseInt(id),
                tag: userInfo.tag,
                status: changeStatusNumber,
            });
        },
        {
            enabled:
                enableChangeShareStatusQuery &&
                typeof changeStatusNumber === "number",
            onSettled: () => {
                setIsOpenUtilMenu(false);
                setChangeStatusNumber(null);
            },
            onSuccess: (response?: ReturnWith<number>) => {
                if (shareInfo === null) {
                    return;
                } else if (response?.success !== undefined) {
                    setShareInfo({
                        ...shareInfo,
                        status: response?.success,
                    });
                }
                if (response?.error) {
                    console.error(response.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditGoodsQuantityResult,
        isLoading: loadingshareInfoEditGoodsQuantityQuery,
    } = useQuery<ReturnWith<string> | undefined, Error>(
        [`edit-goods-quantity`, editGoodsQuantity],
        () => {
            if (!shareInfo || !id) {
                return;
            }
            setEnableEditGoodsQuantity(false);
            return patchChangeGoodsQuantity({
                id: parseInt(id),
                goods: editGoodsQuantity,
                tag: userInfo.tag,
            });
        },
        {
            enabled: enableEditGoodsQuantity,
            onSuccess: (response?: ReturnWith<string>) => {
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditNameResult,
        isLoading: loadingshareInfoEditNameQuery,
    } = useQuery<ReturnWith<string> | undefined, Error>(
        [`edit-name`, editShareName],
        () => {
            if (!shareInfo || !id) {
                return;
            }

            setEnableEditShareName(false);
            return patchChangeShareName({
                id: parseInt(id),
                name: editShareName,
                tag: userInfo.tag,
            });
        },
        {
            enabled: enableEditShareName,
            onSuccess: (response?: ReturnWith<string>) => {
                if (!shareInfo) {
                    return;
                }
                setEditMode({ ...editMode, name: false });
                if (response?.success) {
                    setShareInfo({
                        ...shareInfo,
                        name: response?.success,
                    });
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditPointResult,
        isLoading: loadingshareInfoEditPointQuery,
    } = useQuery<ReturnWith<SharePointInfo> | undefined, Error>(
        [`edit-point`, JSON.stringify(editSharePointInfo)],
        () => {
            if (!shareInfo || !id) {
                return;
            }

            setEnableEditSharePoint(false);
            return patchChangeSharePoint({
                id: parseInt(id),
                tag: userInfo.tag,
                ...editSharePointInfo,
            });
        },
        {
            enabled: enableEditSharePoint,
            onSuccess: (response?: ReturnWith<SharePointInfo>) => {
                clearAllMarkersOnLayer();
                if (!shareInfo) {
                    return;
                }
                setEditMode({ ...editMode, point: false });
                if (response?.success) {
                    setShareInfo({
                        ...shareInfo,
                        point_lat: response?.success.point_lat,
                        point_lng: response?.success.point_lng,
                        doro_address: response?.success.doro_address,
                        jibun_address: response?.success.jibun_address,
                        point_name: response?.success.point_name,
                    });
                    setShareInfosInBounds(
                        shareInfosInBounds.map((bounds) =>
                            bounds.id !== shareInfo.id
                                ? bounds
                                : {
                                      ...bounds,
                                      point_lat: response?.success.point_lat,
                                      point_lng: response?.success.point_lng,
                                      doro_address:
                                          response?.success.doro_address,
                                      jibun_address:
                                          response?.success.jibun_address,
                                      point_name: response?.success.point_name,
                                  }
                        )
                    );
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditGoodsResult,
        isLoading: loadingshareInfoEditGoodsQuery,
    } = useQuery<ReturnWith<string> | undefined, Error>(
        [`edit-goods`, editShareName],
        () => {
            if (!shareInfo || !id) {
                return;
            }

            setEnableEditShareGoods(false);
            return patchChangeShareGoods({
                id: parseInt(id),
                tag: userInfo.tag,
                goods: JSON.stringify(editGoodsInfo),
            });
        },
        {
            enabled: enableEditShareGoods,
            onSuccess: (response?: ReturnWith<string>) => {
                if (!shareInfo) {
                    return;
                }
                setEditMode({ ...editMode, goods: false });

                if (response?.success) {
                    setShareInfo({
                        ...shareInfo,
                        goods: JSON.parse(response?.success),
                    });
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditContactsResult,
        isLoading: loadingshareInfoEditContactsQuery,
    } = useQuery<ReturnWith<string> | undefined, Error>(
        [`edit-contacts`, editShareName],
        () => {
            if (!shareInfo || !id) {
                return;
            }

            setEnableEditShareContacts(false);
            return patchChangeShareContacts({
                id: parseInt(id),
                tag: userInfo.tag,
                contacts: editContactsInfo.join(","),
            });
        },
        {
            enabled: enableEditShareContacts,
            onSuccess: (response?: ReturnWith<string>) => {
                if (!shareInfo) {
                    return;
                }
                setEditMode({ ...editMode, contacts: false });

                if (response?.success) {
                    setShareInfo({
                        ...shareInfo,
                        contacts: response?.success.split(","),
                    });
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: shareInfoEditAdminsResult,
        isLoading: loadingshareInfoEditAdminsQuery,
    } = useQuery<ReturnWith<string> | undefined, Error>(
        [`edit-contacts`, editShareName],
        () => {
            if (!shareInfo || !id) {
                return;
            }

            setEnableEditShareAdmins(false);
            return patchChangeShareAdmins({
                id: parseInt(id),
                tag: userInfo.tag,
                admins: adminList.map((admin) => admin.tag).join(","),
            });
        },
        {
            enabled: enableEditShareAdmins,
            onSuccess: (response?: ReturnWith<string>) => {
                if (!shareInfo) {
                    return;
                }

                if (response?.success) {
                    setShowEditAdminMenu(false);
                    setShareInfo({
                        ...shareInfo,
                        admins: response?.success
                            .split(",")
                            .map((admin) => parseInt(admin)),
                    });
                }
                if (response?.error) {
                    console.error(response?.error);
                }
            },
        }
    );

    const {
        data: changeStarStatusResult,
        isLoading: loadingChangeStarStatusQuery,
    } = useQuery<ReturnWith<ChangeStarStatusResponse> | undefined, Error>(
        [
            "change-star-status",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            id,
            !shareInfo?.starred,
        ],
        () => {
            if (!id) {
                return;
            }
            setEnableChangeStarStatus(false);
            return postChangeShareStarStatus({
                id: parseInt(id),
                to_be: !shareInfo?.starred,
            });
        },
        {
            enabled: enableChangeStarStatus,
            onSuccess: (response?: ReturnWith<ChangeStarStatusResponse>) => {
                if (response?.success !== undefined && shareInfo) {
                    setShareInfo({
                        ...shareInfo,
                        starred: response?.success.status,
                    });
                }
            },
        }
    );

    const {
        data: loadAdminInfoData,
        isLoading: loadingLoadAdminInfoDataQuery,
    } = useQuery<ReturnWith<Admin[]> | undefined, Error>(
        [
            "load-admin-info",
            format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
        ],
        () => {
            setEnableLoadAdminInfo(false);

            if (!shareInfo) {
                return;
            }

            return getAdminInfoByTag(shareInfo.admins.join(","));
        },
        {
            enabled: enableLoadAdminInfo,
            onSuccess: (response?: ReturnWith<Admin[]>) => {
                if (response?.success) {
                    setAdminList(response?.success);
                }
            },
        }
    );

    const { data: deleteShareData, isLoading: loadingDeleteShareQuery } =
        useQuery<ReturnWith<boolean> | undefined, Error>(
            [
                "delete-share",
                format(date.current, "yyyy-MM-dd / EEEE / hh:mm:ss"),
            ],
            () => {
                setEnableDeleteShare(false);

                if (!shareInfo) {
                    return;
                }

                return deleteShare(shareInfo.id);
            },
            {
                enabled: enableDeleteShare,
                onSuccess: (response?: ReturnWith<boolean>) => {
                    if (response?.success && shareInfo) {
                        setDeleteSuccessSubmit(response?.success);
                        setShowDeleteShareCompleteAlert(true);
                        setShareInfosInBounds(
                            shareInfosInBounds.filter(
                                (info) => info.id !== shareInfo.id
                            )
                        );
                    }
                },
            }
        );

    useEffect(() => {
        setIsMapView(false);
    }, []);

    useEffect(() => {
        if (deleteSuccessSubmit === null) {
            return;
        }

        const timeout = setTimeout(() => {
            navigate(-1);
        }, 5 * 1000);

        return () => {
            return clearTimeout(timeout);
        };
    }, [deleteSuccessSubmit]);

    useEffect(() => {
        if (!map || layerGroupRef.current) {
            return;
        }

        layerGroupRef.current = new Leaflet.LayerGroup();
        layerGroupRef.current.addTo(map);
    }, [map]);

    useEffect(() => {
        if (!showEditAdminMenu) {
            return;
        }

        setEnableLoadAdminInfo(true);
    }, [showEditAdminMenu]);

    useEffect(() => {
        setEnableGetShareInfoQuery(true);
    }, [id]);

    useEffect(() => {
        if (editGoodsQuantity === "") {
            return;
        }
        setEnableEditGoodsQuantity(true);
    }, [editGoodsQuantity]);

    useEffect(() => {
        if (!shareInfoEditGoodsQuantityResult?.success || !shareInfo) {
            return;
        }
        setShareInfo({
            ...shareInfo,
            goods: JSON.parse(shareInfoEditGoodsQuantityResult.success),
        });
    }, [shareInfoEditGoodsQuantityResult]);

    useEffect(() => {
        if (!shareInfoQueryResult?.success) {
            return;
        }
        setShareInfo(
            parseShareInfoResponseToShareInfo(shareInfoQueryResult?.success)
        );
    }, [shareInfoQueryResult]);

    useEffect(() => {
        if (showEditAdminMenu && !loadingLoadAdminInfoDataQuery) {
            handleLoadAdminMenu();
        }
    }, [showEditAdminMenu, loadingLoadAdminInfoDataQuery]);

    useEffect(() => {
        if (!shareInfo) {
            return;
        }
        addCurrentShareInfoMarkerToMap();
        setShareGoodsCalculatorInputs(shareInfo.goods.map((_) => ""));
    }, [shareInfo]);

    useEffect(() => {
        if (!shareInfo) {
            return;
        }

        setEditShareName(shareInfo.name);
        setEditSharePointInfo({
            jibun_address: shareInfo.jibun_address,
            doro_address: shareInfo.doro_address,
            point_lat: shareInfo.point_lat,
            point_lng: shareInfo.point_lng,
            point_name: shareInfo.point_name,
        });
        setEditGoodsInfo([...shareInfo.goods]);
        setEditContactsInfo([...shareInfo.contacts]);
    }, [editMode]);

    useEffect(() => {
        checkShareNameIsValiateAndChageEditButtonStatus();
    }, [editShareName]);

    useEffect(() => {
        checkSharePointIsValiateAndChageEditButtonStatus();
    }, [editSharePointInfo]);

    useEffect(() => {
        checkShareGoodsIsValiateAndChageEditButtonStatus();
    }, [editGoodsInfo]);

    useEffect(() => {
        checkShareContactsIsValiateAndChageEditButtonStatus();
    }, [editContactsInfo]);

    useEffect(() => {
        checkShareAdminsIsValidateAndChageEditButtonStatus();
    }, [adminList]);

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
                if (!selectMapPointMode) {
                    return;
                }
                const center = map.getCenter();
                mapMarkerRef.current?.setLatLng(center);
            };

            map.on("move", addMarkerToMapCenter);
        }

        return () => {
            map.off("move", addMarkerToMapCenter);
        };
    }, [selectMapPointMode]);

    useEffect(() => {
        if (!editMode.point) {
            clearAllMarkersOnLayer();
        }
    }, [editMode.point]);

    const addCurrentShareInfoMarkerToMap = () => {
        if (!map) {
            return;
        }
        if (!shareInfo?.point_lat || !shareInfo?.point_lng) {
            return;
        }
        if (!mapLayerRef?.current) {
            mapLayerRef.current = new Leaflet.LayerGroup();
            mapLayerRef.current.addTo(map);
        }

        map.setView([shareInfo?.point_lat, shareInfo?.point_lng], 18);
    };

    const getGoodsString = (goods: ShareInfoGoods) => {
        return goods.type === 0
            ? `${goods.input.text} ${goods.input.number}개`
            : [1, 2].includes(goods.type)
            ? `${goods.input.number?.toLocaleString()}원 사용 가능`
            : [3].includes(goods.type)
            ? goods.input.text
            : "";
    };

    const copyTextToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then((_) => {
            setCopiedText(text);
            setTimeout(() => {
                setCopiedText("");
            }, 3 * 1000);
        });
    };

    const toggleUtilMenu = () => {
        setIsOpenUtilMenu(!isOpenUtilMenu);
    };

    const handleClickChangeShareStatusItem = (status: number) => {
        setChangeStatusNumber(status);
        setEnableChangeShareStatusQuery(true);
    };

    const onClickEditButton = (editItem: string, isEdit: boolean) => {
        if (!shareInfo?.admins.includes(userInfo.tag)) {
            return;
        }

        setEditMode({ ...editMode, [editItem]: isEdit });
    };

    const handleClickGoToPrevious = () => {
        setSelectMapPointMode(false);

        if (mapMarkerRef.current && map) {
            map.removeLayer(mapMarkerRef.current);
        }
    };

    const handleClickSaveMapPoint = () => {
        if (!map) {
            return;
        }

        if (mapMarkerPrevRef.current) {
            mapMarkerPrevRef.current.remove();
        }

        const point = map.getCenter();

        setEditSharePointInfo({
            ...editSharePointInfo,
            jibun_address: null,
            doro_address: null,
            point_lat: point.lat,
            point_lng: point.lng,
        });
        setSelectMapPointMode(false);
        // makeMoveToSharePointSection();
    };

    const handleClickAddressSearchResult = (
        addressInfo: AddressSearchResult
    ) => {
        const jibunAddress = addressInfo.jibunAddress ?? null;
        const doroAddress = addressInfo.doroAddress ?? null;

        if (addressInfo.lat !== null && addressInfo.lng !== null) {
            const pointLat = addressInfo.lat;
            const pointLng = addressInfo.lng;

            setEditSharePointInfo({
                ...editSharePointInfo,
                jibun_address: jibunAddress,
                doro_address: doroAddress,
                point_lat: pointLat,
                point_lng: pointLng,
            });

            // 아직은 하나의 마커만 사용 가능하므로 이전 마커를 붙이진 않음
            const markerPoint = Leaflet.latLng(
                addressInfo.lat,
                addressInfo.lng
            );

            moveToPoint(markerPoint);
            addMarkerToPoint(markerPoint);
        } else {
            setEditSharePointInfo({
                ...editSharePointInfo,
                jibun_address: jibunAddress,
                doro_address: doroAddress,
                point_lat: null,
                point_lng: null,
            });
        }
    };

    const handleChangeSharePointName = (input: string) => {
        setEditSharePointInfo({
            ...editSharePointInfo,
            point_name: input,
        });
    };

    const goToMapPointMode = () => {
        setSelectMapPointMode(true);
    };

    const handleClickEditAdminMenu = () => {
        setShowEditAdminMenu(true);
        setIsOpenUtilMenu(false);
    };

    const moveToPoint = (latlngPoint: LatLng) => {
        if (!map) {
            return;
        }

        map.setView(latlngPoint, 18);
    };

    const clearAllMarkersOnLayer = () => {
        if (!map || !layerGroupRef?.current) {
            return;
        }
        if (map.hasLayer(layerGroupRef.current)) {
            layerGroupRef.current.clearLayers();
        }
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

    const handleChangeEditShareNameInput = (input: string) => {
        setEditShareName(input);
    };

    const addNewShareGoods = (newGoods: ShareInfoGoods) => {
        setEditGoodsInfo([...editGoodsInfo, newGoods]);
    };

    const handleDeleteShareGoodsLine = (id: CheckboxListItemIdType) => {
        setEditGoodsInfo(editGoodsInfo.filter((_, idx) => idx !== id));
    };

    const handleDeleteShreGoodsAllChecked = (ids: CheckboxListItemIdType[]) => {
        setEditGoodsInfo(editGoodsInfo.filter((_, idx) => !ids.includes(idx)));
    };

    const addNewContact = (newContact: ShareInfoContact) => {
        setEditContactsInfo([...editContactsInfo, newContact]);
    };

    const addNewContacts = (newContacts: ShareInfoContact[]) => {
        setEditContactsInfo([...editContactsInfo, ...newContacts]);
    };

    const handleDeleteContact = (items: CheckBoxListEditItem[]) => {
        const tags = items.map((item) => item.text);
        setEditContactsInfo(
            editContactsInfo.filter((contact) => !tags.includes(contact))
        );
    };

    const handleEditContact = (
        item: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => {
        setEditContactsInfo(
            editContactsInfo.map((contact, idx) =>
                id !== idx ? contact : item.text
            )
        );
    };

    const handleResetContact = (ids?: CheckboxListItemIdType[]) => {
        if (ids) {
            setEditContactsInfo(
                editContactsInfo.filter((_, idx) => !ids.includes(idx))
            );
        } else {
            setEditContactsInfo([]);
        }
    };

    const handleChangeGoodsLineInput = (
        event: ChangeEvent<HTMLInputElement>,
        idx: number
    ) => {
        setShareGoodsCalculatorInputs(
            shareGoodsCalculatorInputs.map((number, index) =>
                index !== idx ? number : parseInt(event.target.value)
            )
        );
    };

    const handleClickAddUserAsAdminButton = (newAdmin: Admin) => {
        setAdminList([...adminList, newAdmin]);
    };
    const handleClickAddAllCheckedUserAsAdminButton = (newAdmins: Admin[]) => {
        setAdminList([...adminList, ...newAdmins]);
    };

    const handleDeleteAdminLine = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };
    const handleDeleteAdmins = (newAdmins: Admin[]) => {
        setAdminList([...newAdmins]);
    };

    const handleLoadAdminMenu = () => {
        if (!wrapperRef?.current) {
            return;
        }

        wrapperRef?.current.scrollTo({
            top: wrapperRef?.current.scrollHeight,
        });
    };

    const editGoodsInfoLine = (idx: number, isPlus: boolean) => {
        if (shareInfo?.goods[idx].input.number === undefined) {
            return;
        }

        const cheese =
            typeof shareInfo?.goods[idx].input.number === "string"
                ? parseInt(shareInfo?.goods[idx].input.number)
                : shareInfo?.goods[idx].input.number;

        if (isNaN(cheese)) {
            return;
        }

        let quantity = shareGoodsCalculatorInputs.find(
            (number, index) => index === idx
        );

        quantity = typeof quantity === "string" ? parseInt(quantity) : quantity;

        if (!quantity || isNaN(quantity)) {
            return;
        }

        if (isPlus) {
            quantity = cheese + quantity;
        } else {
            quantity = cheese - quantity;
        }

        setShareGoodsCalculatorInputs(
            shareGoodsCalculatorInputs.map((number, index) =>
                index !== idx ? number : ""
            )
        );
        setEditGoodsQuantity(
            JSON.stringify(
                shareInfo.goods.map((goods, index) =>
                    idx !== index
                        ? goods
                        : {
                              ...goods,
                              input: {
                                  text: goods.input.text,
                                  number: quantity,
                              },
                          }
                )
            )
        );
    };

    const clickSaveEditShareNameButton = () => {
        const result = checkShareNameIsValiateAndChageEditButtonStatus();
        if (result) {
            setEnableEditShareName(true);
        }
    };

    const checkShareNameIsValiateAndChageEditButtonStatus = () => {
        const validationResult = validateShareName(editShareName);

        if (!validationResult.result) {
            setDisableShareNameEditButton(true);
            return false;
        }
        setDisableShareNameEditButton(false);
        return true;
    };

    const clickSaveEditSharePointButton = () => {
        const result = checkSharePointIsValiateAndChageEditButtonStatus();
        if (result) {
            setEnableEditSharePoint(true);
        }
    };

    const checkSharePointIsValiateAndChageEditButtonStatus = () => {
        const validationResult = validatSharePoint({
            jibunAddress: editSharePointInfo.jibun_address,
            doroAddress: editSharePointInfo.doro_address,
            lat: editSharePointInfo.point_lat,
            lng: editSharePointInfo.point_lng,
        });
        const validateNameResult = validateSharePointName(
            editSharePointInfo.point_name
        );

        if (!validationResult.result || !validateNameResult.result) {
            setDisableSharePointEditButton(true);
            return false;
        }

        setDisableSharePointEditButton(false);
        return true;
    };

    const clickSaveEditShareGoodsButton = () => {
        const result = checkShareGoodsIsValiateAndChageEditButtonStatus();
        if (result) {
            setEnableEditShareGoods(true);
        }
    };

    const checkShareGoodsIsValiateAndChageEditButtonStatus = () => {
        const validationResult = validateShareGoodsInfo(editGoodsInfo);

        if (!validationResult.result) {
            setDisableShareGoodsEditButton(true);
            return false;
        }

        setDisableShareGoodsEditButton(false);
        return true;
    };

    const clickSaveEditShareContactsButton = () => {
        const result = checkShareContactsIsValiateAndChageEditButtonStatus();
        if (result) {
            setEnableEditShareContacts(true);
        }
    };

    const checkShareContactsIsValiateAndChageEditButtonStatus = () => {
        const validationResult = validateContacts(editContactsInfo);

        const validateInputResult = editContactsInfo.find(
            (contact) => !validateContactInput(contact).result
        );

        if (!validationResult.result || validateInputResult) {
            setDisableShareContactsEditButton(true);
            return false;
        }

        setDisableShareContactsEditButton(false);
        return true;
    };

    const clickSaveEditShareAdminsButton = () => {
        const result = checkShareAdminsIsValidateAndChageEditButtonStatus();

        if (result) {
            setEnableEditShareAdmins(true);
        }
    };

    const checkShareAdminsIsValidateAndChageEditButtonStatus = () => {
        const validationResult = validateAdmins(adminList);

        if (!validationResult.result) {
            setDisableShareAdminsEditButton(true);
            return false;
        }

        setDisableShareAdminsEditButton(false);
        return true;
    };

    const toggleStarIcon = () => {
        setEnableChangeStarStatus(true);
    };

    const onClickCancelEditAdminButton = () => {
        setShowEditAdminMenu(false);
    };

    const handleClickDeleteShareButton = () => {
        setShowDeleteShareAlert(true);
    };

    const handleClickCancelDeleteShareButton = () => {
        closeDeleteShareAlert();
    };

    const handleClickContinueDeleteShareButton = () => {
        setEnableDeleteShare(true);
    };

    const closeDeleteShareAlert = () => {
        setShowDeleteShareAlert(false);
    };

    const closeDeleteCompleteShareAlert = () => {
        setShowDeleteShareCompleteAlert(false);
    };

    const handleClickGoButton = () => {
        navigate(-1);
    };

    return (
        <FloatWrapper>
            {showDeleteShareAlert && (
                <AlertBox onClickCloseButton={closeDeleteShareAlert}>
                    <div className="share-detail-alert-box-content">
                        <div className="text">
                            정말로 나눔을 삭제하시겠습니까?
                            <br />
                            <b className="strong">
                                삭제한 뒤에는 되돌릴 수 없습니다.
                            </b>
                        </div>
                        <div className="buttons">
                            <button
                                className="back"
                                onClick={handleClickCancelDeleteShareButton}
                            >
                                돌아가기
                            </button>
                            <button
                                className="delete"
                                onClick={handleClickContinueDeleteShareButton}
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            {showDeleteShareCompleteAlert && (
                <AlertBox onClickCloseButton={closeDeleteCompleteShareAlert}>
                    <div className="share-detail-alert-box-content">
                        <div className="text">
                            나눔이 삭제되었습니다.
                            <br />
                            5초 후 이전 페이지로 이동합니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="imme"
                                onClick={handleClickGoButton}
                            >
                                바로 가기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            {!selectMapPointMode ? (
                <PageWithBackButtonContainerWrapper ref={wrapperRef}>
                    <div
                        className={isMapView ? "hide-sharing-detail-menu" : ""}
                    >
                        {!isNoShareInfo && shareInfo !== null ? (
                            <div className="sharing-menu sharing-detail-menu">
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
                                {userInfo.isLogined && (
                                    <button
                                        className="star-icon"
                                        onClick={toggleStarIcon}
                                    >
                                        {!shareInfo.starred ? (
                                            <StarIcon className="icon" />
                                        ) : (
                                            <FilledStarIcon className="icon filled" />
                                        )}
                                    </button>
                                )}
                                <div
                                    className="util-menu"
                                    onClick={toggleUtilMenu}
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </div>
                                {isOpenUtilMenu && (
                                    <div className="util-items">
                                        {shareInfo.admins.includes(
                                            userInfo.tag
                                        ) ? (
                                            <>
                                                <div
                                                    className="util-item"
                                                    onClick={() => {
                                                        handleClickChangeShareStatusItem(
                                                            0
                                                        );
                                                    }}
                                                >
                                                    나눔재개
                                                </div>
                                                <div
                                                    className="util-item"
                                                    onClick={() => {
                                                        handleClickChangeShareStatusItem(
                                                            1
                                                        );
                                                    }}
                                                >
                                                    휴식하기
                                                </div>
                                                <div
                                                    className="util-item"
                                                    onClick={() => {
                                                        handleClickChangeShareStatusItem(
                                                            2
                                                        );
                                                    }}
                                                >
                                                    마감하기
                                                </div>
                                                <div
                                                    className="util-item"
                                                    onClick={
                                                        handleClickEditAdminMenu
                                                    }
                                                >
                                                    어드민관리
                                                </div>
                                                <div
                                                    className="util-item"
                                                    onClick={
                                                        handleClickDeleteShareButton
                                                    }
                                                >
                                                    삭제하기
                                                </div>
                                            </>
                                        ) : (
                                            <div className="util-item">
                                                신고하기
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="sharing-detail-menu-title">
                                    {shareInfo.admins.includes(userInfo.tag) ? (
                                        !editMode.name ? (
                                            <WrapperWithEditButton
                                                onClick={() =>
                                                    onClickEditButton(
                                                        "name",
                                                        true
                                                    )
                                                }
                                            >
                                                {shareInfo.name}
                                            </WrapperWithEditButton>
                                        ) : (
                                            <div className="edit-wrapper">
                                                <SharingInputNameRulePopup />
                                                <div className="edit-title">
                                                    <div className="input-area">
                                                        <SharingInputNameContent
                                                            shareName={
                                                                editShareName
                                                            }
                                                            onChangeInput={
                                                                handleChangeEditShareNameInput
                                                            }
                                                        />
                                                    </div>
                                                    <div className="edit-util-menu">
                                                        <button
                                                            className="util-button cancel"
                                                            onClick={() =>
                                                                onClickEditButton(
                                                                    "name",
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditNameQuery
                                                            }
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className="util-button save"
                                                            onClick={
                                                                clickSaveEditShareNameButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditNameQuery ||
                                                                disableShareNameEditButton
                                                            }
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <>{shareInfo.name}</>
                                    )}
                                </div>
                                <div className="section point-area">
                                    <div className="header-block">
                                        <MapPinIcon className="w-7 h-7 mr-1" />{" "}
                                        장소
                                        {shareInfo.admins.includes(
                                            userInfo.tag
                                        ) &&
                                            (!editMode.point ? (
                                                <div
                                                    className="util-menu"
                                                    onClick={() =>
                                                        onClickEditButton(
                                                            "point",
                                                            true
                                                        )
                                                    }
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <SharingInputSharePointRulePopup />
                                                    <div className="util-menu">
                                                        <button
                                                            className="util-button cancel"
                                                            onClick={() =>
                                                                onClickEditButton(
                                                                    "point",
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditPointQuery
                                                            }
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className="util-button save"
                                                            onClick={
                                                                clickSaveEditSharePointButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditPointQuery ||
                                                                disableSharePointEditButton
                                                            }
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="tail-block">
                                        {!editMode.point ? (
                                            <>
                                                <div className="point-name">
                                                    <b className="point-name-title">
                                                        장소명
                                                    </b>
                                                    {shareInfo.point_name}
                                                </div>
                                                <div className="addresses">
                                                    <b className="addresses-title">
                                                        주소
                                                    </b>
                                                    {shareInfo.jibun_address && (
                                                        <WrapperWithCopyButton
                                                            onClick={() => {
                                                                if (
                                                                    !shareInfo.jibun_address
                                                                ) {
                                                                    return;
                                                                }
                                                                copyTextToClipboard(
                                                                    shareInfo.jibun_address
                                                                );
                                                            }}
                                                            isCopied={
                                                                copiedText ===
                                                                shareInfo.jibun_address
                                                            }
                                                        >
                                                            <div className="badge jibun">
                                                                지번
                                                            </div>
                                                            <div className="address-text-area">
                                                                {
                                                                    shareInfo.jibun_address
                                                                }
                                                            </div>
                                                        </WrapperWithCopyButton>
                                                    )}
                                                    {shareInfo.doro_address && (
                                                        <WrapperWithCopyButton
                                                            onClick={() => {
                                                                if (
                                                                    !shareInfo.doro_address
                                                                ) {
                                                                    return;
                                                                }
                                                                copyTextToClipboard(
                                                                    shareInfo.doro_address
                                                                );
                                                            }}
                                                            isCopied={
                                                                copiedText ===
                                                                shareInfo.doro_address
                                                            }
                                                        >
                                                            <div className="badge doro">
                                                                도로명
                                                            </div>
                                                            <div className="address-text-area">
                                                                {
                                                                    shareInfo.doro_address
                                                                }
                                                            </div>
                                                        </WrapperWithCopyButton>
                                                    )}
                                                    {!shareInfo.jibun_address &&
                                                        !shareInfo.doro_address && (
                                                            <div className="address-line none">
                                                                작성자가 주소를
                                                                등록하지
                                                                않았어요.
                                                            </div>
                                                        )}
                                                </div>
                                            </>
                                        ) : (
                                            <SharingInputPointContent
                                                sharePointName={
                                                    editSharePointInfo.point_name
                                                }
                                                sharePointJibunAddress={
                                                    editSharePointInfo.jibun_address
                                                }
                                                sharePointDoroAddress={
                                                    editSharePointInfo.doro_address
                                                }
                                                sharePointLatLng={[
                                                    editSharePointInfo.point_lat,
                                                    editSharePointInfo.point_lng,
                                                ]}
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
                                        )}
                                    </div>
                                </div>
                                <div className="section share-goods-area">
                                    <div className="header-block">
                                        <GiftIcon className="w-6 h-6 mr-1" />{" "}
                                        나눔 품목
                                        {shareInfo.admins.includes(
                                            userInfo.tag
                                        ) &&
                                            (!editMode.goods ? (
                                                <div
                                                    className="util-menu"
                                                    onClick={() =>
                                                        onClickEditButton(
                                                            "goods",
                                                            true
                                                        )
                                                    }
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <SharingInputShareGoodsRulePopup />
                                                    <div className="util-menu">
                                                        <button
                                                            className="util-button cancel"
                                                            onClick={() =>
                                                                onClickEditButton(
                                                                    "goods",
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditGoodsQuery
                                                            }
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className="util-button save"
                                                            onClick={
                                                                clickSaveEditShareGoodsButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditGoodsQuery ||
                                                                disableShareGoodsEditButton
                                                            }
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="tail-block">
                                        {!editMode.goods ? (
                                            <div className="share-goods">
                                                {shareInfo.goods?.map(
                                                    (goods, idx) => (
                                                        <div
                                                            className={`goods-line ${
                                                                goods.input
                                                                    .number ===
                                                                0
                                                                    ? "sold-out"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="text">
                                                                {getGoodsString(
                                                                    goods
                                                                )}
                                                            </div>
                                                            {goods.input
                                                                .number ===
                                                                0 && (
                                                                <div className="badge">
                                                                    품절
                                                                </div>
                                                            )}
                                                            {shareInfo.admins.includes(
                                                                userInfo.tag
                                                            ) &&
                                                                [
                                                                    0, 1, 2,
                                                                ].includes(
                                                                    goods.type
                                                                ) && (
                                                                    <div className="calculator">
                                                                        <button
                                                                            onClick={() => {
                                                                                editGoodsInfoLine(
                                                                                    idx,
                                                                                    false
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                loadingshareInfoEditGoodsQuantityQuery
                                                                            }
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                shareGoodsCalculatorInputs[
                                                                                    idx
                                                                                ]
                                                                            }
                                                                            onChange={(
                                                                                event: ChangeEvent<HTMLInputElement>
                                                                            ) =>
                                                                                handleChangeGoodsLineInput(
                                                                                    event,
                                                                                    idx
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                editGoodsInfoLine(
                                                                                    idx,
                                                                                    true
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                loadingshareInfoEditGoodsQuantityQuery
                                                                            }
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <SharingInputGoodsContent
                                                shareGoodsInfoList={
                                                    editGoodsInfo
                                                }
                                                addNewShareGoods={
                                                    addNewShareGoods
                                                }
                                                handleDeleteShareGoodsLine={
                                                    handleDeleteShareGoodsLine
                                                }
                                                handleDeleteShreGoodsAllChecked={
                                                    handleDeleteShreGoodsAllChecked
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="section contacts-area">
                                    <div className="header-block">
                                        <PhoneIcon className="w-6 h-6 mr-1" />{" "}
                                        연락처
                                        {shareInfo.admins.includes(
                                            userInfo.tag
                                        ) &&
                                            (!editMode.contacts ? (
                                                <div
                                                    className="util-menu"
                                                    onClick={() =>
                                                        onClickEditButton(
                                                            "contacts",
                                                            true
                                                        )
                                                    }
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div>
                                                    <SharingInputShareContactsRulePopup />
                                                    <div className="util-menu">
                                                        <button
                                                            className="util-button cancel"
                                                            onClick={() =>
                                                                onClickEditButton(
                                                                    "contacts",
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditContactsQuery
                                                            }
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className="util-button save"
                                                            onClick={
                                                                clickSaveEditShareContactsButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditContactsQuery ||
                                                                disableShareContactsEditButton
                                                            }
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="tail-block">
                                        <div className="contacts">
                                            {!editMode.contacts ? (
                                                shareInfo.contacts?.map(
                                                    (contact) => (
                                                        <WrapperWithCopyButton
                                                            onClick={() => {
                                                                copyTextToClipboard(
                                                                    contact
                                                                );
                                                            }}
                                                            isCopied={
                                                                copiedText ===
                                                                contact
                                                            }
                                                        >
                                                            {contact}
                                                        </WrapperWithCopyButton>
                                                    )
                                                )
                                            ) : (
                                                <SharingInputContactsContent
                                                    contacts={editContactsInfo}
                                                    addNewContact={
                                                        addNewContact
                                                    }
                                                    addNewContacts={
                                                        addNewContacts
                                                    }
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
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {showEditAdminMenu &&
                                    !loadingLoadAdminInfoDataQuery && (
                                        <div className="section contacts-area">
                                            <div className="header-block">
                                                <UsersIcon className="w-6 h-6 mr-1" />{" "}
                                                어드민 관리
                                                <div>
                                                    <SharingInputShareContactsRulePopup />
                                                    <div className="util-menu">
                                                        <button
                                                            className="util-button cancel"
                                                            onClick={
                                                                onClickCancelEditAdminButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditAdminsQuery
                                                            }
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            className="util-button save"
                                                            onClick={
                                                                clickSaveEditShareAdminsButton
                                                            }
                                                            disabled={
                                                                loadingshareInfoEditAdminsQuery ||
                                                                disableShareAdminsEditButton
                                                            }
                                                        >
                                                            저장
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tail-block">
                                                <div className="contacts">
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
                                        </div>
                                    )}
                            </div>
                        ) : shareInfo === null ? (
                            <div>로딩중</div>
                        ) : (
                            <NoItemStatusScreen />
                        )}
                    </div>
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

export default SharingDetailMenu;

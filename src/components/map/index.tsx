import { useRef, useEffect, useState, useContext } from "react";

import { useQuery, useQueryClient } from "react-query";

import { useNavigate, useParams, useLocation } from "react-router-dom";

import { MapContext, SearchContext } from "@/App";

import Leaflet, {
    LatLng,
    LayerGroup,
    LocationEvent,
    Map as LeafletMap,
    Zoom,
} from "leaflet";
import "leaflet.markercluster";

import { postGetShareInfosInBounds, ReturnWith } from "@/api/request/requests";

import {
    ShareInfoForRequest,
    ShareInfoForResponse,
} from "@components/menus/sharing";
import { ShareInfoId } from "@components/menus/sharing";
import FullScreenWrapper from "@components/wrapper/fullScreen";

import { MapPinIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

import { ColorRing } from "react-loader-spinner";

import "leaflet/dist/leaflet.css";
import "./map.css";

export interface MapProps {
    mapId: string;
}

export interface ShareMapPoint {
    lat: number;
    lng: number;
}

export interface ShareMapBounds {
    southwest: ShareMapPoint;
    northwest: ShareMapPoint;
    northeast: ShareMapPoint;
    southeast: ShareMapPoint;
}

export const getViewportCorners = (map?: LeafletMap): ShareMapBounds | null => {
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

const mapName = "main-map";

function Map({ mapId }: MapProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const mapDOMRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Leaflet.Map>();
    const markerLayerGroupRef = useRef<LayerGroup>();

    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
    const [enableLoadShareDataInMap, setEnableLoadShareDataInMap] =
        useState<boolean>(false);

    const [isPendingCurrentPosition, setIsPendingCurrentPosition] =
        useState(false);

    const { map, setMap, shareInfosInBounds, setShareInfosInBounds } =
        useContext(MapContext);
    const { searchInfo, isMapView } = useContext(SearchContext);

    const {
        data: shareListData,
        isLoading: loadingShareListData,
        error,
    } = useQuery<ReturnWith<ShareInfoForResponse[]> | undefined, Error>(
        [JSON.stringify(map?.getBounds())],
        () => {
            const bounds = getViewportCorners(map);

            if (bounds === null) {
                return;
            }

            return postGetShareInfosInBounds(bounds);
        },
        {
            enabled: enableLoadShareDataInMap,
            onSettled: () => {
                setEnableLoadShareDataInMap(false);
            },
            onSuccess: (response?: ReturnWith<ShareInfoForResponse[]>) => {
                if (response?.error) {
                    setShareInfosInBounds([]);
                }
            },
        }
    );

    useEffect(() => {
        if (!shareListData?.success) {
            return;
        }

        setShareInfosInBounds(shareListData.success);
    }, [shareListData]);

    useEffect(() => {
        clearAllMarkersOnLayer();
        makeMarkerOnMap();
    }, [id, shareInfosInBounds]);

    useEffect(() => {
        if (!map) {
            return;
        }

        if (markerLayerGroupRef.current && searchInfo.keyword !== "") {
            map.removeLayer(markerLayerGroupRef.current);
        }
        markerLayerGroupRef.current = new Leaflet.MarkerClusterGroup({
            iconCreateFunction: (cluster) => {
                return new Leaflet.DivIcon({
                    html: `<div class="map-marker-wrapper">
                    <div class="map-marker cluster">${cluster.getChildCount()}</div></div>`,
                    className: "dummy",
                });
            },
            maxClusterRadius: 64,
        });

        const makeLoadShareDataEnable = () => {
            if (searchInfo.keyword !== "") {
                return;
            }
            setEnableLoadShareDataInMap(true);
        };

        map.on("load moveend zoomend", makeLoadShareDataEnable);

        return () => {
            map.off("load moveend zoomend", makeLoadShareDataEnable);
        };
    }, [map, searchInfo]);

    useEffect(() => {
        if (location.pathname === "/") {
            setEnableLoadShareDataInMap(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (isMapLoaded) {
            return;
        }

        setIsMapLoaded(true);

        mapRef.current = Leaflet.map(mapName, {
            center: [37.56, 126.97],
            zoom: 13,
            zoomControl: false,
            minZoom: 7,
            maxZoom: 18,
        });
    }, [isMapLoaded]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        setMap(mapRef.current);
        Leaflet.tileLayer(
            // "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            "https://xdworld.vworld.kr:8080/2d/Base/201710/{z}/{x}/{y}.png"
        ).addTo(mapRef.current);
    }, [mapRef]);

    const clearAllMarkersOnLayer = () => {
        if (!map || !markerLayerGroupRef?.current) {
            return;
        }
        if (map.hasLayer(markerLayerGroupRef.current)) {
            markerLayerGroupRef.current.clearLayers();
        }
    };

    const makeMarkerOnMap = () => {
        if (!map || !markerLayerGroupRef.current) {
            return;
        }
        shareInfosInBounds.forEach((shareInfo) => {
            if (!shareInfo.point_lng || !shareInfo.point_lat) {
                return;
            }

            const marker = new Leaflet.Marker(
                [shareInfo.point_lat, shareInfo.point_lng],
                {
                    icon: new Leaflet.DivIcon({
                        html: `<div class="map-marker-wrapper">
                            <div class="map-marker ${
                                location.pathname ===
                                    `/sharing/detail/${shareInfo.id}` &&
                                id === shareInfo.id?.toString()
                                    ? "current"
                                    : "normal"
                            }">
                                <div class="wrapper">
                                    <div class="badge"></div>
                                    <div class="point-name">${
                                        shareInfo.name
                                    }</div>
                                </div>
                            </div>
                        </div>`,
                        className: "dummy",
                    }),
                }
            );
            marker.on("click", () => {
                if (!shareInfo.id) {
                    return;
                }

                handleClickMapMarker(shareInfo.id);
            });

            markerLayerGroupRef.current?.addLayer(marker);
        });

        map.addLayer(markerLayerGroupRef.current);
    };

    const handleClickGoToUserCurrentPositionButton = () => {
        if (!map) {
            return;
        }
        if (navigator.geolocation) {
            setIsPendingCurrentPosition(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setIsPendingCurrentPosition(false);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    map.setView([lat, lon], 17);
                },
                () => {
                    setIsPendingCurrentPosition(false);
                    console.error("위치 정보를 가져오는 데 실패했습니다.");
                },
                {
                    timeout: 5000,
                }
            );
        } else {
            console.error("이 브라우저는 Geolocation을 지원하지 않습니다.");
        }
    };

    const handleClickZoomInButton = () => {
        if (!map) {
            return;
        }
        if (map.getZoom() + 1 > 18) {
            return;
        }
        map.setZoom(map.getZoom() + 1);
    };

    const handleClickZoomOutButton = () => {
        if (!map) {
            return;
        }
        if (map.getZoom() - 1 < 7) {
            return;
        }
        map.setZoom(map.getZoom() - 1);
    };

    const handleClickMapMarker = (id: ShareInfoId) => {
        navigate(`/sharing/detail/${id}`);
    };

    return (
        <FullScreenWrapper id={mapId} ref={mapDOMRef}>
            {isMapView && (
                <div className="map-control-buttons">
                    <div className="button-group">
                        <button
                            className="control-button"
                            onClick={handleClickGoToUserCurrentPositionButton}
                        >
                            {!isPendingCurrentPosition ? (
                                <MapPinIcon className="w-5 h-5" />
                            ) : (
                                <ColorRing
                                    visible={true}
                                    height="20"
                                    width="20"
                                    ariaLabel="color-ring-loading"
                                    wrapperStyle={{}}
                                    wrapperClass="color-ring-wrapper"
                                    colors={[
                                        "#38BDF8",
                                        "#38BDF8",
                                        "#38BDF8",
                                        "#38BDF8",
                                        "#38BDF8",
                                    ]}
                                />
                            )}
                        </button>
                    </div>

                    <div className="button-group">
                        <button
                            className="control-button"
                            onClick={handleClickZoomInButton}
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                        <button
                            className="control-button"
                            onClick={handleClickZoomOutButton}
                        >
                            <MinusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </FullScreenWrapper>
    );
}

export default Map;

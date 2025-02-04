import { useContext } from "react";

import { AuthContext, SearchContext } from "@/App";

import { useNavigate } from "react-router-dom";

import {
    MapIcon,
    ListBulletIcon,
    ChevronLeftIcon,
    HomeIcon,
} from "@heroicons/react/24/outline";

import { UserIcon } from "@heroicons/react/16/solid";

import "./withBackAndHomeAndUserInfoButton.css";

const HeaderWithBackAndHomeAndUserInfoButton = () => {
    const { userInfo } = useContext(AuthContext);
    const { setSearchInfo, isMapView, setIsMapView } =
        useContext(SearchContext);

    const navigate = useNavigate();

    const handleClickBackButton = () => {
        goBack();
    };

    const goBack = () => {
        navigate(-1);
    };

    const handleClickMyPageButton = () => {
        if (userInfo.isLogined) {
            navigate("/user/info");
        } else {
            navigate("/user/login");
        }
    };

    const handleClicHomeButton = () => {
        setSearchInfo({
            keyword: "",
            mapOnly: true,
        });
        setIsMapView(true);
        navigate("/");
    };

    const toggleMapView = () => {
        setIsMapView(!isMapView);
    };

    return (
        <div className="page-with-back-button-and-user-info-button-header">
            <div className="left-buttons">
                <div
                    className="back-button button"
                    onClick={handleClickBackButton}
                >
                    <ChevronLeftIcon />
                </div>
                <button
                    className="home-button button"
                    onClick={handleClicHomeButton}
                >
                    <HomeIcon className="icon" />
                </button>
                {isMapView ? (
                    <button
                        className="map-button button"
                        onClick={toggleMapView}
                    >
                        <ListBulletIcon className="icon" />
                    </button>
                ) : (
                    <button
                        className="map-button button"
                        onClick={toggleMapView}
                    >
                        <MapIcon className="icon" />
                    </button>
                )}
            </div>
            <button
                className="userinfo-button button"
                onClick={handleClickMyPageButton}
            >
                <UserIcon className="icon" />
            </button>
        </div>
    );
};

export default HeaderWithBackAndHomeAndUserInfoButton;

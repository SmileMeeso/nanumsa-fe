import { useContext } from "react";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import { HomeIcon } from "@heroicons/react/16/solid";

import { SearchContext } from "@/App";

import { useNavigate } from "react-router-dom";

const HeaderWithBackAndHomeButton = () => {
    const navigate = useNavigate();

    const { setSearchInfo, setIsMapView } = useContext(SearchContext);

    const handleClickBackButton = () => {
        goBack();
    };

    const goBack = () => {
        navigate(-1);
    };

    const handleClicHomeButton = () => {
        setSearchInfo({
            keyword: "",
            mapOnly: true,
        });
        setIsMapView(true);
        navigate("/");
    };

    return (
        <div className="page-with-back-button-header-and-list">
            <div className="back-button button" onClick={handleClickBackButton}>
                <ChevronLeftIcon />
            </div>
            <button
                className="home-button button"
                onClick={handleClicHomeButton}
            >
                <HomeIcon className="icon" />
            </button>
        </div>
    );
};

export default HeaderWithBackAndHomeButton;

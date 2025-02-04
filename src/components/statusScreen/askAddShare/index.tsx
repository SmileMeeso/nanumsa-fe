import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/16/solid";

import { useNavigate } from "react-router-dom";

import "../statusScreen.css";

const AskAddShareScreen = () => {
    const navigate = useNavigate();

    const handleClickGoToAddSharePage = () => {
        navigate("/sharing/new");
    };

    return (
        <div className="status-screen-wrapper">
            <FaceFrownIcon className="w-10 h-10 text-amber-400" />
            <div className="script-area">
                앗, 이 지역엔 나눔중인 프로젝트가 없어요.
                <br />
                혹시 직접 나눔을 추가하시겠어요?
            </div>
            <button
                className="go-to-new-share"
                onClick={handleClickGoToAddSharePage}
            >
                <HeartIcon className="heart" />
                나눔 추가하기
                <HeartIcon className="heart" />
            </button>
        </div>
    );
};

export default AskAddShareScreen;

import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/16/solid";

import { useNavigate } from "react-router-dom";

import "../statusScreen.css";

const AskAddShareToMy = () => {
    const navigate = useNavigate();

    const handleClickGoToAddSharePage = () => {
        navigate("/sharing/new");
    };

    return (
        <div className="status-screen-wrapper">
            <FaceFrownIcon className="w-10 h-10 text-amber-400" />
            <div className="script-area">
                유저님이 어드민으로 있는 나눔이 없어요.
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

export default AskAddShareToMy;

import { useNavigate } from "react-router-dom";

import "../statusScreen.css";

const NeedLoginStatusScreen = () => {
    const navigate = useNavigate();

    const handleClickGoToLoginButton = () => {
        navigate("/user/login?prev_path=" + window.location.pathname);
    };
    return (
        <div className="status-screen-wrapper">
            로그인이 필요한 페이지입니다.
            <button
                className="submit-button"
                onClick={handleClickGoToLoginButton}
            >
                로그인 페이지로 이동하기
            </button>
        </div>
    );
};

export default NeedLoginStatusScreen;

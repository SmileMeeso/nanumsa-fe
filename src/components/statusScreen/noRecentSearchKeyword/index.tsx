import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import "../statusScreen.css";

const NoRecentSearchKeywordScreen = () => {
    return (
        <div className="status-screen-wrapper">
            <ExclamationTriangleIcon className="w-10 h-10 text-amber-400" />
            최근 검색어가 없습니다.
        </div>
    );
};

export default NoRecentSearchKeywordScreen;

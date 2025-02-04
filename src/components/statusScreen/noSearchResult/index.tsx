import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import "../statusScreen.css";

const NoSearchResultStatusScreen = () => {
    return (
        <div className="status-screen-wrapper">
            <ExclamationTriangleIcon className="w-10 h-10 text-amber-400" />
            검색 결과가 없습니다.
        </div>
    );
};

export default NoSearchResultStatusScreen;

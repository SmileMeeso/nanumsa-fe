import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import "../statusScreen.css";

const NoItemStatusScreen = () => {
    return (
        <div className="status-screen-wrapper">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            해당 id에 대한 나눔 정보가 없습니다.
        </div>
    );
};

export default NoItemStatusScreen;

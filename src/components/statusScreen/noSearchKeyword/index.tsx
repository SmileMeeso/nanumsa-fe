import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

import "../statusScreen.css";

interface NoSearchResultStatusScreenProps {
    keyword: string;
}

const NoSearchResultStatusScreen = ({
    keyword,
}: NoSearchResultStatusScreenProps) => {
    return (
        <div className="status-screen-wrapper">
            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-amber-400" />
            <div className="script-area">
                <span>검색어 "</span>
                <b className="text-amber-400 inline">{keyword}</b>
                <span>"에 맞는</span>
                <br />
                <span>검색결과가 없습니다.</span>
            </div>
        </div>
    );
};

export default NoSearchResultStatusScreen;

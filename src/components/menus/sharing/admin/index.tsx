import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    DocumentTextIcon,
} from "@heroicons/react/16/solid";

const AdminSharingMenu = function () {
    return (
        <div>
            내가 관리하는 나눔 리스트
            <ul>
                <li>
                    <div>#태그이름#태그이름#태그이름</div>
                    <div>
                        참여자 리스트(관리자만 유저관리가능)
                        <ul>
                            <li>
                                관리자1<div>관리자</div>
                            </li>
                            <li>
                                관리자2
                                <div>
                                    관리자
                                    <MinusIcon />
                                </div>
                            </li>
                            <li>
                                일반이
                                <PlusIcon />
                            </li>
                        </ul>
                        외 3명<div>전체보기</div>
                    </div>
                    <div>
                        나눔 관리
                        <ul>
                            <li>
                                돈: 100,000원
                                <PencilIcon />
                                <TrashIcon />
                                <DocumentTextIcon />
                                <div>
                                    --- 변경 목록 --- 마지막 업데이트 2024-12-12
                                    12:12:12
                                    <ul>
                                        <li>
                                            관리자1 -5000 2024-12-10 10:10:10
                                        </li>
                                        <li>
                                            관리자1 -5000 2024-12-10 10:10:10
                                        </li>
                                        <li>
                                            관리자1 -5000 2024-12-10 10:10:10
                                        </li>
                                        <li>
                                            관리자1 -5000 2024-12-10 10:10:10
                                        </li>
                                        <li>
                                            나눔의 형식이 변경됨(형식3 - 형식1,
                                            100000원)
                                        </li>
                                        <li>
                                            관리자1 딸기라떼 무제한 2024-12-10
                                            10:10:10
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li>
                                수량: 아무거나 123개 <PencilIcon />
                                <TrashIcon />
                                <DocumentTextIcon />
                            </li>
                            <li>
                                수량: 아메리카노 123개
                                <PencilIcon />
                                <TrashIcon />
                                <DocumentTextIcon />
                                <div>
                                    --- 변경 목록 --- 마지막 업데이트 2024-12-12
                                    12:12:12
                                    <ul>
                                        <li>관리자1 -1 2024-12-10 10:10:10</li>
                                        <li>관리자1 -2 2024-12-10 10:10:10</li>
                                        <li>관리자1 -3 2024-12-10 10:10:10</li>
                                        <li>관리자1 +4 2024-12-10 10:10:10</li>
                                    </ul>
                                </div>
                            </li>
                            <li>
                                100개 이하로 남음
                                <PencilIcon />
                                <TrashIcon />
                                <DocumentTextIcon />
                            </li>
                            <li>
                                아 메리카노는 무제한 제공
                                <PencilIcon />
                                <TrashIcon />
                                <DocumentTextIcon />
                                <div>
                                    --- 변경 목록 --- 마지막 업데이트 2024-12-12
                                    12:12:12
                                    <ul>
                                        <li>
                                            관리자1 딸기라떼 무제한 2024-12-10
                                            10:10:10
                                        </li>
                                        <li>
                                            관리자1 아메리카노 무제한 2024-12-10
                                            10:10:10
                                        </li>
                                        <li>
                                            관리자1 카페라떼 무제한 2024-12-10
                                            10:10:10
                                        </li>
                                        <li>
                                            관리자1 우웩 2024-12-10 10:10:10
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default AdminSharingMenu;

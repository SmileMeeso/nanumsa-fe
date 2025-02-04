import React from "react";

import {
    MapPinIcon,
    DevicePhoneMobileIcon,
    MegaphoneIcon,
    ClockIcon,
    EllipsisVerticalIcon,
} from "@heroicons/react/16/solid";

const StoreMenu = function () {
    return (
        <div>
            <div>
                <EllipsisVerticalIcon /> 관리권한 있으면 편집/마감/삭제 가능
            </div>
            <div>#태그#태그#태그</div>
            <div>
                <MapPinIcon />
                주소 주소 주소 123길 56 456호
            </div>
            <div>
                <DevicePhoneMobileIcon />
                연락처
                <ul>
                    <li>가게번호: 010-1234-5678</li>
                    <li>내번호: 031-1234-5678</li>
                    <li>twitter: jjakjjak</li>
                    <li>insta: starstar123</li>
                </ul>
            </div>
            <div>
                <MegaphoneIcon />
                태그 만든 사람이 남긴 메모 길어지면 스크롤
            </div>
            <div>
                나눔 현황
                <ul>
                    <li>돈: 100,000원</li>
                    <li>수량: 아무거나 123개</li>
                    <li>수량: 아메리카노 123개</li>
                    <li>100개 이하로 남음</li>
                    <li>아메리카노는 무제한 제공</li>
                </ul>
            </div>
            <div>
                <ClockIcon />
                마지막 업데이트 시간
            </div>
        </div>
    );
};

export default StoreMenu;

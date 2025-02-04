import SharingRulePopup from "@components/sharing/rulePopup";

const SharingInputAdminRulePopup = () => {
    return (
        <SharingRulePopup
            title="관리자 규칙"
            rules={[
                "반드시 1명 이상",
                "쉼표와 숫자만 입력 가능",
                "여러명 검색 가능",
                "예시: 6625,2335,3193",
                "태그는 8자리의 숫자",
                "태그는 마이페이지에서 확인 가능",
            ]}
        />
    );
};

export default SharingInputAdminRulePopup;

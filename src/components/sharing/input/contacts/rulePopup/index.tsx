import SharingRulePopup from "@components/sharing/rulePopup";

const SharingInputShareContactsRulePopup = () => {
    return (
        <SharingRulePopup
            title="연락처 규칙"
            rules={[
                "1~20자 사이",
                "한글, 영문 대소문자, 숫자, 띄어쓰기, 특수문자[]#@-_ 만 사용 만 사용할 수 있습니다.",
                "최대 10개까지 추가 가능합니다.",
                "하나 이상의 연락처가 필요합니다.",
            ]}
        />
    );
};

export default SharingInputShareContactsRulePopup;

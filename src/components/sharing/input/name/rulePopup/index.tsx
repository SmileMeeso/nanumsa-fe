import SharingRulePopup from "@components/sharing/rulePopup";

const SharingInputNameRulePopup = () => {
    return (
        <SharingRulePopup
            title="이름 규칙"
            rules={[
                "1~30글자 사이",
                "한글, 영어대소문자, 숫자, 특수문자 #!^~@",
                "이모지 사용 가능",
            ]}
        />
    );
};

export default SharingInputNameRulePopup;

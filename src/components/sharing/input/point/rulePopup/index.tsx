import SharingRulePopup from "@components/sharing/rulePopup";

const SharingInputSharePointRulePopup = () => {
    return (
        <SharingRulePopup
            title="장소 이름 규칙"
            rules={[
                "1~20글자 사이",
                "한글, 영어대소문자, 숫자, 띄어쓰기, -_ 사용 가능",
            ]}
        />
    );
};

export default SharingInputSharePointRulePopup;

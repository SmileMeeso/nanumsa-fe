import SharingRulePopup from "@components/sharing/rulePopup";

const SharingInputShareGoodsRulePopup = () => {
    return (
        <SharingRulePopup
            title="나눔 물품 규칙"
            rules={[
                "반드시 1가지 이상 필요해요.",
                "텍스트 입력칸은 한글, 영어 대소문자, 특수문자 #!^~@, 이모지, 띄어쓰기 포함 30자 이하로 입력해주세요.",
                "숫자 입력칸에는 숫자만 입력 가능합니다.",
                "만들어진 나눔 물품은 수정이 불가능해요. 삭제하고 다시 생성해주세요.",
            ]}
        />
    );
};

export default SharingInputShareGoodsRulePopup;

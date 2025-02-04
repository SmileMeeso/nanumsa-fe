import { useState } from "react";

import { ShareInfoName, ValidateResult } from "@components/menus/sharing";
import TextInput from "@components/input/textInput";

export interface ShareInputNameContentProps {
    shareName: ShareInfoName;
    onChangeInput: (input: string) => void;
}

export const validateShareName = (input: string): ValidateResult => {
    // 초기값
    if (input === "") {
        return {
            code: 3,
            result: false,
        };
    }

    // 조건 1: 문자열 길이는 1~30글자 사이
    if (input.length < 1 || input.length > 30) {
        return {
            code: 1,
            message: "1~30글자 사이의 이름만 사용할 수 있습니다.",
            result: false,
        };
    }

    // 조건 2: 한글, 영어 대소문자, 특수문자 #!^~@ 만 사용
    const validChars = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9#!^~@\s]+$/;

    // 조건 3: 이모지 허용
    const emojiRegex = /[\p{Emoji}\uFE0F]/gu;

    // 조건 2와 3을 검사
    const remainingString = input.replace(emojiRegex, ""); // 이모지를 빈 문자열로 대체해서 검사
    if (!validChars.test(remainingString)) {
        return {
            code: 2,
            message:
                "한글, 영어 대소문자, 숫자, 특수문자 #!^~@, 이모지, 띄어쓰기 만 사용할 수 있습니다.",
            result: false,
        };
    }

    return {
        code: 0,
        result: true,
    };
};

const ShareInputNameContent = ({
    shareName,
    onChangeInput,
}: ShareInputNameContentProps) => {
    const [shareNameErrorState, setShareNameErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const handleChangeShareNameInput = (input: string) => {
        const validateResult = validateShareName(input);

        setShareNameErrorState(validateResult);
        onChangeInput(input);
    };

    return (
        <TextInput
            value={shareName}
            placeholder="여기에 입력해주세요."
            isError={
                !shareNameErrorState.result && shareNameErrorState.code !== 3
            }
            errorMessage={shareNameErrorState.message}
            onChangeInput={handleChangeShareNameInput}
        />
    );
};

export default ShareInputNameContent;

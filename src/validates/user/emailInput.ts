import { ValidateResult } from "@components/menus/sharing";

export const validateEmailInput = (input: string): ValidateResult => {
    if (
        !/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i.test(
            input
        )
    ) {
        return {
            code: 1,
            result: false,
            message: "유효한 이메일을 입력해주세요.",
        };
    }

    return {
        code: 0,
        result: true,
    };
};

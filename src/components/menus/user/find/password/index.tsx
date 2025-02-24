import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { KeyIcon } from "@heroicons/react/24/outline";

import { useQuery } from "react-query";
import TextInput from "@components/input/textInput";
import FullWidthButton from "@components/button/fullWidthButton";

import { validateEmailInput } from "@/validates/user/emailInput";
import { ValidateResult } from "@components/menus/sharing";
import AlertBox from "@components/alertBox";

import {
    MessageReturn,
    postSendChangePasswordEmail,
} from "@/api/request/requests";

const UserFindPasswordMenu = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

    const [goToLoginPageTimeout, setGoToLoginPageTimeout] =
        useState<boolean>(false);

    const [validateStatus, setValidateStatus] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });

    const { data, isLoading } = useQuery<MessageReturn | undefined, Error>(
        [email],
        () => {
            setEnableQuery(false);
            return postSendChangePasswordEmail(email);
        },
        {
            enabled: enableQuery && Boolean(email),
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setShowCompleteAlert(true);
                    setGoToLoginPageTimeout(true);

                    setTimeout(() => {
                        goToLoginPage();
                    }, 5 * 1000);
                } else if (response?.error) {
                    setValidateStatus({
                        code: 2,
                        result: false,
                        message: response?.error,
                    });
                }
            },
        }
    );

    useEffect(() => {
        if (!goToLoginPageTimeout) {
            return;
        }

        const timeout = setTimeout(() => {
            goToLoginPage();
        }, 5 * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [goToLoginPageTimeout]);

    const handleChangeEmail = (input: string) => {
        const result = validateEmailInput(input);

        setEmail(input);
        setValidateStatus(result);
    };

    const handleClickGoNow = () => {
        goToLoginPage();
    };

    const goToLoginPage = () => {
        navigate("/user/login");
    };

    const handleClickSubmitChangeEmail = () => {
        const inputResult = validateEmailInput(email);

        if (!inputResult.result) {
            setValidateStatus(inputResult);
            return;
        }

        setEnableQuery(true);
    };

    return (
        <div className="user-edit-sub-menu">
            {showCompleteAlert && (
                <AlertBox onClickCloseButton={handleClickGoNow}>
                    <div className="alert-box-content">
                        <div className="text">
                            비밀번호 변경 메일 전송이 완료 되었습니다. 5초 후
                            로그인 페이지로 이동합니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={handleClickGoNow}
                            >
                                지금 이동하기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            <div className="title">
                <KeyIcon className="w-8 h-8 inline-block mr-0.5" />
                비밀번호 재설정
            </div>
            <div className="form-area">
                <div className="form-title">
                    사용중인 이메일을 입력해주세요.
                </div>
                <div className="form-content">
                    <TextInput
                        value={email}
                        placeholder="비밀번호를 변경할 이메일을 입력해주세요."
                        onChangeInput={handleChangeEmail}
                        isError={
                            !validateStatus.result && validateStatus.code !== 3
                        }
                        errorMessage={validateStatus.message}
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="submit">
                <FullWidthButton
                    onClick={handleClickSubmitChangeEmail}
                    text="비밀번호 재설정"
                    textColor="text-white"
                    backgroundColor="bg-sky-500"
                    rounded="rounded-md"
                    border=""
                    borderColor=""
                />
            </div>
        </div>
    );
};

export default UserFindPasswordMenu;

import { useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useQuery } from "react-query";

import {
    ClipboardDocumentIcon,
    CheckIcon,
    KeyIcon,
} from "@heroicons/react/24/outline";

import PasswordInput from "@/components/input/passwordInput";
import AlertBox from "@components/alertBox";
import FullWidthButton from "@components/button/fullWidthButton";
import { ValidateResult } from "@components/menus/sharing";

import {
    MessageReturn,
    patchUpdatePasswordWithToken,
} from "@/api/request/requests";

import "./changePassword.css";

const ChangePasswordMenu = () => {
    const [searchParams] = useSearchParams();

    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);
    const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

    const [copyDone, setCopyDone] = useState<boolean>(false);

    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");

    const [passwordInputErrorState, setPasswordInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });
    const [passwordCondfirmInputErrorState, setPasswordConfirmInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const { data, isLoading } = useQuery<MessageReturn | undefined, Error>(
        [password, searchParams.get("token")],
        () => {
            setEnableQuery(false);
            const token = searchParams.get("token");

            if (!token) {
                return;
            }
            return patchUpdatePasswordWithToken({ password, token });
        },
        {
            enabled:
                enableQuery && Boolean(password) && Boolean(passwordConfirm),
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setShowCompleteAlert(true);
                    setTimeout(() => {
                        closeWindow();
                    }, 5 * 1000);
                } else {
                    setShowErrorAlert(true);
                }
            },
        }
    );

    const validatePassword = (): ValidateResult => {
        const inputResult = validatePasswordInput(password);

        if (!inputResult) {
            return inputResult;
        }

        const confirmResult = validatePasswordConfirmInput(passwordConfirm);

        if (!confirmResult) {
            return confirmResult;
        }

        if (password !== passwordConfirm) {
            return {
                code: 3,
                message: "패스워드와 확인이 같지 않습니다.",
                result: false,
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const validatePasswordInput = (input: string): ValidateResult => {
        if (input.length < 8) {
            return {
                code: 2,
                result: false,
                message: "8자 이상의 비밀번호를 사용해주세요.",
            };
        }
        if (input !== passwordConfirm) {
            return {
                code: 1,
                result: false,
                message: "패스워드와 재확인이 같지 않습니다.",
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const validatePasswordConfirmInput = (input: string): ValidateResult => {
        if (input !== password) {
            return {
                code: 1,
                result: false,
                message: "패스워드와 재확인이 같지 않습니다.",
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const checkPasswordAndConfirmPasswordIsSame = (
        input: string,
        compare: string
    ) => {
        if (
            passwordCondfirmInputErrorState.code !== 1 ||
            passwordInputErrorState.code !== 1
        ) {
            return;
        }

        if (input === compare) {
            if (passwordCondfirmInputErrorState.code === 1) {
                setPasswordInputErrorState({
                    code: 0,
                    result: true,
                });
            }
            if (passwordInputErrorState.code === 1) {
                setPasswordConfirmInputErrorState({
                    code: 0,
                    result: true,
                });
            }
        }
    };

    const handleClickClipboardButton = async () => {
        await navigator.clipboard.writeText("m950827@naver.com");

        setCopyDone(true);
        setTimeout(() => {
            setCopyDone(false);
        }, 3 * 1000);
    };

    const handleChangePasswordInput = (input: string) => {
        setPasswordInputErrorState(validatePasswordInput(input));
        checkPasswordAndConfirmPasswordIsSame(input, passwordConfirm);

        setPassword(input);
    };

    const handleChangePasswordConfirmInput = (input: string) => {
        setPasswordConfirmInputErrorState(validatePasswordConfirmInput(input));
        checkPasswordAndConfirmPasswordIsSame(input, password);

        setPasswordConfirm(input);
    };

    const closeWindow = () => {
        window.close();
    };

    const handleClickSubmitChangePassword = () => {
        const inputResult = validatePassword();

        if (!inputResult.result) {
            setPasswordConfirmInputErrorState(inputResult);
            return;
        }

        setEnableQuery(true);
    };

    const closePopup = () => {
        setShowErrorAlert(false);
    };

    const HelpToAdmin = () => {
        return (
            <div className="p-2 mt-1 bg-slate-100 rounded flex flex-col justify-center items-center">
                계속 오류가 발생하면 관리자에게 문의해주세요.
                <br />
                <br />
                <div>
                    관리자 이메일: m950827@naver.com
                    {!copyDone ? (
                        <ClipboardDocumentIcon
                            className="w-4 h-4 ml-1 cursor-pointer inline-block"
                            onClick={handleClickClipboardButton}
                        />
                    ) : (
                        <div className="inline-block ml-1">
                            <CheckIcon className="w-4 h-4 text-green-600 inline-block" />
                            <span className="text-slate-500 text-[0.5rem]">
                                복사됨!
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="full-wrapper">
            {showCompleteAlert && (
                <AlertBox onClickCloseButton={closeWindow}>
                    <div className="alert-box-content">
                        <div className="text">
                            비밀번호 변경이 완료 되었습니다.
                            <br />
                            5초 후 페이지가 닫힙니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={closeWindow}
                            >
                                지금 닫기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            {showErrorAlert && (
                <AlertBox onClickCloseButton={closePopup}>
                    <div className="alert-box-content">
                        <div className="text">
                            만료된 토큰이거나 서버에 오류가 있습니다. 계속
                            문제가 있으면 관리자에게 문의해주세요.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={closeWindow}
                            >
                                창 닫기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            <div className="inner-content">
                <div className="change-password-title">
                    <KeyIcon className="icon" />
                    비밀번호 변경
                </div>
                <div className="inputs-area">
                    <PasswordInput
                        value={password}
                        placeholder="비밀번호를 입력해주세요."
                        onChangeInput={handleChangePasswordInput}
                        isError={
                            !passwordInputErrorState.result &&
                            passwordInputErrorState.code !== 3
                        }
                        errorMessage={passwordInputErrorState.message}
                        disabled={isLoading}
                    />
                    <PasswordInput
                        value={passwordConfirm}
                        placeholder="비밀번호를 재확인해주세요."
                        onChangeInput={handleChangePasswordConfirmInput}
                        isError={
                            !passwordCondfirmInputErrorState.result &&
                            passwordCondfirmInputErrorState.code !== 3
                        }
                        errorMessage={passwordCondfirmInputErrorState.message}
                        disabled={isLoading}
                    />
                </div>

                {HelpToAdmin()}
                <div className="submit">
                    <FullWidthButton
                        onClick={handleClickSubmitChangePassword}
                        text="비밀번호 변경하기"
                        textColor="text-white"
                        backgroundColor="bg-sky-500"
                        rounded="rounded-md"
                        border=""
                        borderColor=""
                    />
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordMenu;

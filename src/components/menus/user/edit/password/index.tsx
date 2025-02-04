import { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import { AuthContext } from "@/App";

import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";

import { KeyIcon } from "@heroicons/react/24/outline";

import PasswordInput from "@components/input/passwordInput";
import FullWidthButton from "@components/button/fullWidthButton";
import Backdrop from "@components/backdrop";
import AlertBox from "@components/alertBox";
import { ValidateResult } from "@components/menus/sharing";

import {
    MessageReturn,
    postCheckCurrentUserPassword,
    patchUpdatePassword,
} from "@/api/request/requests";

import "../userEdit.css";

const UserEditPasswordMenu = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [
        enableCurrentPasswordCheckQuery,
        setEnableCurrentPasswordCheckQuery,
    ] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);
    const [showChangePasswordScreen, setShowChangePasswordScreen] =
        useState<boolean>(false);

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
    const [currentPasswordValidateStatus, setCurrentPasswordValidateStatus] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const {
        data: currentPasswordData,
        isLoading: currentPasswordCheckLoading,
    } = useQuery<MessageReturn | undefined, Error>(
        [currentPassword],
        () => {
            setEnableCurrentPasswordCheckQuery(false);
            return postCheckCurrentUserPassword({
                password: currentPassword,
            });
        },
        {
            enabled:
                enableCurrentPasswordCheckQuery && Boolean(currentPassword),
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setShowChangePasswordScreen(true);
                } else if (response?.error) {
                    setCurrentPasswordValidateStatus({
                        code: 2,
                        result: false,
                        message: response?.error,
                    });
                }
            },
        }
    );

    const { data, isLoading } = useQuery<MessageReturn | undefined, Error>(
        [password, passwordConfirm],
        () => {
            setEnableQuery(false);
            return patchUpdatePassword({ password });
        },
        {
            enabled:
                enableQuery && Boolean(password) && Boolean(passwordConfirm),
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setShowCompleteAlert(true);
                    setTimeout(() => {
                        goToMyPage();
                    }, 5 * 1000);
                } else if (response?.error) {
                    setPasswordConfirmInputErrorState({
                        code: 3,
                        result: false,
                        message: response?.error,
                    });
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

    const handleChangeCurrentPassword = (input: string) => {
        setCurrentPassword(input);
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

    const handleClickSubmitCurrentPassword = () => {
        setEnableCurrentPasswordCheckQuery(true);
    };

    const handleClickSubmitChangePassword = () => {
        const inputResult = validatePassword();

        if (!inputResult.result) {
            setPasswordConfirmInputErrorState(inputResult);
            return;
        }

        setEnableQuery(true);
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

    const handleClickOpenPopup = () => {
        setShowPopup(true);
    };

    const handleClickClosePopup = () => {
        closePopup();
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleClickGoToMyPageNow = () => {
        goToMyPage();
    };

    const goToMyPage = () => {
        navigate("/user/info");
    };

    const handleClickAlertBoxCloseButton = () => {
        setShowCompleteAlert(false);
    };

    return (
        <div className="user-edit-sub-menu">
            {showCompleteAlert && (
                <AlertBox onClickCloseButton={handleClickAlertBoxCloseButton}>
                    <div className="alert-box-content">
                        <div className="text">
                            비밀번호 변경이 완료 되었습니다. 5초 후 마이페이지로
                            이동합니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={handleClickGoToMyPageNow}
                            >
                                지금 이동하기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            <div className="title">
                <KeyIcon className="w-8 h-8 inline-block mr-0.5" />
                비밀번호 변경
            </div>
            {!showChangePasswordScreen ? (
                <div className="form-area">
                    <div className="form-title">
                        현재 비밀번호를 입력해주세요.
                    </div>
                    <div className="form-content">
                        <div className="input-area">
                            <PasswordInput
                                value={currentPassword}
                                placeholder="현재 사용중인 비밀번호를 입력해주세요."
                                onChangeInput={handleChangeCurrentPassword}
                                isError={
                                    !currentPasswordValidateStatus.result &&
                                    currentPasswordValidateStatus.code !== 3
                                }
                                errorMessage={
                                    currentPasswordValidateStatus.message
                                }
                                disabled={currentPasswordCheckLoading}
                            />
                            <div className="submit-temp">
                                <FullWidthButton
                                    onClick={handleClickSubmitCurrentPassword}
                                    text="비밀번호 확인"
                                    textColor="text-black"
                                    backgroundColor="bg-amber-400"
                                    rounded="rounded-md"
                                    border="border"
                                    borderColor="border-black"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="form-area">
                        <div className="form-title">
                            변경할 비밀번호를 입력해주세요.
                            <div className="rule-badge">
                                <div
                                    className="button"
                                    onClick={handleClickOpenPopup}
                                >
                                    <ExclamationCircleIcon className="icon w-4 h-4" />
                                    비밀번호 규칙
                                </div>
                                <div
                                    className={`popup ${
                                        !showPopup && "hidden"
                                    }`}
                                >
                                    <div className="close-button-wapper">
                                        <button onClick={handleClickClosePopup}>
                                            <XMarkIcon className="icon" />
                                        </button>
                                        <ul className="list-disc pl-4">
                                            <li>8자 이상</li>
                                            <li>비밀번호와 재확인이 같을 것</li>
                                        </ul>
                                    </div>
                                </div>
                                {showPopup && (
                                    <Backdrop onClick={handleClickClosePopup} />
                                )}
                            </div>
                        </div>
                        <div className="form-content">
                            <div className="input-area">
                                <PasswordInput
                                    value={password}
                                    placeholder="비밀번호를 입력해주세요."
                                    onChangeInput={handleChangePasswordInput}
                                    isError={
                                        !passwordInputErrorState.result &&
                                        passwordInputErrorState.code !== 3
                                    }
                                    errorMessage={
                                        passwordInputErrorState.message
                                    }
                                    disabled={isLoading}
                                />
                                <PasswordInput
                                    value={passwordConfirm}
                                    placeholder="비밀번호를 재확인해주세요."
                                    onChangeInput={
                                        handleChangePasswordConfirmInput
                                    }
                                    isError={
                                        !passwordCondfirmInputErrorState.result &&
                                        passwordCondfirmInputErrorState.code !==
                                            3
                                    }
                                    errorMessage={
                                        passwordCondfirmInputErrorState.message
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
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
                </>
            )}
        </div>
    );
};

export default UserEditPasswordMenu;

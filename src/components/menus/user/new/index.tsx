import { useState, useRef, useEffect, useContext } from "react";

import { useQuery } from "react-query";

import FullWidthButton from "@components/button/fullWidthButton";
import PasswordInput from "@components/input/passwordInput";
import TextInput from "@components/input/textInput";
import { ValidateResult } from "@components/menus/sharing";
import AlertBox from "@components/alertBox";

import { validateEmailInput } from "@/validates/user/emailInput";

import { PlusIcon, MinusIcon } from "@heroicons/react/16/solid";

import { CheckIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

import {
    postVerifyEmailToken,
    postNewUser,
    User,
    VerifyEmailTokenReturn,
    AddUserReturn,
} from "@/api/request/requests";

import { AuthToken } from "@/api/request/requests";

import { AuthContext } from "@/App";

import { useNavigate } from "react-router-dom";

import io, { Socket } from "socket.io-client";

import ContactAddBox, {
    validateContactInput,
    validateContacts,
} from "@components/user/new/content/contactAddBox";
import SharingInputShareContactsRulePopup from "@components/sharing/input/contacts/rulePopup";

import { CheckboxListItemIdType } from "@components/checkBoxList";
import { CheckBoxListEditItem } from "@components/checkBoxList/editableCheckBoxList";

import "./userNew.css";

const UserNewMenu = () => {
    const navigate = useNavigate();

    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [contacts, setContacts] = useState<string[]>([]);
    const [isConfirmEditVerifiedEmail, setIsConfirmEditVerifiedEmail] =
        useState<boolean>(false);
    const [enableSendVerifyEmail, setEnableSendVerifyEmail] = useState(false);
    const [emailVerifyToken, setEmailVerifyToken] = useState<AuthToken>();
    const [newUserInfo, setNewUserInfo] = useState<User>();
    const [enablePostNewUser, setEnablePostNewUser] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

    const socket = useRef<Socket>();

    const { data, isLoading: addNewUserLoading } = useQuery<
        AddUserReturn | undefined,
        Error
    >(
        [newUserInfo],
        () => {
            setEnablePostNewUser(false);
            return postNewUser(newUserInfo);
        },
        {
            enabled: enablePostNewUser && Boolean(newUserInfo),
            onSettled: (response?: AddUserReturn) => {
                if (!response) {
                    setAddNewUserState({
                        code: 1,
                        message: "응답 데이터가 없습니다.",
                        result: false,
                    });

                    return;
                }

                if (response.success) {
                    window.localStorage.setItem(
                        "auth-token",
                        response.success.token
                    );
                    setUserInfo({
                        isLogined: true,
                        loading: false,
                        ...response.success,
                    });
                    setAddNewUserState({
                        code: 0,
                        result: true,
                    });
                } else if (response.error) {
                    setAddNewUserState({
                        code: 0,
                        message: response.error,
                        result: false,
                    });
                }
            },
        }
    );

    const {
        data: emailVerifyTokenPromise,
        isLoading: sendVerifyEmailTokenLoading,
    } = useQuery<VerifyEmailTokenReturn, Error>(
        [email],
        () => {
            setEnableSendVerifyEmail(false);

            return postVerifyEmailToken(email);
        },
        {
            enabled: enableSendVerifyEmail,
            onSettled: () =>
                setEmailVerifySendState({
                    code: 0,
                    result: true,
                }),
        }
    );

    const [addNewUserState, setAddNewUserState] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });
    const [emailVerifyState, setEmailVerifyState] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });
    const [emailVerifySendState, setEmailVerifySendState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });
    const [submitErrorState, setSubmitErrorState] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });
    const [emailInputErrorState, setEmailInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

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

    const [nicknameInputErrorState, setNicknameConfirmInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const [nameInputErrorState, setNameConfirmInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const [contactsInputErrorState, setContactsInputErrorState] = useState<
        ValidateResult[]
    >([
        {
            code: 3, // 아직 입력 안한 상태
            result: false,
        },
    ]);

    useEffect(() => {
        if (userInfo.isLogined) {
            navigate("/");
        }
    }, []);

    useEffect(() => {
        if (!addNewUserState.result) {
            return;
        }

        setShowCompleteAlert(true);
        setTimeout(() => {
            goToMyPage();
        }, 5 * 1000);
    }, [addNewUserState]);

    useEffect(() => {
        if (!emailVerifyTokenPromise) {
            return;
        }

        setEmailVerifyToken(emailVerifyTokenPromise.token);
    }, [emailVerifyTokenPromise]);

    useEffect(() => {
        if (!emailVerifyToken) {
            return;
        }

        socket.current = io(
            import.meta.env.VITE_APP_SOCKET_URL ?? "ws://localhost/socket:3000",
            {
                withCredentials: true,
                transports: ["websocket"],
                secure: true,
                path: "/socket/socket.io/",
            }
        );

        socket.current.on("connect", () => {
            console.log("connection!");
            socket?.current?.send(emailVerifyToken);
        });

        socket.current.on("message", () => {
            setEmailVerifyState({
                code: 0,
                result: true,
            });
            socket?.current?.close();
        });
    }, [emailVerifyToken]);

    const handleClickSendVerifyMail = () => {
        const validateResult = validateEmailInput(email);

        if (!validateResult.result) {
            setEmailInputErrorState(validateResult);
            return;
        }

        setEnableSendVerifyEmail(true);
    };

    const handleClickEditVerifiedEmail = () => {
        // 인증 완료된 이메일을 수정하려고 할 때 경고창을 띄움
        if (!emailVerifyState.result) {
            return;
        }

        setIsConfirmEditVerifiedEmail(true);
    };

    const handleChangeEmailInput = (input: string) => {
        setEmailInputErrorState(validateEmailInput(input));

        setEmail(input);
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

    const handleChangeNicknameInput = (input: string) => {
        setNicknameConfirmInputErrorState(validateNicknameInput(input));

        setNickname(input);
    };

    const handleChangeNameInput = (input: string) => {
        setNameConfirmInputErrorState(validateNameInput(input));

        setName(input);
    };

    const handleClickCancleVerifyAndEditEmailButton = () => {
        setEmailVerifyState({
            code: 3,
            result: false,
        });
        setEmailVerifySendState({
            code: 3,
            result: false,
        });
        closeConfirmEditWerifiedEmailAlert();
    };

    const handleClickDoNotEditEmailButton = () => {
        closeConfirmEditWerifiedEmailAlert();
    };

    const handleClickSubmitButton = () => {
        const validate = validateAllForm();

        console.log(validate);

        if (!validate.result) {
            setSubmitErrorState(validate);
            return;
        }

        setNewUserInfo({
            email: email,
            password: password,
            nickname: nickname,
            name: name,
            contacts: contacts,
        });
        setEnablePostNewUser(true);
    };

    const handleClickGoToMyPageNow = () => {
        goToMyPage();
    };

    const goToMyPage = () => {
        navigate("/user/info");
    };

    const closeConfirmEditWerifiedEmailAlert = () => {
        setIsConfirmEditVerifiedEmail(false);
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

    const validateAllForm = (): ValidateResult => {
        const emailResult = validateEmail();

        if (!emailResult.result) {
            return {
                code: 1,
                result: false,
                message: emailResult.message,
            };
        }

        const passwordResult = validatePassword();

        if (!passwordResult.result) {
            return {
                code: 2,
                result: false,
                message: passwordResult.message,
            };
        }

        const nicknameResult = validateNickname();

        if (!nicknameResult.result) {
            return {
                code: 3,
                result: false,
                message: nicknameResult.message,
            };
        }

        const nameResult = validateName();

        if (!nameResult.result) {
            return {
                code: 3,
                result: false,
                message: nameResult.message,
            };
        }

        const valiateContactsInputResults = contacts.find(
            (contact) => !validateContactInput(contact).result
        );

        if (valiateContactsInputResults) {
            return {
                code: 3,
                result: false,
                message: "양식에 맞지 않는 연락처가 있습니다.",
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const validateEmail = (): ValidateResult => {
        const inputResult = validateEmailInput(email);

        if (!inputResult.result) {
            return inputResult;
        }
        const verifyResult = emailVerifyState; // 백단에서 값 검사

        if (!verifyResult.result) {
            return verifyResult;
        }

        return {
            code: 0,
            result: true,
        };
    };

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

    const validateNickname = (): ValidateResult => {
        const inputResult = validateNicknameInput(nickname);

        if (!inputResult.result) {
            return inputResult;
        }

        return {
            code: 0,
            result: true,
        };
    };

    const validateName = (): ValidateResult => {
        const inputResult = validateNameInput(nickname);

        if (!inputResult.result) {
            return inputResult;
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

    const validateNicknameInput = (input: string): ValidateResult => {
        if (input.length === 0 || input.length > 10) {
            return {
                code: 2,
                result: false,
                message: "1~10자 사이로 닉네임을 지어주세요.",
            };
        }
        if (!/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9]+$/.test(input)) {
            return {
                code: 2,
                result: false,
                message: "한글, 영문 대소문자, 숫자만 가능합니다.",
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const validateNameInput = (input: string): ValidateResult => {
        if (input.length === 0 || input.length > 10) {
            return {
                code: 2,
                result: false,
                message: "1~10자 사이로 이름을 입력해주세요.",
            };
        }
        if (!/^[가-힣]+$/.test(input)) {
            return {
                code: 2,
                result: false,
                message: "완성된 한글 입력만 가능합니다.",
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    const addNewContact = (newContact: string) => {
        setContacts([...contacts, newContact]);
    };

    const addNewContacts = (newContacts: string[]) => {
        setContacts([...contacts, ...newContacts]);
    };

    const handleDeleteContact = (items: CheckBoxListEditItem[]) => {
        const tags = items.map((item) => item.text);
        setContacts(contacts.filter((contact) => !tags.includes(contact)));
    };

    const handleEditContact = (
        item: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => {
        setContacts(
            contacts.map((contact, idx) => (id !== idx ? contact : item.text))
        );
    };

    const handleResetContact = (ids?: CheckboxListItemIdType[]) => {
        if (ids) {
            setContacts(contacts.filter((_, idx) => !ids.includes(idx)));
        } else {
            setContacts([]);
        }
    };

    const handleClickEmailConfirmAlertBoxCloseButton = () => {
        setIsConfirmEditVerifiedEmail(false);
    };

    const handleClickAlertBoxCloseButton = () => {
        setShowCompleteAlert(false);
    };

    return (
        <div className="user-new">
            {isConfirmEditVerifiedEmail && (
                <AlertBox
                    onClickCloseButton={
                        handleClickEmailConfirmAlertBoxCloseButton
                    }
                >
                    <div className="alert-box-content">
                        <div className="text">
                            이미 인증된 이메일을 수정하려면 인증 과정을 다시
                            거쳐야 합니다. 그래도 수정하시겠습니까?
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-sky-500 text-white"
                                onClick={
                                    handleClickCancleVerifyAndEditEmailButton
                                }
                            >
                                수정하기
                            </button>
                            <button
                                className="bg-amber-400"
                                onClick={handleClickDoNotEditEmailButton}
                            >
                                돌아가기
                            </button>
                        </div>
                    </div>
                </AlertBox>
            )}
            {showCompleteAlert && (
                <AlertBox onClickCloseButton={handleClickAlertBoxCloseButton}>
                    <div className="alert-box-content">
                        <div className="text">
                            회원가입이 완료되었습니다. 5초 후 마이페이지로
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
            <div className="line">
                <div className="title">
                    이메일<span className="required">*</span>
                </div>
                <div className="input-content">
                    <div className="input-area">
                        <TextInput
                            value={email}
                            placeholder="이메일을 입력해주세요."
                            onChangeInput={handleChangeEmailInput}
                            isError={
                                !emailInputErrorState.result &&
                                emailInputErrorState.code !== 3
                            }
                            errorMessage={emailInputErrorState.message}
                            disabled={emailVerifyState.result}
                        />
                    </div>
                    <div className="auth-area">
                        {!emailVerifyState.result ? (
                            !emailVerifySendState.result ? (
                                <button
                                    className="mail"
                                    onClick={handleClickSendVerifyMail}
                                    disabled={sendVerifyEmailTokenLoading}
                                >
                                    {!sendVerifyEmailTokenLoading
                                        ? "메일 전송"
                                        : "전송중"}
                                </button>
                            ) : (
                                <button
                                    className="mail-done"
                                    onClick={handleClickSendVerifyMail}
                                    disabled={sendVerifyEmailTokenLoading}
                                >
                                    {!sendVerifyEmailTokenLoading
                                        ? "전송 완료"
                                        : "전송중"}
                                </button>
                            )
                        ) : (
                            <button
                                className="edit"
                                onClick={handleClickEditVerifiedEmail}
                            >
                                메일 수정
                            </button>
                        )}
                        {!emailVerifyState.result &&
                        !emailVerifySendState.result ? (
                            <>버튼을 눌러 인증메일을 전송해주세요.</>
                        ) : emailVerifySendState.result &&
                          !emailVerifyState.result ? (
                            <>
                                인증 메일이 전송되었어요.
                                <button className="text-xs inline-flex items-center ml-2 bg-slate-200 rounded px-1 py-0.5">
                                    인증 확인하기
                                    <CheckBadgeIcon className="ml-1 w-4 h-4 inline-block" />
                                </button>
                            </>
                        ) : (
                            <span>
                                인증이 완료되었어요.
                                <CheckIcon className="w-4 h-4 text-green-600 ml-1 inline-block" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="line">
                <div className="title">
                    비밀번호<span className="required">*</span>
                </div>
                <div className="input-content">
                    <div className="input-area">
                        <PasswordInput
                            value={password}
                            placeholder="8자 이상의 비밀번호 입력"
                            onChangeInput={handleChangePasswordInput}
                            isError={
                                !passwordInputErrorState.result &&
                                passwordInputErrorState.code !== 3
                            }
                            errorMessage={passwordInputErrorState.message}
                        />
                        <PasswordInput
                            value={passwordConfirm}
                            placeholder="비밀번호 재입력"
                            onChangeInput={handleChangePasswordConfirmInput}
                            isError={
                                !passwordCondfirmInputErrorState.result &&
                                passwordCondfirmInputErrorState.code !== 3
                            }
                            errorMessage={
                                passwordCondfirmInputErrorState.message
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="line">
                <div className="title">
                    닉네임<span className="required">*</span>
                </div>
                <div className="input-content">
                    <div className="input-area">
                        <TextInput
                            value={nickname}
                            placeholder="10자 이하, 한글, 영문 대소문자, 숫자 가능"
                            onChangeInput={handleChangeNicknameInput}
                            isError={
                                !nicknameInputErrorState.result &&
                                nicknameInputErrorState.code !== 3
                            }
                            errorMessage={nicknameInputErrorState.message}
                        />
                    </div>
                </div>
            </div>
            <div className="line">
                <div className="title">
                    실명<span className="required">*</span>
                </div>
                <div className="input-content">
                    <div className="input-area">
                        <TextInput
                            value={name}
                            placeholder="실명을 입력해주세요."
                            onChangeInput={handleChangeNameInput}
                            isError={
                                !nameInputErrorState.result &&
                                nameInputErrorState.code !== 3
                            }
                            errorMessage={nameInputErrorState.message}
                        />
                    </div>
                </div>
            </div>
            <div className="line">
                <div className="title">
                    연락처 <SharingInputShareContactsRulePopup />
                </div>
                <ContactAddBox
                    contacts={contacts}
                    addNewContact={addNewContact}
                    addNewContacts={addNewContacts}
                    handleDeleteContact={handleDeleteContact}
                    handleEditContact={handleEditContact}
                    handleResetContact={handleResetContact}
                />
            </div>

            <div className="submit">
                <FullWidthButton
                    onClick={handleClickSubmitButton}
                    text="가입하기"
                    textColor="text-black"
                    backgroundColor="bg-amber-400"
                    rounded="rounded-md"
                    border="border"
                    borderColor="border-black"
                    disabled={addNewUserLoading}
                />
            </div>
        </div>
    );
};

export default UserNewMenu;

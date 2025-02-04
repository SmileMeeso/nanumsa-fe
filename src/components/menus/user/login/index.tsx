import { useState, KeyboardEvent, useEffect, useContext, useRef } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useQuery } from "react-query";

import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithRedirect,
    signInWithPopup,
    GoogleAuthProvider,
    OAuthProvider,
    getRedirectResult,
    signOut,
} from "firebase/auth";
import firebase from "firebase/app";

import {
    postEmailLogin,
    AddUserReturn,
    SocialUser,
    postNewSocialUser,
    AddUserReturnSuccess,
    UserToken,
} from "@/api/request/requests";

import urls, { endPoint } from "@/api/request/urls";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "@/App";

import TextInput from "@components/input/textInput";
import PasswordInput from "@components/input/passwordInput";
import FullWidthButton from "@components/button/fullWidthButton";
import IconButton from "@components/button/iconButton";

import { ValidateResult } from "@components/menus/sharing";

const UserLoginMenu = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [emailInput, setEmailInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");

    const [socialUserInfo, setSocialUserInfo] = useState<SocialUser | null>(
        null
    );

    const [enablePostLogin, setEnablePostLogin] = useState<boolean>(false);
    const [enablePostSocialLogin, setEnablePostSocialLogin] =
        useState<boolean>(false);
    const [isLoginError, setIsLoginError] = useState<boolean>(false);

    const [isCheckRemainLoginState, setIsCheckRemainLoginState] =
        useState<boolean>(true);

    const firebaseApp = useRef<firebase.FirebaseApp>();
    const naverLogin = useRef();

    const { data: loginData, isLoading } = useQuery<
        AddUserReturn | undefined,
        Error
    >(
        [emailInput, passwordInput],
        () => {
            setEnablePostLogin(false);
            return postEmailLogin(emailInput, passwordInput);
        },
        {
            enabled:
                enablePostLogin &&
                Boolean(emailInput) &&
                Boolean(passwordInput),
            onSuccess: (loginData?: AddUserReturn) => {
                if (loginData?.success) {
                    setIsLoginError(false);
                    window.localStorage.setItem(
                        "auth-token",
                        loginData.success.token
                    );

                    if (isCheckRemainLoginState) {
                        remainLogin(loginData.success.token);
                    }

                    setUserInfo({
                        ...userInfo,
                        ...loginData.success,
                        isLogined: true,
                    });
                } else if (loginData?.error) {
                    setIsLoginError(true);
                }
            },
        }
    );

    const { data: socialLoginResponse, isLoading: sendSocialLoginLoading } =
        useQuery<AddUserReturn | undefined, Error>(
            [JSON.stringify(socialUserInfo)],
            () => {
                setEnablePostSocialLogin(false);

                if (socialUserInfo === null) {
                    return;
                }

                return postNewSocialUser(socialUserInfo);
            },
            {
                enabled: socialUserInfo !== null && enablePostSocialLogin,
                onSettled: (res) => {
                    if (res?.success) {
                        remainLogin(res.success.token);
                        setUserInfo({
                            ...userInfo,
                            ...res?.success,
                            isLogined: true,
                        });
                    }
                },
            }
        );

    useEffect(() => {
        makeLoginWithNaverButton();
        initializeFirebaseAppAndCheckRedirection();

        window.successLoginWithNaver = successLoginWithNaver;
        window.successLoginWithKakao = successLoginWithKakao;
    }, []);

    useEffect(() => {
        if (!userInfo.isLogined) {
            return;
        }
        goToLoginCallbackPage();
    }, [userInfo]);

    const initializeFirebaseAppAndCheckRedirection = async () => {
        const secret_name = "candleHelper/authToken/firebase";

        const client = new SecretsManagerClient({
            region: "ap-northeast-2",
            profile: "candle_helper",
            credentials: {
                accessKeyId: import.meta.env.VITE_APP_ACCESS_KEY_ID as string,
                secretAccessKey: import.meta.env
                    .VITE_APP_SECRET_ACCESS_KEY as string,
            },
        });

        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT",
            })
        );

        const secretString = response.SecretString
            ? JSON.parse(response.SecretString)
            : {};

        firebaseApp.current = initializeApp(secretString);
    };

    const loginWithGoogle = () => {
        if (!firebaseApp?.current) {
            return;
        }

        const provider = new GoogleAuthProvider();
        const auth = getAuth(firebaseApp.current);
        auth.languageCode = "ko";

        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;

                setEnablePostSocialLogin(true);
                setSocialUserInfo({
                    email: user.email ?? "",
                    social_type: 1,
                    social_uid: user.uid,
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential =
                    GoogleAuthProvider.credentialFromError(error);

                console.log(errorCode, errorMessage, email, credential);
            });
    };

    const loginWithApple = () => {
        if (!firebaseApp?.current) {
            return;
        }

        const provider = new OAuthProvider("apple.com");
        provider.addScope("email");

        provider.setCustomParameters({
            locale: "ko",
        });

        const auth = getAuth(firebaseApp?.current);
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;

                setEnablePostSocialLogin(true);
                setSocialUserInfo({
                    email: user.email ?? "",
                    social_type: 3,
                    social_uid: user.uid,
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = OAuthProvider.credentialFromError(error);

                console.log(errorCode, errorMessage, email, credential);
            });
    };

    const makeLoginWithNaverButton = async () => {
        const secret_name = "candleHelper/Auth/LoginWithNaver";

        const client = new SecretsManagerClient({
            region: "ap-northeast-2",
            profile: "candle_helper",
            credentials: {
                accessKeyId: import.meta.env.VITE_APP_ACCESS_KEY_ID as string,
                secretAccessKey: import.meta.env
                    .VITE_APP_SECRET_ACCESS_KEY as string,
            },
        });

        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT",
            })
        );

        const secretString = response.SecretString
            ? JSON.parse(response.SecretString)
            : {};

        naverLogin.current = new window.naver_id_login(
            secretString.id,
            "http://localhost:5173/verify/naver"
        );
        (
            naverLogin?.current as unknown as {
                setDomain: (url: string) => void;
            }
        )?.setDomain("http://localhost:5173/");
        (
            naverLogin?.current as unknown as {
                setButton: (color: string, n1: number, n2: number) => void;
            }
        )?.setButton("green", 1, 40);
        const state = (
            naverLogin?.current as unknown as {
                getUniqState: () => string;
            }
        )?.getUniqState();
        (
            naverLogin?.current as unknown as {
                setState: (state: string) => void;
            }
        )?.setState(state);
        (
            naverLogin?.current as unknown as {
                setPopup: () => void;
            }
        )?.setPopup();

        (
            naverLogin?.current as unknown as {
                init_naver_id_login: () => void;
            }
        )?.init_naver_id_login();
    };

    const successLoginWithNaver = (authInfo: AddUserReturnSuccess) => {
        remainLogin(authInfo.token);
        setUserInfo({
            ...userInfo,
            ...authInfo,
            isSocial: true,
            isLogined: true,
        });
    };

    const loginWithKakao = async () => {
        const secret_name = "candleHelper/auth/loginWithKakao";

        const client = new SecretsManagerClient({
            region: "ap-northeast-2",
            profile: "candle_helper",
            credentials: {
                accessKeyId: import.meta.env.VITE_APP_ACCESS_KEY_ID as string,
                secretAccessKey: import.meta.env
                    .VITE_APP_SECRET_ACCESS_KEY as string,
            },
        });

        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT",
            })
        );

        const secretString = response.SecretString
            ? JSON.parse(response.SecretString)
            : {};

        const redirectUrl = "http://localhost:5173/verify/kakao";

        window.open(
            `https://kauth.kakao.com/oauth/authorize?client_id=${secretString.token}&redirect_uri=${redirectUrl}&response_type=code`,
            "_blank",
            "width=400,height=700"
        );
    };

    const successLoginWithKakao = (authInfo: AddUserReturnSuccess) => {
        remainLogin(authInfo.token);
        setUserInfo({
            ...userInfo,
            ...authInfo,
            isSocial: true,
            isLogined: true,
        });
    };

    const handleChangeEmailInput = (input: string) => {
        setEmailInput(input);
    };

    const handleChangePasswordInput = (input: string) => {
        setPasswordInput(input);
    };

    const handleKeyDownPasswordInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key !== "Enter") {
            return;
        }

        postEmailLogin(emailInput, passwordInput);
    };

    const handleClickEmailLoginButton = () => {
        setEnablePostLogin(true);
    };

    const handleChangeRemainLoginStateCheckBox = () => {
        setIsCheckRemainLoginState(!isCheckRemainLoginState);
    };

    const handleClickRegisterButton = () => {
        navigate("/user/new");
    };

    const handleClickFindPasswordButton = () => {
        navigate("/user/find/password");
    };

    const remainLogin = (token: UserToken) => {
        window.localStorage.setItem("remain-login", "true");
        window.localStorage.setItem("auth-token", token);
    };

    const goToLoginCallbackPage = () => {
        const prevPath = searchParams.get("prev_path");
        if (prevPath) {
            navigate(prevPath);
            return;
        }
        navigate("/user/info");
    };

    return (
        <div>
            <div className="flex gap-y-2 flex-col">
                <TextInput
                    value={emailInput}
                    onChangeInput={handleChangeEmailInput}
                    placeholder="이메일을 입력해주세요."
                />
                <PasswordInput
                    value={passwordInput}
                    onChangeInput={handleChangePasswordInput}
                    onKeyDownInput={handleKeyDownPasswordInput}
                    placeholder="비밀번호를 입력해주세요."
                />
                {isLoginError && (
                    <div className="flex flex-row gap-x-0.5 items-center text-red-500">
                        <ExclamationCircleIcon className="w-4 h-4 text-red-500" />{" "}
                        이메일이나 비밀번호가 틀립니다.
                    </div>
                )}
            </div>
            <div className="flex items-center mt-2">
                <input
                    className="mr-1"
                    type="checkbox"
                    id="user-login-check-remain-login-state"
                    checked={isCheckRemainLoginState}
                    onChange={handleChangeRemainLoginStateCheckBox}
                />
                <label
                    className="cursor-pointer"
                    htmlFor="user-login-check-remain-login-state"
                >
                    로그인 상태 유지
                </label>
            </div>
            <div className="mt-6">
                <FullWidthButton
                    onClick={handleClickEmailLoginButton}
                    text="로그인"
                    textColor="text-slate-900"
                    backgroundColor="bg-amber-400"
                    rounded="rounded-md"
                    border=""
                    borderColor=""
                />
            </div>
            <hr className="my-3" />
            <div className="mt-4 flex flex-col items-center">
                <div className="text-center">
                    <b>소셜 계정으로 로그인하기</b>
                </div>
                <div className="mt-4 [&_.icon-button]:inline-block [&_.icon-button]:mr-4 [&_.icon-button:last-child]:mr-0">
                    <IconButton
                        onClick={loginWithGoogle}
                        icon={
                            <img
                                className="h-6"
                                src="/auth/google.png"
                                alt="google-login"
                            />
                        }
                        backgroundColor="bg-white"
                        rounded="rounded-md"
                        border="border"
                        borderColor="border-slate-200"
                        disabled={isLoading}
                    />
                    <IconButton
                        onClick={loginWithApple}
                        icon={
                            <img
                                className="h-6"
                                src="/auth/apple.svg"
                                alt="apple-login"
                            />
                        }
                        backgroundColor="bg-white"
                        rounded="rounded-md"
                        border="border"
                        borderColor="border-black"
                    />
                    <div id="naver_id_login" className="icon-button"></div>
                    <IconButton
                        onClick={loginWithKakao}
                        icon={
                            <img
                                className="h-10"
                                src="/auth/kakao.png"
                                alt="kakao-login"
                            />
                        }
                        backgroundColor="bg-[#FEE500]"
                        rounded="rounded-md"
                        border=""
                        borderColor=""
                    />
                </div>
                <div className="mt-2 text-xs align-middle text-center text-slate-600">
                    <div
                        className="cursor-pointer inline-block"
                        onClick={handleClickFindPasswordButton}
                    >
                        비밀번호를 잊으셨나요?
                    </div>
                    <span className="mx-1">|</span>
                    <div
                        className="cursor-pointer inline-block"
                        onClick={handleClickRegisterButton}
                    >
                        회원가입을 원하시나요?
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLoginMenu;

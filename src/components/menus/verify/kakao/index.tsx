import { useEffect, useRef, useState } from "react";

import { useQuery } from "react-query";

import {
    SocialUser,
    postNewSocialUser,
    AddUserReturn,
} from "@/api/request/requests";

import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const VerifyKakaoMenu = () => {
    const [enablePostNewUser, setEnablePostNewUser] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<SocialUser | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>();

    const { data, isLoading } = useQuery<AddUserReturn | undefined, Error>(
        [userInfo],
        () => {
            if (userInfo === null) {
                return;
            }

            setEnablePostNewUser(false);
            return postNewSocialUser(userInfo);
        },
        {
            enabled: enablePostNewUser && Boolean(userInfo),
            onSuccess: (response?: AddUserReturn) => {
                if (response?.success) {
                    window.opener.successLoginWithKakao(response?.success);
                    window.close();
                } else if (response?.error) {
                    setErrorMessage(response?.error);
                }
            },
        }
    );

    useEffect(() => {
        getKakaoUserInfo();
    }, []);

    const getKakaoUserInfo = async () => {
        const secret_name = "candleHelper/authToken/searchAddressToPoint";

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

        const redirectUrl = "http://localhost:5173/verify/kakao";

        const secretString = response.SecretString
            ? JSON.parse(response.SecretString)
            : {};

        const params = new URL(document.location.toString()).searchParams;
        const code = params.get("code");

        const tokenResponse = await fetch(
            `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${secretString.token}&redirect_uri=${redirectUrl}&code=${code}`,
            {
                method: "POST",
                headers: {
                    "Content-type":
                        "application/x-www-form-urlencoded;charset=utf-8",
                },
                body: JSON.stringify(data),
            }
        );

        const tokenInfo = await tokenResponse.json();

        const userInfoResponse = await fetch(
            `https://kapi.kakao.com/v2/user/me`,
            {
                headers: {
                    Authorization: `Bearer ${tokenInfo.access_token}`,
                    "Content-type":
                        "application/x-www-form-urlencoded;charset=utf-8",
                },
            }
        );

        const userInfo = await userInfoResponse.json();

        setUserInfo({
            social_type: 4,
            kakao_user_id: userInfo.id,
        });
        setEnablePostNewUser(true);
    };

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex justify-center items-center flex-col text-center">
                {!errorMessage
                    ? "인증중입니다. 잠시만 기다려주세요."
                    : errorMessage}
            </div>
        </div>
    );
};

export default VerifyKakaoMenu;

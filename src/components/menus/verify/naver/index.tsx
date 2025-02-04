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

const VerifyNaverMenu = () => {
    const [enablePostNewUser, setEnablePostNewUser] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<SocialUser | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>();

    const naverLogin = useRef();

    const { data, isLoading } = useQuery<AddUserReturn | undefined, Error>(
        [userInfo],
        () => {
            if (userInfo === null) {
                return;
            }
            console.log(userInfo);

            setEnablePostNewUser(false);
            return postNewSocialUser(userInfo);
        },
        {
            enabled: enablePostNewUser && Boolean(userInfo),
            onSuccess: (response?: AddUserReturn) => {
                if (response?.success) {
                    window.opener.successLoginWithNaver(response?.success);
                    window.close();
                } else if (response?.error) {
                    setErrorMessage(response?.error);
                }
            },
        }
    );

    useEffect(() => {
        makeNaverLoginSession();

        window.callbackLoginWithNaver = callbackLoginWithNaver;
    }, []);

    const makeNaverLoginSession = async () => {
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
                get_naver_userprofile: (functionName: string) => void;
            }
        )?.get_naver_userprofile("callbackLoginWithNaver()");
    };

    const callbackLoginWithNaver = () => {
        setUserInfo({
            social_type: 5,
            naver_client_id: (
                naverLogin?.current as unknown as {
                    client_id: string;
                }
            ).client_id,
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

export default VerifyNaverMenu;

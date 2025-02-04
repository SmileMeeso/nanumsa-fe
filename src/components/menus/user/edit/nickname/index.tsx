import { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import { AuthContext } from "@/App";

import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/16/solid";

import { FaceSmileIcon } from "@heroicons/react/24/outline";

import TextInput from "@components/input/textInput";
import FullWidthButton from "@components/button/fullWidthButton";
import Backdrop from "@components/backdrop";
import AlertBox from "@components/alertBox";
import { ValidateResult } from "@components/menus/sharing";

import { MessageReturn, patchUpdateNickname } from "@/api/request/requests";

import "../userEdit.css";

const UserEditNicknameMenu = () => {
    const navigate = useNavigate();

    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [nickname, setNickname] = useState<string>(userInfo.nickname);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

    const [validateStatus, setValidateStatus] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });

    console.log(userInfo);

    const { data, isLoading } = useQuery<MessageReturn | undefined, Error>(
        [nickname],
        () => {
            setEnableQuery(false);
            return patchUpdateNickname(nickname);
        },
        {
            enabled: enableQuery && Boolean(nickname),
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setUserInfo({
                        ...userInfo,
                        nickname,
                    });
                    setShowCompleteAlert(true);
                    setTimeout(() => {
                        goToMyPage();
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

    const handleChangeNickname = (input: string) => {
        const result = validateNicknameInput(input);

        setNickname(input);
        setValidateStatus(result);
    };

    const handleClickSubmitChangeNickname = () => {
        const inputResult = validateNicknameInput(nickname);

        if (!inputResult.result) {
            setValidateStatus(inputResult);
            return;
        }

        setEnableQuery(true);
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

    return (
        <div className="user-edit-sub-menu">
            {showCompleteAlert && (
                <AlertBox onClickCloseButton={handleClickGoToMyPageNow}>
                    <div className="alert-box-content">
                        <div className="text">
                            닉네임 변경이 완료 되었습니다. 5초 후 마이페이지로
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
                <FaceSmileIcon className="w-8 h-8 inline-block mr-0.5" />
                닉네임 변경
            </div>
            <div className="form-area">
                <div className="form-title">
                    변경할 닉네임을 입력해주세요.
                    <div className="rule-badge">
                        <div className="button" onClick={handleClickOpenPopup}>
                            <ExclamationCircleIcon className="icon w-4 h-4" />
                            작명 규칙
                        </div>
                        <div className={`popup ${!showPopup && "hidden"}`}>
                            <div className="close-button-wapper">
                                <button onClick={handleClickClosePopup}>
                                    <XMarkIcon className="icon" />
                                </button>
                                <ul className="list-disc pl-4">
                                    <li>1~10자 사이</li>
                                    <li>한글, 영문 대소문자, 숫자</li>
                                </ul>
                            </div>
                        </div>
                        {showPopup && (
                            <Backdrop onClick={handleClickClosePopup} />
                        )}
                    </div>
                </div>
                <div className="form-content">
                    <div>변경 전 닉네임: {userInfo.nickname}</div>
                    <div className="input-area">
                        <TextInput
                            value={nickname}
                            placeholder="변경할 닉네임을 입력해주세요."
                            onChangeInput={handleChangeNickname}
                            isError={
                                !validateStatus.result &&
                                validateStatus.code !== 3
                            }
                            errorMessage={validateStatus.message}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
            <div className="submit">
                <FullWidthButton
                    onClick={handleClickSubmitChangeNickname}
                    text="닉네임 변경하기"
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

export default UserEditNicknameMenu;

import { useState, useContext, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useQuery } from "react-query";

import { AuthContext } from "@/App";

import {
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
} from "@heroicons/react/16/solid";

import { PhoneIcon } from "@heroicons/react/24/outline";

import FullWidthButton from "@components/button/fullWidthButton";
import Backdrop from "@components/backdrop";
import AlertBox from "@components/alertBox";
import { ValidateResult } from "@components/menus/sharing";

import ContactAddBox from "@components/user/new/content/contactAddBox";

import { CheckboxListItemIdType } from "@components/checkBoxList";
import { CheckBoxListEditItem } from "@components/checkBoxList/editableCheckBoxList";
import SharingInputShareContactsRulePopup from "@/components/sharing/input/contacts/rulePopup";

import {
    MessageReturn,
    GetContactsReturn,
    getContacts,
    patchUpdateContacts,
} from "@/api/request/requests";

import "../userEdit.css";

export type ContectType = string;

const UserEditContactMenu = () => {
    const navigate = useNavigate();

    const { userInfo } = useContext(AuthContext);

    const [contacts, setContacts] = useState<ContectType[]>([]);
    const [contactsForEdit, setContactsForEdit] = useState<ContectType[]>([]);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [enableQuery, setEnableQuery] = useState<boolean>(false);
    const [enableGetContactQuery, setEnableGetContactQuery] =
        useState<boolean>(false);
    const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

    const [validateStatus, setValidateStatus] = useState<ValidateResult>({
        code: 3, // 아직 입력 안한 상태
        result: false,
    });
    const [showEditCompleteError, setShowEditCompleteError] =
        useState<boolean>(false);
    const [showContactValidationError, setShowContactValidationError] =
        useState<number | null>(null);

    const [cancelMypageTimeout, setCancelMypageTimeout] = useState<boolean>();

    const { data: contactData, isLoading: loadingGetContactData } = useQuery<
        GetContactsReturn | undefined,
        Error
    >(
        [`get-contact-data`],
        () => {
            setEnableGetContactQuery(false);
            return getContacts();
        },
        {
            enabled: enableGetContactQuery,
            onSuccess: (response?: GetContactsReturn) => {
                if (
                    response?.success?.contacts &&
                    typeof response?.success.contacts === "string"
                ) {
                    setContacts(response?.success.contacts.split(","));
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

    const { data, isLoading: loadingSaveContacts } = useQuery<
        MessageReturn | undefined,
        Error
    >(
        [contacts],
        () => {
            setEnableQuery(false);
            return patchUpdateContacts({
                token: userInfo.token,
                contacts: makeContactRequestData(),
            });
        },
        {
            enabled: enableQuery,
            onSuccess: (response?: MessageReturn) => {
                if (response?.success) {
                    setShowCompleteAlert(true);
                    setCancelMypageTimeout(false);
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
        setEnableGetContactQuery(true);
    }, []);

    useEffect(() => {
        if (!data || cancelMypageTimeout) {
            setShowCompleteAlert(false);
            return;
        }

        const timeout = setTimeout(() => {
            goToMyPage();
        }, 5 * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [cancelMypageTimeout]);

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

    const handleClickStay = () => {
        setCancelMypageTimeout(true);
    };

    const goToMyPage = () => {
        navigate("/user/info");
    };

    const makeContactRequestData = () => {
        return contacts.join(",");
    };

    const handleClickSubmitChangeContacts = () => {
        const result = validateContact();

        if (result) {
            setEnableQuery(true);
        }
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

    const validateContact = () => {
        // 수정이 모두 완료되었는가
        const find = contactsForEdit.find(
            (contact) => typeof contact !== "string"
        );

        if (find) {
            setShowEditCompleteError(true);
            return false;
        }

        // 모든 저장된 데이터가 포맷을 만족하는가
        const result = contacts.find((contact, idx) => {
            if (typeof contact !== "string") {
                return false;
            }

            const returnValue = validateContactInput(contact).result;

            if (!returnValue) {
                setShowContactValidationError(idx);
            }

            return !returnValue;
        });

        if (result) {
            return false;
        }

        setShowEditCompleteError(false);
        setShowContactValidationError(null);
        return true;
    };

    const validateContactInput = (input: string): ValidateResult => {
        // 초기값
        if (input === "") {
            return {
                code: 3,
                result: false,
            };
        }

        // 조건 1: 문자열 길이는 1~20글자 사이
        if (input.length < 1 || input.length > 20) {
            return {
                code: 1,
                message: "1~20글자 사이의 이름만 사용할 수 있습니다.",
                result: false,
            };
        }

        // 조건 2: 한글, 영문 대소문자, 숫자, 띄어쓰기, []:#@_- 만 사용
        const validChars = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣0-9a-zA-Z#@:[\]_-\s]+$/;

        if (!validChars.test(input)) {
            return {
                code: 2,
                message:
                    "한글, 영문 대소문자, 숫자, 띄어쓰기, 특수문자[]#@-_ 만 사용 만 사용할 수 있습니다.",
                result: false,
            };
        }

        return {
            code: 0,
            result: true,
        };
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
                            연락처 변경이 완료 되었습니다. 5초 후 마이페이지로
                            이동합니다.
                        </div>
                        <div className="buttons">
                            <button
                                className="bg-amber-400 text-black mr-1"
                                onClick={handleClickStay}
                            >
                                페이지에 남기
                            </button>
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
                <PhoneIcon className="w-8 h-8 inline-block mr-0.5" />
                연락처 변경
            </div>
            <div className="form-area">
                <div className="form-title">
                    사용 가능한 연락처를 기재해주세요.
                    <SharingInputShareContactsRulePopup />
                </div>
                <div className="form-content">
                    <div className="input-area">
                        <ContactAddBox
                            contacts={contacts}
                            addNewContact={addNewContact}
                            addNewContacts={addNewContacts}
                            handleDeleteContact={handleDeleteContact}
                            handleEditContact={handleEditContact}
                            handleResetContact={handleResetContact}
                        />
                    </div>
                    <div className="flex items-center text-red-500 text-xs">
                        {showEditCompleteError && (
                            <>
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                연락처 목록의 모든 편집을 완료한 후에 다시
                                저장을 시도해주세요.
                            </>
                        )}
                        {showContactValidationError !== null && (
                            <>
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                {showContactValidationError}번째 열의 연락처
                                데이터에 오류가 있습니다.
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="submit">
                <FullWidthButton
                    onClick={handleClickSubmitChangeContacts}
                    text="연락처 저장하기"
                    textColor="text-white"
                    backgroundColor="bg-sky-500"
                    rounded="rounded-md"
                    border=""
                    borderColor=""
                    disabled={loadingGetContactData || loadingSaveContacts}
                />
            </div>
        </div>
    );
};

export default UserEditContactMenu;

import { useState, KeyboardEvent } from "react";

import { useQuery } from "react-query";

import TextInput from "@components/input/textInput";
import EditableCheckBoxList from "@components/checkBoxList/editableCheckBoxList";

import { ValidateResult, ShareInfoContact } from "@components/menus/sharing";
import { CheckBoxListEditItem } from "@components/checkBoxList/editableCheckBoxList";
import { CheckboxListItemIdType } from "@components/checkBoxList";

import { PlusIcon } from "@heroicons/react/16/solid";

import {
    GetContactsReturn,
    getContacts,
    ReturnWith,
} from "@/api/request/requests";

export const validateContacts = (contacts: ShareInfoContact[]) => {
    if (contacts.length === 0) {
        return {
            code: 1,
            message: "연락처는 1개 이상이어야 합니다.",
            result: false,
        };
    }

    const niddle = contacts.find((contact) => typeof contact !== "string");

    if (niddle) {
        return {
            code: 1,
            message: "수정중인 연락처가 없어야합니다.",
            result: false,
        };
    }

    const result = contacts.find((contact, idx) => {
        if (typeof contact !== "string") {
            return false;
        }

        const returnValue = validateContactInput(contact).result;

        return returnValue;
    });

    if (!result) {
        return {
            code: 1,
            message: "양식에 맞지 않는 연락처가 있습니다.",
            result: false,
        };
    }

    return {
        code: 0,
        result: true,
    };
};

export const validateContactInput = (input: string): ValidateResult => {
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
            message: "1~20글자 사이의 글자수를 사용해주세요.",
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

interface ShareInputContactsContentProps {
    contacts: ShareInfoContact[];
    addNewContact: (newContact: ShareInfoContact) => void;
    addNewContacts: (newContact: ShareInfoContact[]) => void;
    handleDeleteContact: (items: CheckBoxListEditItem[]) => void;
    handleEditContact: (
        item: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => void;
    handleResetContact: (ids?: CheckboxListItemIdType[]) => void;
}

const ShareInputContactsContent = ({
    contacts,
    addNewContact,
    addNewContacts,
    handleDeleteContact,
    handleEditContact,
    handleResetContact,
}: ShareInputContactsContentProps) => {
    const [contactInput, setContactInput] = useState<ShareInfoContact>("");

    const [enableGetContactQuery, setEnableGetContactQuery] =
        useState<boolean>(false);

    const [contactInputErrorState, setContactInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

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
                    addNewContacts(response.success.contacts.split(","));
                }
            },
        }
    );

    const handleChangeContactInput = (input: string) => {
        const result = validateContactInput(input);

        if (!result.result) {
            setContactInputErrorState(result);
        }
        setContactInput(input);
    };

    const handleKeydownContactInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.nativeEvent.isComposing) {
            return;
        }
        if (event.key !== "Enter") {
            return;
        }
        const result = validateContactInput(contactInput);

        if (!result.result) {
            setContactInputErrorState(result);
            return;
        }

        addNewContact(contactInput);
        setContactInput("");
    };

    const handleClickAddContactButton = () => {
        const result = validateContactInput(contactInput);

        if (!result.result) {
            setContactInputErrorState(result);
            return;
        }

        addNewContact(contactInput);
        setContactInput("");
    };

    const handleClickGetContacts = () => {
        setEnableGetContactQuery(true);
    };

    return (
        <>
            <div className="form-content">
                <div className="input-area">
                    <div className="input-with-button">
                        <TextInput
                            value={contactInput}
                            placeholder="연락처를 입력해주세요."
                            onChangeInput={handleChangeContactInput}
                            onKeyDownInput={handleKeydownContactInput}
                            isError={
                                !contactInputErrorState.result &&
                                contactInputErrorState.code !== 3
                            }
                            errorMessage={contactInputErrorState.message}
                            disabled={contacts.length >= 10}
                        />
                        <button
                            onClick={handleClickAddContactButton}
                            disabled={contacts.length >= 10}
                        >
                            <PlusIcon className="w-4 h-4" />
                            추가
                        </button>
                    </div>
                </div>
            </div>
            <EditableCheckBoxList
                AddOnButton={
                    <button
                        className="flex items-center bg-amber-400 rounded py-0.5 pl-1 pr-1 text-xs ml-1"
                        onClick={handleClickGetContacts}
                        disabled={contacts.length >= 10}
                    >
                        내 연락처 불러오기
                    </button>
                }
                itemList={(contacts.length < 10
                    ? contacts
                    : contacts.slice(0, 10)
                ).map((contact, id) => ({
                    text: contact,
                    id,
                }))}
                placeholderText="연락처를 추가해주세요."
                validate={validateContactInput}
                onEdit={handleEditContact}
                onReset={handleResetContact}
                onDelete={handleDeleteContact}
            />
        </>
    );
};

export default ShareInputContactsContent;

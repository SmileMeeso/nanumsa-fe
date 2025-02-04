import {
    useState,
    ChangeEvent,
    KeyboardEvent,
    MouseEvent,
    useEffect,
    useRef,
} from "react";

import { ValidateResult } from "@components/menus/sharing";

import { CheckboxListItemIdType, CheckBoxListItem } from "..";

import {
    XMarkIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    MinusIcon,
} from "@heroicons/react/16/solid";

import "./editableCheckBoxList.css";

export interface EditableCheckBoxListProps {
    placeholderText: string;
    itemList: CheckBoxListItem[];
    validate: (input: string) => ValidateResult;
    AddOnButton?: React.ReactNode;
    onDelete: (items: CheckBoxListEditItem[]) => void;
    onEdit: (item: CheckBoxListEditItem, id: CheckboxListItemIdType) => void;
    onReset: (ids?: CheckboxListItemIdType[]) => void;
}

export interface CheckBoxListEditItem {
    text: string;
    option?: "edit" | "error";
    id: CheckboxListItemIdType;
}

const EditableCheckBoxList = ({
    placeholderText,
    itemList,
    validate,
    AddOnButton,
    onDelete,
    onEdit,
    onReset,
}: EditableCheckBoxListProps) => {
    const [checkedList, setCheckedList] = useState<CheckboxListItemIdType[]>(
        []
    );
    const [itemsForEdit, setItemsForEdit] = useState<CheckBoxListEditItem[]>(
        []
    );

    const [getContactErrorMessage, setGetContactErrorMessage] = useState<
        string | null
    >(null);
    const [showValidationError, setShowValidationError] = useState<
        number | null
    >(null);
    const [showEditCompleteError, setShowEditCompleteError] = useState<
        boolean | null
    >(null);

    const contactScrollerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const itemIds = itemsForEdit.map((item) => item.id);

        setItemsForEdit(
            itemList.map((item, idx) =>
                itemIds.includes(item.id)
                    ? item
                    : {
                          text: item.text,
                          id: item.id,
                      }
            )
        );
    }, [itemList]);

    useEffect(() => {
        if (itemList.length >= itemsForEdit.length) {
            scrollToBottom();
        }
    }, [itemsForEdit, itemList]);

    const handleClickAllSelectCheckbox = () => {
        if (checkedList.length === itemList.length) {
            // 전체 해제
            setCheckedList([]);
        } else {
            //전체 선택
            setCheckedList(itemList.map((item) => item.id));
        }
    };

    const handleClickListCheckbox = (
        event: ChangeEvent<HTMLInputElement>,
        newId: CheckboxListItemIdType
    ) => {
        if (event.target.checked) {
            setCheckedList([...checkedList, newId]);
        } else {
            setCheckedList(checkedList.filter((id) => id !== newId));
        }
    };

    const handleChangeEditInput = (
        event: ChangeEvent<HTMLInputElement>,
        id: CheckboxListItemIdType
    ) => {
        const result = validate(event.target.value);

        if (!result.result) {
            setItemsForEdit(
                itemsForEdit.map((item) =>
                    item.id !== id
                        ? item
                        : { text: event.target.value, option: "error", id }
                )
            );
            return;
        }

        setItemsForEdit(
            itemsForEdit.map((item) =>
                item.id !== id
                    ? item
                    : { text: event.target.value, option: "edit", id }
            )
        );
    };

    const handleKeydownEditInput = (
        event: KeyboardEvent<HTMLInputElement>,
        id: CheckboxListItemIdType
    ) => {
        if (event.nativeEvent.isComposing) {
            return;
        }
        if (event.key !== "Enter") {
            return;
        }

        const newItem = itemsForEdit.find((item) => item.id === id);

        if (!newItem || typeof newItem === "string") {
            return;
        }

        const result = validate(newItem.text);

        if (!result.result) {
            setItemsForEdit(
                itemList.map((item) =>
                    item.id !== id ? item : { ...item, option: "error" }
                )
            );
            return;
        }

        onEdit(newItem, id);
        setItemsForEdit(
            itemsForEdit.map((item) => (item.id !== id ? item : newItem))
        );
    };

    const handleClickCancelEdit = (
        lineItem: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => {
        setItemsForEdit(
            itemsForEdit.map((item) =>
                item.id !== id
                    ? item
                    : itemList.find((listItem) => listItem.id === id) ??
                      lineItem
            )
        );
    };

    const handleClickEditLine = (
        event: MouseEvent<HTMLButtonElement>,
        newItem: CheckBoxListEditItem,
        id: CheckboxListItemIdType
    ) => {
        event.stopPropagation();
        event.preventDefault();

        // 편집모드로 전환
        if (!newItem.option) {
            setItemsForEdit(
                itemsForEdit.map((item) =>
                    item.id !== id ? item : { ...item, option: "edit" }
                )
            );
            return;
        }
        const validateResult = validate(newItem.text);

        if (!validateResult.result) {
            return;
        }
        setItemsForEdit(
            itemsForEdit.map((item) =>
                item.id !== id ? item : { text: item.text, id: item.id }
            )
        );
        onEdit(newItem, id);
    };

    const handleClickDelete = (deletedItem: CheckBoxListEditItem) => {
        onDelete([deletedItem]);
        setItemsForEdit(
            itemsForEdit.filter((item) => item.id !== deletedItem.id)
        );
        setCheckedList(checkedList.filter((id) => id !== deletedItem.id));
    };

    const handleClickDeleteAllItems = () => {
        onReset(checkedList);
        setItemsForEdit(
            itemsForEdit.filter((item) => !checkedList.includes(item.id))
        );
        setCheckedList([]);
    };

    const handleClickResetButton = () => {
        setItemsForEdit([]);
        onReset();
    };

    const scrollToBottom = () => {
        if (!contactScrollerRef?.current) {
            return;
        }

        contactScrollerRef.current.scrollTop =
            contactScrollerRef.current.scrollHeight;
    };

    return (
        <div className="editable-check-box-list">
            <div className="editable-check-box-list-title">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={
                            checkedList.length === itemList.length &&
                            itemList.length !== 0
                        }
                        onChange={handleClickAllSelectCheckbox}
                    />
                    <b>연락처 목록</b>
                    <button
                        className="reset-button"
                        onClick={handleClickResetButton}
                    >
                        초기화
                    </button>
                    {AddOnButton && AddOnButton}
                    {checkedList.length > 0 && (
                        <button
                            className="delete-all-checked"
                            onClick={handleClickDeleteAllItems}
                        >
                            <XMarkIcon className="w-4 h-4 inline-block" />
                            {checkedList.length}개 일괄삭제
                        </button>
                    )}
                </div>
            </div>
            <div className="list-item-group">
                <div ref={contactScrollerRef} className="scroll-wrapper">
                    {itemsForEdit.length > 0 ? (
                        itemsForEdit.map((item, idx) => (
                            <div className="list-item">
                                <div className="line">
                                    <input
                                        type="checkbox"
                                        checked={checkedList.includes(item.id)}
                                        onChange={(event) =>
                                            handleClickListCheckbox(
                                                event,
                                                item.id
                                            )
                                        }
                                    />
                                    {itemsForEdit[idx].option ? (
                                        <div className="edit-area">
                                            <input
                                                className={
                                                    itemsForEdit[idx].option ===
                                                    "error"
                                                        ? "error"
                                                        : ""
                                                }
                                                type="text"
                                                value={itemsForEdit[idx].text}
                                                onChange={(event) =>
                                                    handleChangeEditInput(
                                                        event,
                                                        item.id
                                                    )
                                                }
                                                onKeyDown={(event) =>
                                                    handleKeydownEditInput(
                                                        event,
                                                        item.id
                                                    )
                                                }
                                            />
                                            <button
                                                className="cancel-button"
                                                onClick={() => {
                                                    if (
                                                        itemsForEdit.length ===
                                                        0
                                                    ) {
                                                        return;
                                                    }
                                                    handleClickCancelEdit(
                                                        item,
                                                        idx
                                                    );
                                                }}
                                            >
                                                <MinusIcon className="w-4 h-4 inline-block" />
                                                취소
                                            </button>
                                        </div>
                                    ) : (
                                        !item.option && item.text
                                    )}
                                </div>
                                <div className="util-buttons">
                                    <button
                                        className={`button ${
                                            item.option ? "save" : "edit"
                                        }`}
                                        onClick={(event) =>
                                            handleClickEditLine(
                                                event,
                                                item,
                                                idx
                                            )
                                        }
                                        disabled={item.option === "error"}
                                    >
                                        <PencilIcon className="w-4 h-4 inline-block" />
                                        {!item.option ? "수정" : "저장"}
                                    </button>
                                    <button
                                        className="button cancel"
                                        onClick={() => handleClickDelete(item)}
                                    >
                                        <XMarkIcon className="w-4 h-4 inline-block" />
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="placeholder">{placeholderText}</div>
                    )}
                </div>
                <div className="error-message">
                    {showEditCompleteError && (
                        <>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            모든 편집을 완료한 후에 다시 저장을 시도해주세요.
                        </>
                    )}
                    {showValidationError !== null && (
                        <>
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            {showValidationError}번째 열의 데이터에 오류가
                            있습니다.
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditableCheckBoxList;

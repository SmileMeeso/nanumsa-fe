import { useState, ChangeEvent } from "react";

import { PlusIcon } from "@heroicons/react/16/solid";

import "./addableCheckBoxList.css";

export interface AddableCheckBoxListProps {
    title: string;
    placeholderText: string;
    lineList: AddableCheckBoxListItem[];
    onAddLine: (items: AddableCheckboxListItemIdType) => void;
    onAddAllChecked: (itms: AddableCheckboxListItemIdType[]) => void;
}

export type AddableCheckboxListItemIdType = number;
export interface AddableCheckBoxListItem {
    text: string;
    id: AddableCheckboxListItemIdType;
}

const AddableCheckBoxList = ({
    title,
    placeholderText,
    lineList,
    onAddLine,
    onAddAllChecked,
}: AddableCheckBoxListProps) => {
    const [checkedList, setCheckedList] = useState<
        AddableCheckboxListItemIdType[]
    >([]);

    const handleClickAllSelectCheckbox = () => {
        if (checkedList.length === lineList.length) {
            // 전체 해제
            setCheckedList([]);
        } else {
            //전체 선택
            setCheckedList(lineList.map((item) => item.id));
        }
    };

    const handleClickAddAllChecked = () => {
        onAddAllChecked(checkedList);
        setCheckedList([]);
    };

    const handleClickListCheckbox = (
        event: ChangeEvent<HTMLInputElement>,
        item: AddableCheckBoxListItem
    ) => {
        if (event.target.checked && !checkedList.includes(item.id)) {
            setCheckedList([...checkedList, item.id]);
        } else if (!event.target.checked) {
            setCheckedList(checkedList.filter((tag) => tag !== item.id));
        }
    };

    const handleclickAddLine = (item: AddableCheckBoxListItem) => {
        onAddLine(item.id);
        setCheckedList(checkedList.filter((listItem) => listItem !== item.id));
    };

    const handleClickAdminListLine = (item: AddableCheckBoxListItem) => {
        const isChecked = checkedList.includes(item.id);

        if (isChecked) {
            setCheckedList(checkedList.filter((tag) => tag !== item.id));
        } else {
            setCheckedList([...checkedList, item.id]);
        }
    };

    return (
        <div className="addable-check-box-list">
            <div className="addable-check-box-list-title">
                <div className="text">
                    <input
                        type="checkbox"
                        checked={
                            checkedList.length === checkedList.length &&
                            checkedList.length !== 0
                        }
                        onChange={handleClickAllSelectCheckbox}
                    />
                    <b>{title}</b>
                </div>
                {checkedList.length > 0 && checkedList.length > 0 && (
                    <button
                        className="add-all-checked"
                        onClick={handleClickAddAllChecked}
                    >
                        <PlusIcon className="w-4 h-4 inline-block" />
                        {checkedList.length}개 행 일괄 추가
                    </button>
                )}
            </div>
            <div className="list-item-group">
                <div className="scroll-wrapper">
                    {lineList.length > 0 ? (
                        lineList.map((item) => (
                            <div className="list-item">
                                <div className="text-area">
                                    <input
                                        type="checkbox"
                                        checked={checkedList.includes(item.id)}
                                        onChange={(event) =>
                                            handleClickListCheckbox(event, item)
                                        }
                                    />
                                    {item.text}
                                </div>
                                <button
                                    className="add-line-button"
                                    onClick={() => handleclickAddLine(item)}
                                >
                                    <PlusIcon className="w-4 h-4 inline-block" />
                                    추가
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="placeholder">{placeholderText}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddableCheckBoxList;

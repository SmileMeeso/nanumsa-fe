import { useState, ChangeEvent } from "react";

import { XMarkIcon } from "@heroicons/react/16/solid";

import "./checkBoxList.css";

export interface CheckBoxListProps {
    title: string;
    placeholderText: string;
    lineList: CheckBoxListItem[];
    minLine?: number;
    onDeleteLine: (items: CheckboxListItemIdType) => void;
    onDeleteAllChecked: (itms: CheckboxListItemIdType[]) => void;
}

export type CheckboxListItemIdType = number;
export interface CheckBoxListItem {
    text: string;
    id: CheckboxListItemIdType;
}

const CheckBoxList = ({
    title,
    placeholderText,
    lineList,
    minLine = 0,
    onDeleteLine,
    onDeleteAllChecked,
}: CheckBoxListProps) => {
    const [checkedList, setCheckedList] = useState<CheckboxListItemIdType[]>(
        []
    );

    const handleClickAllSelectCheckbox = () => {
        if (checkedList.length === lineList.length) {
            // 전체 해제
            setCheckedList([]);
        } else {
            //전체 선택
            setCheckedList(lineList.map((item) => item.id));
        }
    };

    const handleClickDeleteAllChecked = () => {
        onDeleteAllChecked(checkedList);
        setCheckedList([]);
    };

    const handleClickListCheckbox = (
        event: ChangeEvent<HTMLInputElement>,
        item: CheckBoxListItem
    ) => {
        if (event.target.checked) {
            setCheckedList([...checkedList, item.id]);
        } else {
            setCheckedList(checkedList.filter((tag) => tag !== item.id));
        }
    };

    const handleClickDeleteLine = (item: CheckBoxListItem) => {
        onDeleteLine(item.id);
        setCheckedList(checkedList.filter((listItem) => listItem !== item.id));
    };

    const handleClickAdminListLine = (item: CheckBoxListItem) => {
        const isChecked = checkedList.includes(item.id);

        if (isChecked) {
            setCheckedList(checkedList.filter((tag) => tag !== item.id));
        } else {
            setCheckedList([...checkedList, item.id]);
        }
    };

    return (
        <div className="check-box-list">
            <div className="check-box-list-title">
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
                        className="delete-all-checked"
                        onClick={handleClickDeleteAllChecked}
                    >
                        <XMarkIcon className="w-4 h-4 inline-block" />
                        {checkedList.length}개 행 일괄삭제
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
                                {lineList.length > minLine && (
                                    <button
                                        className="delete-line-button"
                                        onClick={() =>
                                            handleClickDeleteLine(item)
                                        }
                                    >
                                        <XMarkIcon className="w-4 h-4 inline-block" />
                                        삭제
                                    </button>
                                )}
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

export default CheckBoxList;

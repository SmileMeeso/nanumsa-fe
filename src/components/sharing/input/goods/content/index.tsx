import { useRef, useState, KeyboardEvent } from "react";

import RadioWithDynamicInput, {
    RadioForm,
} from "@components/radioWithDynamicInput";
import CheckBoxList, { CheckboxListItemIdType } from "@components/checkBoxList";

import { ShareInfoGoods, ValidateResult } from "@/components/menus/sharing";

export const validateShareGoodsInfoInput = (
    emptyNotAllowed: boolean,
    shareGoodsInfo: ShareInfoGoods,
    input?: string | number,
    shareGoodsInfoInputIndex?: number
): ValidateResult => {
    const writingShareGoodsInfo = shareGoodsInfo;
    // 초기값
    if (input === "") {
        return {
            code: 3,
            result: false,
        };
    }

    if (
        writingShareGoodsInfo.type > 3 ||
        typeof writingShareGoodsInfo.type !== "number"
    ) {
        return {
            code: 1,
            message: "나눔 유형을 먼저 선택해주세요.",
            result: false,
        };
    }

    const shareGoodsInfoType = writingShareGoodsInfo.type;

    const checkNumericValue = (typeName: string = "") => {
        if (typeof input !== "number") {
            return {
                code: 3,
                message: `나눔 유형 ${
                    shareGoodsInfoType + 1
                }번 ${typeName}입력칸은 숫자 입력만 허용됩니다.`,
                result: false,
            };
        }
        return {
            code: 0,
            result: true,
        };
    };

    const checkStringValue = (
        numberOfCharactersAllowed: number,
        typeName: string = ""
    ) => {
        // 문자 입력칸 체크
        if (typeof input !== "string") {
            return {
                code: 2,
                message: `나눔 유형 ${
                    shareGoodsInfoType + 1
                }번의 ${typeName}입력칸은 문자 입력만 허용됩니다.`,
                result: false,
            };
        }
        if (input.length > numberOfCharactersAllowed) {
            return {
                code: 2,
                message: `나눔 유형 ${
                    shareGoodsInfoType + 1
                }번의 ${typeName}입력칸은 ${numberOfCharactersAllowed}자 이내 글자만 허용됩니다.`,
                result: false,
            };
        }
        if (!/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9\s]+$/.test(input)) {
            return {
                code: 2,
                message: `나눔 유형 ${
                    shareGoodsInfoType + 1
                }번의 ${typeName}입력칸은 한글, 영어 대소문자, 숫자, 띄어쓰기만 허용됩니다.`,
                result: false,
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    if (emptyNotAllowed && (typeof input === "undefined" || !input)) {
        return {
            code: 4,
            message: "빈 칸일 수 없습니다.",
            result: false,
        };
    }

    if (shareGoodsInfoType === 0) {
        if (shareGoodsInfoInputIndex === 0) {
            return checkStringValue(15, "첫번째 ");
        } else if (shareGoodsInfoInputIndex === 1) {
            return checkNumericValue("두번째 ");
        }
    } else if ([1, 2].includes(shareGoodsInfoType)) {
        return checkNumericValue();
    } else if ([3].includes(shareGoodsInfoType)) {
        return checkStringValue(30);
    }

    return {
        code: 0,
        result: true,
    };
};

export const validateShareGoodsInfo = (
    shareGoodsInfoList: ShareInfoGoods[]
): ValidateResult => {
    const shareGoodsInfoListLength = shareGoodsInfoList.length;

    if (shareGoodsInfoListLength === 0) {
        return {
            code: 1,
            result: false,
            message: "나눔 물품은 하나 이상이어야 합니다.",
        };
    }

    for (let i = 0; i < shareGoodsInfoListLength; i++) {
        const typeResult = validateShareGoodsInfoType(
            shareGoodsInfoList[i].type
        );
        let inputResult = {
            code: 0,
            result: true,
        };

        if (shareGoodsInfoList[i].type === 0) {
            inputResult =
                validateShareGoodsInfoInput(
                    true,
                    shareGoodsInfoList[i],
                    shareGoodsInfoList[i].input.text,
                    0
                ) &&
                validateShareGoodsInfoInput(
                    true,
                    shareGoodsInfoList[i],
                    shareGoodsInfoList[i].input.number,
                    1
                );
        } else if ([1, 2].includes(shareGoodsInfoList[i].type)) {
            inputResult = validateShareGoodsInfoInput(
                true,
                shareGoodsInfoList[i],
                shareGoodsInfoList[i].input.number,
                0
            );
        } else if ([3].includes(shareGoodsInfoList[i].type)) {
            inputResult = validateShareGoodsInfoInput(
                true,
                shareGoodsInfoList[i],
                shareGoodsInfoList[i].input.text,
                0
            );
        }

        if (!typeResult.result) {
            return typeResult;
        }
        if (!inputResult.result) {
            return inputResult;
        }
    }

    return {
        code: 0,
        result: true,
    };
};

export const validateShareGoodsInfoType = (type: number): ValidateResult => {
    if (type > 3) {
        return {
            code: 1,
            result: false,
            message: "나눔 물품의 타입은 0, 1, 2, 3 중 하나입니다.",
        };
    }

    return {
        code: 0,
        result: true,
    };
};

export interface SharingInputGoodsContentProps {
    shareGoodsInfoList: ShareInfoGoods[];
    addNewShareGoods: (newGoods: ShareInfoGoods) => void;
    handleDeleteShareGoodsLine: (id: CheckboxListItemIdType) => void;
    handleDeleteShreGoodsAllChecked: (ids: CheckboxListItemIdType[]) => void;
}

const SharingInputGoodsContent = ({
    shareGoodsInfoList,
    addNewShareGoods,
    handleDeleteShareGoodsLine,
    handleDeleteShreGoodsAllChecked,
}: SharingInputGoodsContentProps) => {
    //나눔 품목 입력
    const [currentWritingShareGoodsInfo, setCurrentWritingShareGoodsInfo] =
        useState<ShareInfoGoods>({
            type: 0,
            input: {},
        });
    const [shareGoodsInfoInputErrorState, setShareGoodsInfoInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });
    const [isShareGoodsAddedOnce, setIsShareGoodsAddedOnce] =
        useState<boolean>(false); // 한번이라도 나눔물품 추가된적 있는지

    const radioFormItems = useRef<RadioForm[]>([
        {
            text: "[타입1] 특정 품목을 일정 수량만큼 나눔하는 방식이에요.",
            value: 0,
            inputType: "text number",
            inputPlaceholder: "품목명|수량",
            defaultSelect: true,
        },
        {
            text: "[타입2] 일정 금액을 가게에 선지급해서 나눔 받는 사람들이 사용하는 방식이에요. (단위: 원)",
            value: 1,
            inputType: "number",
            inputPlaceholder: "선지급한 금액을 숫자만 입력해주세요.",
            defaultSelect: false,
        },
        {
            text: "[타입3] 사람들이 나눔 품목을 구매하고 구매된 만큼 가게에 후지급하는 방식이에요. (단위: 원)",
            value: 2,
            inputType: "number",
            inputPlaceholder: "최대 금액을 입력해주세요.",
            defaultSelect: false,
        },
        {
            text: "[타입4] 정해진 방식이 아닌 자유로운 텍스트를 입력하고 싶어요.",
            value: 3,
            inputType: "text",
            inputPlaceholder:
                "한글, 영어 대소문자, 특수문자 #!^~@, 이모지, 띄어쓰기 포함 30자 이하로 입력해주세요.",
            defaultSelect: false,
        },
    ]);

    const isShareGoodsInfoEmpty = () => {
        return (
            currentWritingShareGoodsInfo.type > 3 ||
            (currentWritingShareGoodsInfo.type === 0
                ? !currentWritingShareGoodsInfo.input.number ||
                  !currentWritingShareGoodsInfo.input.text
                : [1, 2].includes(currentWritingShareGoodsInfo.type)
                ? !currentWritingShareGoodsInfo.input.number
                : currentWritingShareGoodsInfo.type === 3 &&
                  !currentWritingShareGoodsInfo.input.text)
        );
    };

    const handleChangeShareGoodsInfoInput = (
        shareGoodsInput: string | number,
        shareGoodsInfoInputIndex?: number
    ) => {
        const validateResult = validateShareGoodsInfoInput(
            true,
            currentWritingShareGoodsInfo,
            shareGoodsInput,
            shareGoodsInfoInputIndex
        );

        setShareGoodsInfoInputErrorState(validateResult);

        setCurrentWritingShareGoodsInfo({
            ...currentWritingShareGoodsInfo,
            input:
                currentWritingShareGoodsInfo.type === 0 &&
                typeof shareGoodsInput === "string" &&
                shareGoodsInfoInputIndex === 0
                    ? {
                          text: shareGoodsInput,
                          number: currentWritingShareGoodsInfo.input.number,
                      }
                    : currentWritingShareGoodsInfo.type === 0 &&
                      typeof shareGoodsInput === "number" &&
                      shareGoodsInfoInputIndex === 1
                    ? {
                          number: shareGoodsInput,
                          text: currentWritingShareGoodsInfo.input.text,
                      }
                    : currentWritingShareGoodsInfo.type === 1
                    ? {
                          number: shareGoodsInput as number,
                      }
                    : currentWritingShareGoodsInfo.type === 2
                    ? {
                          number: shareGoodsInput as number,
                      }
                    : currentWritingShareGoodsInfo.type === 3
                    ? { text: shareGoodsInput as string }
                    : {},
        });
    };

    const handleChangeShareGoodsInfoRadio = (shareGoodsType: number) => {
        setCurrentWritingShareGoodsInfo({
            type: shareGoodsType,
            input: {},
        });
    };

    const handleKeyDownShareGoodsInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key !== "Enter") {
            return;
        }

        if (isShareGoodsInfoEmpty()) {
            return;
        }

        addShareGoodsInfo();
    };

    const handleClickAddShareGoodsButton = () => {
        addShareGoodsInfo();
    };

    const addShareGoodsInfo = () => {
        addNewShareGoods(currentWritingShareGoodsInfo);
        setCurrentWritingShareGoodsInfo({
            type: 0,
            input: {},
        });
        setIsShareGoodsAddedOnce(true);
    };

    return (
        <>
            <RadioWithDynamicInput
                radioForm={radioFormItems.current}
                radioName="sharing-new-sharing-goods-default"
                onChangeRadio={handleChangeShareGoodsInfoRadio}
                onChangeInput={handleChangeShareGoodsInfoInput}
                onKeyDownInput={handleKeyDownShareGoodsInput}
                onClickAddButton={handleClickAddShareGoodsButton}
                value={{
                    radio: currentWritingShareGoodsInfo.type,
                    input: currentWritingShareGoodsInfo.input,
                }}
                isError={
                    !shareGoodsInfoInputErrorState.result &&
                    shareGoodsInfoInputErrorState.code !== 3
                }
                errorMessage={shareGoodsInfoInputErrorState.message}
                errorInputIndex={
                    currentWritingShareGoodsInfo.type === 0 &&
                    shareGoodsInfoInputErrorState.code === 2
                        ? [0]
                        : shareGoodsInfoInputErrorState.code === 3
                        ? [1]
                        : []
                }
                disableAddButton={
                    isShareGoodsInfoEmpty() ||
                    (!shareGoodsInfoInputErrorState.result &&
                        shareGoodsInfoInputErrorState.code !== 3)
                }
            />

            {shareGoodsInfoList.length === 0 && !isShareGoodsAddedOnce ? (
                <div className="flex justify-center mt-4 items-center w-full h-16  text-center p-4 bg-white border border-slate-300 rounded-md">
                    새로운 나눔 물품을 추가하면
                    <br />
                    여기에 나타나요!
                </div>
            ) : (
                <CheckBoxList
                    title="추가된 나눔물품"
                    placeholderText="추가된 나눔 물품이 없어요."
                    lineList={shareGoodsInfoList.map((goods, idx) => ({
                        text: `[타입 ${goods.type + 1}] ${
                            goods.type === 0
                                ? `${goods.input.text} ${goods.input.number}개`
                                : [1, 2].includes(goods.type)
                                ? `${goods.input.number?.toLocaleString()}원`
                                : [3].includes(goods.type)
                                ? goods.input.text
                                : ""
                        }`,
                        id: idx,
                    }))}
                    onDeleteLine={handleDeleteShareGoodsLine}
                    onDeleteAllChecked={handleDeleteShreGoodsAllChecked}
                />
            )}
        </>
    );
};

export default SharingInputGoodsContent;

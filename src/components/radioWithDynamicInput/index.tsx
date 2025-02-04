import { ChangeEvent, KeyboardEvent } from "react";

import TextInput from "@components/input/textInput";
import NumberInput from "@components/input/numberInput";

import { PlusIcon } from "@heroicons/react/16/solid";

import "./radioWithDynamicInput.css";

export interface RadioForm {
    text: string;
    value: number;
    inputType: "number" | "text" | "text number";
    inputPlaceholder: string;
    defaultSelect?: boolean;
}
export type RadioFormInputType = "number" | "text" | "text number";

export interface RadioWithDynamicInputProps {
    radioForm: RadioForm[];
    radioName: string;
    value: {
        radio: number;
        input: {
            text?: string;
            number?: number;
        };
    };
    isError?: boolean;
    errorMessage?: string;
    errorInputIndex?: number[];
    disableAddButton?: boolean;
    onChangeRadio: (value: number) => void;
    onChangeInput: (input: string | number, inputIndex?: number) => void;
    onKeyDownInput?: (event: KeyboardEvent<HTMLInputElement>) => void;
    onClickAddButton: () => void;
}

const RadioWithDynamicInput = ({
    radioForm,
    radioName,
    value,
    isError,
    errorMessage,
    errorInputIndex,
    disableAddButton,
    onChangeRadio,
    onChangeInput,
    onKeyDownInput,
    onClickAddButton,
}: RadioWithDynamicInputProps) => {
    const handleChangeRadioButton = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedValue = parseInt(event.target.value);
        onChangeRadio(selectedValue);
    };

    const handleChangeInput = (input: string | number, inputIndex?: number) => {
        onChangeInput(input, inputIndex);
    };

    const handleKeyDownEvent = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!onKeyDownInput) {
            return;
        }

        onKeyDownInput(event);
    };

    const handleChangeNumberInputWithIndex = (input: number) => {
        handleChangeInput(input, 1);
    };

    return (
        <div className="radio-with-dynamic-radio-button">
            <ul>
                {radioForm.map((form, idx) => (
                    <li>
                        <input
                            type="radio"
                            id={`${radioName}-${idx}`}
                            checked={value.radio === form.value}
                            value={form.value}
                            name={radioName}
                            onChange={handleChangeRadioButton}
                        />
                        <label htmlFor={`${radioName}-${idx}`}>
                            {form.text}
                        </label>
                    </li>
                ))}
            </ul>
            <div className="input-area flex gap-x-2">
                <div className="flex-1">
                    {radioForm.map(
                        (form) =>
                            value.radio === form.value &&
                            (form.inputType === "text" ? (
                                <TextInput
                                    value={value.input.text ?? ""}
                                    placeholder={form.inputPlaceholder}
                                    onChangeInput={handleChangeInput}
                                    onKeyDownInput={handleKeyDownEvent}
                                    isError={isError}
                                    errorMessage={errorMessage}
                                />
                            ) : form.inputType === "number" ? (
                                <NumberInput
                                    value={value.input.number}
                                    placeholder={form.inputPlaceholder}
                                    onChangeInput={handleChangeInput}
                                    onKeyDownInput={handleKeyDownEvent}
                                    isError={isError}
                                    errorMessage={errorMessage}
                                />
                            ) : (
                                form.inputType === "text number" && (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <TextInput
                                                value={value.input.text ?? ""}
                                                placeholder={
                                                    form.inputPlaceholder.split(
                                                        "|"
                                                    )[0]
                                                }
                                                onChangeInput={(
                                                    input: string
                                                ) =>
                                                    handleChangeInput(input, 0)
                                                }
                                                onKeyDownInput={
                                                    handleKeyDownEvent
                                                }
                                                isError={
                                                    errorInputIndex &&
                                                    errorInputIndex.includes(
                                                        0
                                                    ) &&
                                                    isError
                                                }
                                                errorMessage={errorMessage}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <NumberInput
                                                value={value.input.number}
                                                placeholder={
                                                    form.inputPlaceholder.split(
                                                        "|"
                                                    )[1]
                                                }
                                                onChangeInput={
                                                    handleChangeNumberInputWithIndex
                                                }
                                                onKeyDownInput={
                                                    handleKeyDownEvent
                                                }
                                                isError={
                                                    errorInputIndex &&
                                                    errorInputIndex.includes(
                                                        1
                                                    ) &&
                                                    isError
                                                }
                                                errorMessage={errorMessage}
                                            />
                                        </div>
                                    </div>
                                )
                            ))
                    )}
                </div>
                <button
                    className="flex flex-row w-[56px] items-center justify-center bg-sky-400 text-white rounded"
                    disabled={disableAddButton}
                    onClick={onClickAddButton}
                >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    추가
                </button>
            </div>
        </div>
    );
};

export default RadioWithDynamicInput;

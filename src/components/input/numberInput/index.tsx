import { ChangeEvent, KeyboardEvent } from "react";

import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";

interface NumberInputProps {
    value?: number;
    onChangeInput: (input: number) => void;
    onKeyDownInput?: (event: KeyboardEvent<HTMLInputElement>) => void;
    isError?: boolean;
    errorMessage?: string;
    placeholder?: string;
}

const NumberInput = ({
    value,
    onChangeInput,
    onKeyDownInput,
    placeholder,
    isError,
    errorMessage,
}: NumberInputProps) => {
    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseInt(event.target.value);

        if (isNaN(parsedValue)) {
            return;
        }

        onChangeInput(parsedValue);
    };

    const handleKeydownEvent = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!onKeyDownInput) {
            return;
        }
        if (event.key === "Enter" && isError) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        onKeyDownInput(event);
    };

    return (
        <div>
            <input
                className={`border ${
                    !isError ? "border-slate-300" : "border-red-500"
                } p-2 rounded-md w-full`}
                type="number"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={handleChangeInput}
                onKeyDown={handleKeydownEvent}
                min="0"
            />
            {isError && errorMessage && (
                <div className="text-red-400 font-bold">
                    <ExclamationTriangleIcon className="w-4 h-4 inline-block mr-1" />
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default NumberInput;

import { ChangeEvent, KeyboardEvent } from "react";

import { ExclamationTriangleIcon } from "@heroicons/react/16/solid";

interface TextInputProps {
    value: string;
    onClick?: () => void;
    onChangeInput: (input: string) => void;
    onKeyDownInput?: (event: KeyboardEvent<HTMLInputElement>) => void;
    isError?: boolean;
    errorMessage?: string;
    placeholder?: string;
    disabled?: boolean;
}

const TextInput = ({
    value,
    onClick,
    onChangeInput,
    onKeyDownInput,
    placeholder,
    isError,
    errorMessage,
    disabled,
}: TextInputProps) => {
    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChangeInput(event.target.value);
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
        <div className="text-input">
            <input
                className={`border ${
                    !isError ? "border-slate-300" : "border-red-500"
                } p-2 rounded-md w-full`}
                type="text"
                value={value}
                placeholder={placeholder}
                onClick={onClick}
                onChange={handleChangeInput}
                onKeyDown={handleKeydownEvent}
                disabled={disabled}
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

export default TextInput;

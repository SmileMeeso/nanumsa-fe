import { ChangeEvent, KeyboardEvent } from "react";

import {
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";

interface SearchInputProps {
    value: string;
    onChangeInput: (input: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onClickSearchButton: () => void;
    isError?: boolean;
    errorMessage?: string;
    placeholder?: string;
}

const SearchInput = ({
    value,
    onChangeInput,
    onKeyDown,
    onClickSearchButton,
    placeholder,
    isError,
    errorMessage,
}: SearchInputProps) => {
    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChangeInput(event.target.value);
    };

    return (
        <div>
            <div className="flex w-full gap-x-1">
                <input
                    className={`border border-slate-300 p-2 rounded-md flex-1`}
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChangeInput}
                    onKeyDown={onKeyDown}
                />
                <button
                    className="flex justify-center items-center bg-sky-400 text-white w-12 rounded-md"
                    onClick={onClickSearchButton}
                >
                    <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
            </div>
            {isError && errorMessage && (
                <div className="text-red-400 font-bold">
                    <ExclamationTriangleIcon className="w-4 h-4 inline-block mr-1" />
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default SearchInput;

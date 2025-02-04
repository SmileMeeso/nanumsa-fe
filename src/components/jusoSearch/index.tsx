import { useState, KeyboardEvent } from "react";

import { useQuery } from "react-query";

import SearchInput from "@components/input/searchInput";
import { ValidateResult } from "@components/menus/sharing";

import { getAddressWithLatLngUsingKeyword } from "@/api/request/requests";

import { CheckIcon } from "@heroicons/react/16/solid";

import "./jusoSearch.css";

export interface JusoSearchProps {
    onClickSearchResult: (result: AddressSearchResult) => void;
    checkOnClickResult?: boolean;
}

export interface AddressSearchResult {
    jibunAddress: string | null;
    doroAddress: string | null;
    lat: number | null;
    lng: number | null;
}

const JusoSearch = ({
    onClickSearchResult,
    checkOnClickResult,
}: JusoSearchProps) => {
    const [jusoSearchInput, setJusoSearchInput] = useState<string>("");

    const [isSearchFlagOn, setIsSearchFlagOn] = useState<boolean>(false);
    const [isAddressSearchTried, setIsAddressSearchTried] =
        useState<boolean>(false);
    const [checkedSearchedAddress, setCheckedSearchedAddress] = useState<
        number | null
    >(null);
    const [jusoInputErrorState, setJusoInputErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const { data: addressSearchResult = [], isLoading: isJusoItemsLoading } =
        useQuery<
            AddressSearchResult[],
            Error,
            AddressSearchResult[],
            readonly unknown[]
        >(
            [jusoSearchInput],
            () => {
                setIsSearchFlagOn(false);
                return getAddressWithLatLngUsingKeyword(jusoSearchInput);
            },
            {
                enabled: isSearchFlagOn && Boolean(jusoSearchInput),
                staleTime: 60 * 1000,
                onSettled: () => {
                    setIsSearchFlagOn(false);
                },
            }
        );

    const handleChangeJusoSearchInput = (input: string) => {
        const validateResult = validateJusoSearchInput(input);

        setJusoInputErrorState(validateResult);
        setJusoSearchInput(input);
    };

    const handleKeyDownJusoSearchInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            doAddressSearch();
        }
    };

    const handleClickAddressSearchButton = () => {
        doAddressSearch();
    };

    const handleClickAddressSearchResult = (
        addressInfo: AddressSearchResult,
        idx: number
    ) => {
        setCheckedSearchedAddress(idx);
        onClickSearchResult(addressInfo);
    };

    const doAddressSearch = () => {
        setIsSearchFlagOn(true);
        setIsAddressSearchTried(true);
        setCheckedSearchedAddress(null);
    };

    const validateJusoSearchInput = (input: string): ValidateResult => {
        // 초기값
        if (input === "") {
            return {
                code: 3,
                result: false,
            };
        }

        if (input.length < 1 || input.length > 20) {
            return {
                code: 1,
                message: "1~20글자 사이의 이름만 사용할 수 있습니다.",
                result: false,
            };
        }

        const regex = /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-zA-Z0-9\s_-]+$/;
        const result = regex.test(input);

        if (!result) {
            return {
                code: 2,
                message: "한글, 영어 대소문자, 띄어쓰기만 사용할 수 있습니다.",
                result: false,
            };
        }

        return {
            code: 0,
            result: true,
        };
    };

    return (
        <div className="address-search">
            <SearchInput
                value={jusoSearchInput}
                onChangeInput={handleChangeJusoSearchInput}
                onKeyDown={handleKeyDownJusoSearchInput}
                onClickSearchButton={handleClickAddressSearchButton}
                isError={
                    !jusoInputErrorState.result &&
                    jusoInputErrorState.code !== 3
                }
                errorMessage={jusoInputErrorState.message}
                placeholder="주소 검색어를 입력해주세요.(예: 판교역로123길 45)"
            />
            <div>
                {!isAddressSearchTried ? (
                    <div className="search-info">주소 검색을 실행해주세요!</div>
                ) : isJusoItemsLoading ? (
                    <div className="search-info">
                        검색중이에요!
                        <br />
                        잠시만 기다려주세요.
                    </div>
                ) : addressSearchResult.length > 0 ? (
                    <div>
                        <div className="search-result">
                            <div className="title">
                                <div className="wrapper">
                                    <b>검색 결과</b>
                                </div>
                            </div>
                            <div className="list-item-group ">
                                {addressSearchResult.map((result, idx) => (
                                    <div
                                        className="list-item-address"
                                        onClick={() => {
                                            handleClickAddressSearchResult(
                                                result,
                                                idx
                                            );
                                        }}
                                    >
                                        {result.doroAddress && (
                                            <div className="line">
                                                <div className="badge bg-sky-500 border-sky-700 text-white">
                                                    도로명
                                                </div>
                                                <div>{result.doroAddress}</div>
                                            </div>
                                        )}
                                        {result.jibunAddress && (
                                            <div className="line text-slate-400">
                                                <div className="badge bg-amber-300 border-amber-800 text-amber-800">
                                                    지번
                                                </div>
                                                <div className="text">
                                                    {result.jibunAddress}
                                                </div>
                                            </div>
                                        )}
                                        {idx === checkedSearchedAddress &&
                                            checkOnClickResult && (
                                                <div className="check-icon">
                                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="search-info">검색 결과가 없어요.</div>
                )}
            </div>
        </div>
    );
};

export default JusoSearch;

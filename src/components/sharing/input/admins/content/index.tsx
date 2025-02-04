import { useState, KeyboardEvent } from "react";

import { useQuery } from "react-query";

import SearchInput from "@components/input/searchInput";
import AddableCheckBoxList from "@components/checkBoxList/addableCheckBoxList.css";
import CheckBoxList from "@components/checkBoxList";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { ValidateResult, Admin, UserId } from "@components/menus/sharing";

import { GetTagsReturn, getTagsByTokens } from "@/api/request/requests";

export const validateAdmins = (admins: Admin[]): ValidateResult => {
    if (admins.length === 0) {
        return {
            code: 2,
            message: "어드민은 1명 이상이어야 합니다.",
            result: false,
        };
    }
    const niddle = admins.find(
        (admin) =>
            typeof admin.nickname !== "string" || typeof admin.tag !== "number"
    );

    if (niddle) {
        return {
            code: 3,
            message: "형식에 맞지 않는 관리자 데이터가 있습니다.",
            result: false,
        };
    }

    return {
        code: 0,
        result: true,
    };
};

export const validateTagInput = (input: string): ValidateResult => {
    // 초기값
    if (input === "") {
        return {
            code: 3,
            result: false,
        };
    }

    const result = /^[0-9,]*$/.test(input);

    if (result) {
        return {
            code: 0,
            result: true,
        };
    }

    return {
        code: 4,
        result: false,
        message: "태그는 숫자와 콤마 값만 입력할 수 있습니다.",
    };
};

interface SharingInputAdminsContentProps {
    adminList: Admin[];
    handleAddAdminLine: (admin: Admin) => void;
    handleAddAdmins: (admins: Admin[]) => void;
    handleDeleteAdminLine: (admin: Admin[]) => void;
    handleDeleteAdmins: (admins: Admin[]) => void;
}

const SharingInputAdminsContent = ({
    adminList,
    handleAddAdminLine,
    handleAddAdmins,
    handleDeleteAdminLine,
    handleDeleteAdmins,
}: SharingInputAdminsContentProps) => {
    const [tagSearchInput, setTagSearchInput] = useState<string>("");
    const [lastSearchQuery, setLastSearchQuery] = useState<string>("");
    const [isTagSearchTried, setIsTagSearchTried] = useState<boolean>(false); // 태그 검색 시도 여부

    const [tagSearchResults, setTagSearchResults] = useState<Admin[]>();

    const [enableTagSearchQuery, setEnableTagSearchQuery] =
        useState<boolean>(false);
    const [getTagErrorMessage, setGetTagErrorMessage] = useState<string | null>(
        null
    );

    const [tagSearchErrorState, setTagSearchErrorState] =
        useState<ValidateResult>({
            code: 3, // 아직 입력 안한 상태
            result: false,
        });

    const { data: tagData, isLoading: loadingGetTagData } = useQuery<
        GetTagsReturn,
        Error
    >(
        [`get-tag-data`, tagSearchInput],
        () => {
            setEnableTagSearchQuery(false);
            return getTagsByTokens(null, {
                tags: tagSearchInput,
            });
        },
        {
            enabled: enableTagSearchQuery,
            onSuccess: (response?: GetTagsReturn) => {
                setLastSearchQuery(tagSearchInput);
                setTagSearchInput("");
                setIsTagSearchTried(true);

                if (response?.success) {
                    setTagSearchResults(response.success);
                } else if (response?.error) {
                    setGetTagErrorMessage(response?.error);
                }
            },
        }
    );

    const handleChangeTagSearchInput = (input: string) => {
        const validateResult = validateTagInput(input);

        setTagSearchErrorState(validateResult);
        setTagSearchInput(input);
    };

    const handleClickTagSearchButton = () => {
        doTagSearch();
    };

    const handleKeyDownTagSearchInput = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            doTagSearch();
        }
    };

    const doTagSearch = () => {
        setEnableTagSearchQuery(true);
    };

    const handleClickAddLineButton = (id: UserId) => {
        if (adminList.find((admin) => admin.tag === id)) {
            //  중복
            return;
        }

        const newAdmin = tagSearchResults?.find((result) => result.tag === id);

        if (!newAdmin) {
            return;
        }

        setTagSearchResults(
            tagSearchResults?.filter((result) => result.tag !== id)
        );

        handleAddAdminLine(newAdmin);
    };

    const handleClickAddCheckedButton = (ids: UserId[]) => {
        const adminTags = adminList.map((admin) => admin.tag);
        const notDupIds = ids.filter((id) => !adminTags.includes(id));

        const newAdmins = tagSearchResults?.filter((result) =>
            notDupIds.includes(result.tag)
        );

        setTagSearchResults(
            tagSearchResults?.filter((item) => !ids.includes(item.tag))
        );

        if (!newAdmins) {
            return;
        }

        handleAddAdmins(newAdmins);
    };

    const handleClickDeleteLineButton = (id: UserId) => {
        handleDeleteAdminLine(
            [...adminList].filter((admin) => admin.tag !== id)
        );
    };

    const handleClickDeleteCheckedButton = (ids: UserId[]) => {
        handleDeleteAdmins(
            [...adminList].filter((admin) => !ids.includes(admin.tag))
        );
    };

    return (
        <>
            <SearchInput
                value={tagSearchInput}
                onChangeInput={handleChangeTagSearchInput}
                onKeyDown={handleKeyDownTagSearchInput}
                onClickSearchButton={handleClickTagSearchButton}
                isError={
                    !tagSearchErrorState.result &&
                    tagSearchErrorState.code !== 3
                }
                errorMessage={tagSearchErrorState.message}
                placeholder="태그로 검색해주세요! (예: 23359901)"
            />
            {!isTagSearchTried ? (
                <div className="flex justify-center items-center w-full h-16 mt-2 text-center p-4 bg-white border border-slate-300 rounded-md">
                    일치하는 태그가 있다면
                    <br />
                    여기 검색결과가 나타나요!
                </div>
            ) : tagSearchResults ? (
                <AddableCheckBoxList
                    title="태그 검색 결과"
                    placeholderText="검색 결과가 없어요."
                    lineList={tagSearchResults.map((result) => ({
                        text: `${result.nickname}@${result.tag}`,
                        id: result.tag,
                    }))}
                    onAddLine={handleClickAddLineButton}
                    onAddAllChecked={handleClickAddCheckedButton}
                />
            ) : (
                <div className="flex justify-center items-center w-full h-16 mt-2 text-center p-4 bg-white border border-slate-300 rounded-md">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    "{lastSearchQuery}"와 일치하는 태그가 없어요.
                </div>
            )}
            <CheckBoxList
                title="관리자 리스트"
                placeholderText="추가된 관리자가 없어요."
                lineList={adminList.map((admin) => ({
                    text: `${admin.nickname}@${admin.tag}`,
                    id: admin.tag,
                }))}
                minLine={1}
                onDeleteLine={handleClickDeleteLineButton}
                onDeleteAllChecked={handleClickDeleteCheckedButton}
            />
        </>
    );
};

export default SharingInputAdminsContent;

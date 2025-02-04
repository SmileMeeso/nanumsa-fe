import React, { useState, useEffect, Dispatch, useContext } from "react";

import { Outlet } from "react-router-dom";

import { SearchContext } from "@/App";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonAndSearchWrapper from "@components/wrapper/container/page/pageWithBackButtonAndSearch";

import "./search.css";

export interface SearchInfoContext {
    keyword: string;
    mapOnly: boolean;
    enableSearch: boolean;
    setEnableSearch: Dispatch<React.SetStateAction<boolean>>;
}

export interface SearchInfo {
    keyword: string;
    mapOnly: boolean;
}

const SearchMenu = () => {
    return (
        <FloatWrapper>
            <PageWithBackButtonAndSearchWrapper>
                <Outlet />
            </PageWithBackButtonAndSearchWrapper>
        </FloatWrapper>
    );
};

export default SearchMenu;

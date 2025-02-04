import SearchListMenu from "@components/menus/search/list/index";

import FloatWrapper from "@components/wrapper/float";
import PageWithBackButtonAndSearchWrapper from "@components/wrapper/container/page/pageWithBackButtonAndSearch";

const SearchDefaultMenu = () => {
    return (
        <FloatWrapper>
            <PageWithBackButtonAndSearchWrapper>
                <SearchListMenu />
            </PageWithBackButtonAndSearchWrapper>
        </FloatWrapper>
    );
};

export default SearchDefaultMenu;

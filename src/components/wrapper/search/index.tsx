import { PropsWithChildren } from "react";

const SearchContainerWrapper = function ({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col min-w-80 w-[24rem] max-w-screen m-2 bg-slate-50 border border-slate-300 shadow rounded-lg text-sm z-[1010]">
            {children}
        </div>
    );
};

export default SearchContainerWrapper;

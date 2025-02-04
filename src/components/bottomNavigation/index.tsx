import { useNavigate } from "react-router-dom";

import ConditionalFloatWrapper from "@components/wrapper/conditinalFloat";
import MenuWithIconButton from "@components/button/menuWithIcon";

import { UserIcon } from "@heroicons/react/16/solid";

function BottomNavigation() {
    const navigate = useNavigate();

    const handleClickUserButton = () => {
        navigate("/user/info");
    };

    return (
        <ConditionalFloatWrapper>
            <div className="flex min-w-80 w-[24rem] max-w-full m-2 z-[1001] justify-end">
                <MenuWithIconButton
                    Icon={<UserIcon className="text-slate-50" />}
                    backgroundColor="bg-sky-500"
                    onClick={handleClickUserButton}
                />
            </div>
        </ConditionalFloatWrapper>
    );
}

export default BottomNavigation;

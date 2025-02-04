import { PropsWithChildren, MouseEvent } from "react";

interface BackdropProps extends PropsWithChildren {
    onClick?: (event?: MouseEvent<HTMLDivElement>) => void;
}

const Backdrop = ({ children, onClick }: BackdropProps) => {
    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!onClick) {
            return;
        }

        onClick(event);
    };
    return (
        <div
            className="w-screen h-screen fixed top-0 left-0 z-[1000]"
            onClick={handleClick}
        >
            {children}
        </div>
    );
};

export default Backdrop;

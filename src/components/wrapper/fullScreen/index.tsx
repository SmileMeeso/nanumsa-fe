import { PropsWithChildren, forwardRef } from "react";

interface FullScreenWrapperProps extends PropsWithChildren {
    id: string;
}

const FullScreenWrapper = forwardRef<HTMLDivElement, FullScreenWrapperProps>(
    ({ children, id }, ref) => {
        return (
            <div ref={ref} id={id} className="w-screen h-screen">
                {children}
            </div>
        );
    }
);

export default FullScreenWrapper;

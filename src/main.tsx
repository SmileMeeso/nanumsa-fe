// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import router from "./router";

import "./index.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        Kakao: any;
        naver_id_login: any;
        $: any;
        callbackLoginWithNaver: () => void;
        successLoginWithNaver: (info: any) => void;
        successLoginWithKakao: (info: any) => void;
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
    // </StrictMode>,
);

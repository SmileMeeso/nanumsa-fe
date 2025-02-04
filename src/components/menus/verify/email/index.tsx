import { useEffect, useState, useRef } from "react";

import {
    postVerifyEmail,
    VerifyEmailFailReturn,
    VerifyEmailReturn,
} from "@/api/request/requests";

import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

import { VerifyEmailEmailReturn } from "@/api/request/requests";

import "@/App.css";

const VerifyEmailMenu = () => {
    const [status, setStatus] = useState<
        | "loading"
        | "success"
        | "already-done"
        | "no-param"
        | "no-token"
        | "error"
    >("loading");
    const [email, setEmail] = useState<string>();
    const [copyDone, setCopyDone] = useState<boolean>(false);

    const token = useRef<string | null>();

    console.log(email, token?.current);

    useEffect(() => {
        token.current = new URLSearchParams(window.location.search).get(
            "token"
        );
    }, []);

    useEffect(() => {
        if (!token?.current) {
            changeErrorStatus();
            return;
        }
        makeEmailVerified();
    }, [token]);

    const makeEmailVerified = () => {
        if (!token.current) {
            return;
        }
        const verifiedEmailPromise = postVerifyEmail(token.current);

        verifiedEmailPromise.then((verifiedEmail: VerifyEmailReturn) => {
            if ((verifiedEmail as VerifyEmailFailReturn).result === 0) {
                setStatus("already-done");
            } else if ((verifiedEmail as VerifyEmailFailReturn).result === 1) {
                setStatus("no-token");
            } else if ((verifiedEmail as VerifyEmailEmailReturn).email) {
                setEmail((verifiedEmail as VerifyEmailEmailReturn).email);
                setStatus("success");
            } else {
                setStatus("error");
            }
        });
    };

    const changeErrorStatus = () => {
        if (typeof token.current === "string") {
            return;
        }
        if (token.current === null) {
            setStatus("no-param");
        }
    };

    const handleClickClipboardButton = async () => {
        await navigator.clipboard.writeText("m950827@naver.com");

        setCopyDone(true);
        setTimeout(() => {
            setCopyDone(false);
        }, 10 * 1000);
    };

    const handleClickCloseWindowButton = () => {
        window.close();
    };

    const HelpToAdmin = () => {
        return (
            <div className="p-2 mt-1 bg-slate-100 rounded flex flex-col justify-center items-center">
                계속 오류가 발생하면 관리자에게 문의해주세요.
                <br />
                <br />
                <div>
                    관리자 이메일: m950827@naver.com
                    {!copyDone ? (
                        <ClipboardDocumentIcon
                            className="w-4 h-4 ml-1 cursor-pointer inline-block"
                            onClick={handleClickClipboardButton}
                        />
                    ) : (
                        <div className="inline-block ml-1">
                            <CheckIcon className="w-4 h-4 text-green-600 inline-block" />
                            <span className="text-slate-500 text-[0.5rem]">
                                복사됨!
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const CloseWindowButton = () => {
        return (
            <button
                className="mt-4 w-32 h-10 rounded-md bg-amber-400 text-center"
                onClick={handleClickCloseWindowButton}
            >
                창 닫기
            </button>
        );
    };

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex justify-center items-center flex-col text-center">
                {status === "loading" ? (
                    <>인증중입니다. 잠시만 기다려주세요.</>
                ) : status === "no-param" ? (
                    <>
                        올바른 파라미터가 아닙니다.
                        <br />
                        <HelpToAdmin />
                        <br />
                        <CloseWindowButton />
                    </>
                ) : status === "already-done" ? (
                    <>
                        만료된 토큰입니다.
                        <br />
                        <HelpToAdmin />
                        <br />
                        <CloseWindowButton />
                    </>
                ) : status === "no-token" ? (
                    <>
                        일치하는 토큰이 없습니다.
                        <br />
                        <HelpToAdmin />
                        <br />
                        <CloseWindowButton />
                    </>
                ) : status === "success" && typeof email === "string" ? (
                    <>
                        <b>{email}</b>
                        <br />
                        위 이메일에 대한 인증이 완료되었습니다.
                        <br />
                        <br />이 창은 닫으셔도 됩니다.
                        <br />
                        <CloseWindowButton />
                    </>
                ) : status === "success" ? (
                    "인증중입니다. 잠시만 기다려주세요."
                ) : (
                    status === "error" && (
                        <>
                            이메일을 인증하는 도중 오류가 발생했습니다.
                            <br />
                            <HelpToAdmin />
                            <br />
                            <CloseWindowButton />
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default VerifyEmailMenu;

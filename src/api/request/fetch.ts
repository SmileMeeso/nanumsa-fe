import { endPoint } from "./urls";

interface FetchUrlParam {
    [key: string]: number | string;
}

export const getAuthToken = () => {
    return window.localStorage.getItem("auth-token") ?? "";
};

const replaceUrlWithParam = (url: string, param?: FetchUrlParam): string => {
    if (!param) {
        return url;
    }
    let newUrl = url;

    Object.keys(param).forEach(
        (key) =>
            (newUrl = newUrl.replace(
                `{${key}}`,
                typeof param[key] !== "number"
                    ? param[key]
                    : param[key].toString()
            ))
    );

    return newUrl;
};

// POST METHOD
export const fetchPost = async <T>(url: string, data = {}): Promise<T> => {
    const response = await fetch(`${endPoint}${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Auth-Token": getAuthToken(),
        },
        body: JSON.stringify(data),
    });

    return await response.json();
};

// GET METHOD
export const fetchGet = async <T>(
    url: string,
    data?: FetchUrlParam | null,
    urlParmas = {}
): Promise<T> => {
    const urlSearchParams = new URLSearchParams();

    if (data) {
        Object.keys(data).forEach((key) =>
            urlSearchParams.set(
                key,
                typeof data[key] === "string" ? data[key] : data[key].toString()
            )
        );
    }

    const response = await fetch(
        `${endPoint}${replaceUrlWithParam(url, urlParmas)}${
            data ? `?${new URLSearchParams(urlSearchParams).toString()}` : ""
        }`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Auth-Token": getAuthToken(),
            },
        }
    );

    return await response.json();
};

// DELETE METHOD
export const fetchDelete = async <T>(
    url: string,
    data?: FetchUrlParam
): Promise<T> => {
    const response = await fetch(
        replaceUrlWithParam(`${endPoint}${url}`, data),
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Auth-Token": getAuthToken(),
            },
            body: JSON.stringify(data),
        }
    );

    return await response.json();
};

// PUT METHOD
export const fetchPut = async <T>(
    url: string,
    data?: FetchUrlParam
): Promise<T> => {
    const response = await fetch(
        replaceUrlWithParam(`${endPoint}${url}`, data),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Auth-Token": getAuthToken(),
            },
            body: JSON.stringify(data),
        }
    );

    return await response.json();
};

// PATCH METHOD
export const fetchPatch = async <T, V = null>(
    url: string,
    data?: FetchUrlParam,
    body?: V
): Promise<T> => {
    const response = await fetch(
        replaceUrlWithParam(`${endPoint}${url}`, data),
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Auth-Token": getAuthToken(),
            },
            body: JSON.stringify(body ? body : data),
        }
    );

    return await response.json();
};

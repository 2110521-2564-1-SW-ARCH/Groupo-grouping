import axios from "axios";
import {
    APIResponse, BoardResponse, CreateBoardRequest,
    CreateBoardResponse,
    LoginResponse,
    ProfileResponse
} from "groupo-shared-service/apiutils/messages";

import io from "socket.io-client";

const userHost = "http://localhost:8080";
const groupingHost = "http://localhost:8081";
const groupingSocket = "http://localhost:8082";

const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';

const randomString = (): string => {
    let result = "";
    for (let i = 0; i < 15; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

const emails: string[] = [];

for (let i = 0; i < 4; i++) {
    emails.push(`${randomString()}@email.com`);
}

const password = "root";
const accessTokens = emails.map(() => "");
const sockets = emails.map(() => io());

const verifyStatus = <T>(response: APIResponse<T>, status: number) => {
    if (response.status !== status) {
        throw new Error(`unexpected status (expect: ${status}, got: ${response.status})`);
    }
};

const hasBoard = (boards: BoardResponse[], boardID: string) => {
    if (boards.findIndex(board => board.boardID === boardID) === -1) {
        throw new Error(`boardID not found (boardID: ${boardID})`);
    }
};

const notHasBoard = (boards: BoardResponse[], boardID: string) => {
    if (boards.findIndex(board => board.boardID === boardID) !== -1) {
        throw new Error(`boardID found`);
    }
};

const getHeaders = (email: string) => {
    const index = emails.findIndex(e => e === email);
    return {
        headers: {Authorization: 'Bearer ' + accessTokens[index]}
    };
};

const register = async (email: string) => {
    const response = await axios.post<APIResponse<string>>(userHost + "/profile", {
        displayName: "wongtawan",
        firstName: "Wongtawan",
        lastName: "Junthai",
        email, password,
    });

    verifyStatus(response.data, 200);
    console.log(`register successfully (email: ${email})`);
};

const login = async (email: string) => {
    const response = await axios.post<APIResponse<LoginResponse>>(userHost + "/auth/login", {email, password});

    verifyStatus(response.data, 200);

    const index = emails.findIndex(e => e === email);
    accessTokens[index] = response.data.body.accessToken;
    console.log(`login successfully (email: ${email})`);
};

const getProfile = async (email: string) => {
    const response = await axios.get<APIResponse<ProfileResponse>>(userHost + "/profile", getHeaders(email));
    verifyStatus(response.data, 200);
    console.log(`get profile successfully (email: ${email})`);
};

const createBoard = async (email: string): Promise<string> => {
    const response = await axios.post<APIResponse<CreateBoardResponse>>(groupingHost + "/board", {
        name: randomString(),
        totalGroup: 2,
        tags: [randomString(), randomString()],
    } as CreateBoardRequest, getHeaders(email));

    verifyStatus(response.data, 200);

    console.log(`create board successfully (email: ${email}, boardID: ${response.data.body.boardID})`);
    return response.data.body.boardID;
};

const listBoard = async (email: string): Promise<BoardResponse[]> => {
    const response = await axios.get<APIResponse<BoardResponse[]>>(groupingHost + "/board", getHeaders(email));
    verifyStatus(response.data, 200);
    console.log(`list boards successfully (email: ${email})`);
    return response.data.body;
};

const getBoard = async (email: string, boardID: string) => {
    const response = await axios.get<APIResponse<BoardResponse>>(groupingHost + `/board/${boardID}`, getHeaders(email));
    verifyStatus(response.data, 200);
    console.log(`get board successfully (email: ${email}, boardID: ${boardID})`);
};

const joinBoard = async (email: string, boardID: string) => {
    const response = await axios.post<APIResponse<string>>(groupingHost + `/board/${boardID}/join`, {}, getHeaders(email));
    verifyStatus(response.data, undefined);
    console.log(`join board successfully (email: ${email}, boardID: ${boardID})`);
};

const test = async () => {
    // prepare user
    for (const email of emails) {
        await register(email);
        await login(email);
        await getProfile(email);
    }

    console.log("....prepare all users successfully....");

    const boardID = await createBoard(emails[0]);

    hasBoard(await listBoard(emails[0]), boardID);
    notHasBoard(await listBoard(emails[1]), boardID);

    await getBoard(emails[1], boardID);
    await joinBoard(emails[1], boardID);

    hasBoard(await listBoard(emails[1]), boardID);
};

test().catch(err => {
    console.log(err);
});

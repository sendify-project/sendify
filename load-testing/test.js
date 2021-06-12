import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '5m', target: 10000 },
        { duration: '5m', target: 10000 },
        { duration: '2m', target: 0 },
    ],
};

let isCheck = false
// let isLogin = false

let access_token_list = ["", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzIyMjUwOTYwMDYsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODF9.9FKTdHu92raLJCFHQ88kVmTytqJLWg_HVhm6sBROPco", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzM1NjcyNzMyODcsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODJ9.DmUkCWaQQSrqJmg6Xwzo-0Fifwz0UPgzuOIC1WU6oZs", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzQ3NTg0NTU2MjIsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODN9.zmTSgLpKKnrXbM6x_jjzPKM_bmDs1bDtD6lygCTCYWI", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzU5MTYwODM1MjcsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODN9.NMhi8bAL0fqw0atOg21bLxr7ERz4MOK4Yv68gO7w2Iw", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzc0MDkyNTU3NTAsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODR9.GhJKqmZaS1-54_z12IL82owyx2akjIdK8tZn9jXdbqA", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwNzg2MDA0MzgwODcsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODV9.9Llj7-lI3tqvXcWMV_sTD42dlcZPCQVsv4OyqDcczFc", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwODAxMTAzODc1MjYsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODZ9.DWkMcg7vbICM7-3qeAjnM3Sv9JcoUvlOcFeJDBZPaXk", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwODExODQxMjkzNTEsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODZ9.58WedXXlRe1I4Aht5npT0LGOcsUgs-NKZTp5bXW3rAw", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwODI0OTI3NTIxOTgsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODd9._41nOhpnuwKX-_NSboww1PM3_K3hChNfWdwwCx6XuI4", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTg5ODQwODM4MzQ5Mjk0NzksIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM1MDQzODh9.fI6lS5-O_7Qp8CLAmH0spawc1RM5Djnm6Dxb3uTqXzQ"];

export default function () {
    group('account', () => {
        if (!isCheck) {
            let auth = {
                Authorization: "Bearer " + access_token_list[__VU % 10]
            };
            let accountRes = http.get(`https://sendify-beta.csie.org/api/account`, { headers: auth });
            isCheck = true
            console.log(__VU, accountRes['body'])
            check(accountRes, { 'check account successfully': (resp) => resp.json('email') !== undefined });
        }
    })

    // group('login', () => {
    //     if (!isLogin) {
    //         let data = {
    //             email: `user${__VU}@ntu.edu.tw`,
    //             password: 'abcd54321',
    //         };
    //         let loginRes = http.post(`https://sendify-beta.csie.org/api/login`, JSON.stringify(data));
    //         isLogin = true
    //         console.log(__VU, loginRes['body'])
    //         check(loginRes, { 'logged in successfully': (resp) => resp.json('access_token') !== undefined });
    //     }
    // })
    // sleep(10);
}
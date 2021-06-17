import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '5m', target: 5000 },
        { duration: '5m', target: 5000 },
        { duration: '2m', target: 0 },
    ],
};

let isCheck = false
// let isLogin = false

let access_token_list = ['', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1ODUxODg5ODMzMTUsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1Nzh9.00obybsAFp4u5nxCjJydZ780hlwDKbehy57COE_jsOo',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1ODgwMjQzMzI4MTksIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1Nzl9.9NAchQbSpD3uCeeyhPnS4zhXb82c9zWdgLiiC1caMRg',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1OTEwNjEwMDg5MTUsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODF9.d8fpbhoP3lEqBwceYkWrgfFnzRLhxz8sJIePuwM8rqs',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1OTM4Nzk1ODEyMDMsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODJ9.QctyBQQ4hnlBA3H2GtZV7ZZBzrOoNlRYuolkKlBNSSA',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1OTY3NjUyNjIzNTUsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODN9.ha7VZBlOP-bH_xZCMXjJaKVpTGgk3TrD9azSuITEESo',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ1OTk2MDA2MTE4NTksIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODR9.kjghdRQhk5KywVAXtcksYgvduAXwY1TR09ewpSK7aVg',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ2MDI0MzU5NjEzNjMsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODZ9.NmENmLIhUhUbwaPKolEAQBxGYEF0V7L2pqlZ3ka0NT4',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ2MDUzMDQ4NjUyOTksIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODd9.XhA6LMbiThXeaaTm97P8a-i6uiUnEVKV1EE5GyyF3ig',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ2MDgxNTY5OTIwMTksIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODh9.Fs4uBbXG422u-_6ag9CEc0i6SUFeujf1F4JNYOsJZf0',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDdXN0b21lcklEIjozNTk1NjQ2MTEwMjU4OTU5NTUsIlJlZnJlc2giOmZhbHNlLCJleHAiOjE2MjM4NjU1ODl9.VKkD9tt3vakSFqlg0PRnyGb6vR8YIl5uaew8-dUVUk0']

export default function () {
    group('account', () => {
        if (!isCheck) {
            let auth = {
                Authorization: "Bearer " + access_token_list[__VU % 10]
            };
            let accountRes = http.get(`https://sample.csie.org/api/account`, { headers: auth });
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
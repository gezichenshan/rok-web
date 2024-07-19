import axios from "axios";
const request = axios.create({
  baseURL: "https://rok.3mir.cc/api/",
  // baseURL: "http://localhost:3019/api/",
  timeout: 1000,
  headers: { countryCode: "foobar" },
});
request.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
request.interceptors.response.use(
  function (response) {
    message.success(response.data);
    return response;
  },
  function (error) {
    message.error(error.response.data);
    return Promise.reject(error);
  }
);

interface FormState {
  countryCode: string;
  areaCode: string;
  cordX: string;
  cordY: string;
  type: string;
  password: string;
}

export function ask(data: FormState) {
  request.post("ask", data).then((res) => {
    console.log(1, res.data);
    return res.data;
  });
}

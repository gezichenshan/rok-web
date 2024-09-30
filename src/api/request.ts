import axios from "axios";
const request = axios.create({
  baseURL: "https://api-rok.3mir.cc/api/",
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
    if (
      ["failCounts", "queue", 'fort/list', 'status'].every(
        (path) => !response.config.url?.startsWith(path)
      )
    ) {
      message.success(response.data, 3);
    }
    return response;
  },
  function (error) {
    message.error(error.response.data, 3);
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
  return request.post("ask", data).then((res) => {
    return res.data;
  });
}
export function getOpenStatus(kindom: string) {
  return request.get(`status?kindom=${kindom}`).then((res) => {
    return res.data;
  });
}
export function setOpenStatus(data: { kindom: string, adminPass: string, open: boolean }) {
  return request.post("open", data).then((res) => {
    return res.data;
  });
}

export function getQueueNumber(kindom: string) {
  return request.get(`queue?kindom=${kindom}`).then((res) => {
    return res.data;
  });
}
export function getFailCounts(kindom: string) {
  return request.get(`failCounts?kindom=${kindom}`).then((res) => {
    return res.data;
  });
}

export function getForts() {
  return request.get(`fort/list`).then((res) => {
    return res.data;
  });
}

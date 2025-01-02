import md5 from "md5";
import { ElMessage } from "element-plus";

/**
 * 前端封装的 crul 方法
 */
const curl = ({
  url, // 请求地址
  method = "post", // 请求方法
  headers = {}, // 请求头
  query = {}, // url query
  data = {}, // post body
  responseType = "json", // response data type
  timeout = 60000, //timeout,
  errorMessage = "网络异常",
}) => {
  // 接口签名处理(让接口变为动态)
  const signKey = "0302d750-40ef-43ae-84dd-69cc97385040";
  const st = Date.now();

  // 构造请求参数 (把参数转化为 axios 参数)
  const ajaxSetting = {
    url,
    method,
    headers: {
      ...headers,
      s_t: st,
      s_sign: md5(`${signKey}_${st}`),
    },
    params: query,
    data,
    responseType,
    timeout,
  };

  return axios
    .request(ajaxSetting)
    .then((response) => {
      const resData = response.data || {};

      // 后端 API 返回格式
      const { success } = resData;

      // 失败
      if (!success) {
        const { code, message } = resData;
        if (code === 442) {
          ElMessage.error("请求参数异常");
        } else if (code === 445) {
          ElMessage.error("请求不合法");
        } else if (code === 50000) {
          ElMessage.error(message);
        } else {
          ElMessage.error(errorMessage);
        }

        console.error(message);

        return Promise.resolve({ success, message, code });
      }

      // 成功
      const { data, metadata } = resData;
      return Promise.resolve({ success, data, metadata });
    })
    .catch((error) => {
      const { message } = error;

      if (message.match(/timeout/)) {
        return Promise.resolve({
          message: "Reqeuest Timeout",
          code: "504",
        });
      }

      return Promise.resolve(error);
    });
};

export default curl;

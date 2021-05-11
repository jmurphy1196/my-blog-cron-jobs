import { config } from "dotenv";
import { emailConfirmJob, newestArticleJob } from "./jobs";
import axios from "axios";

config();

export let newestPost = {
  id: 0,
};

if (!process.env.STRAPI_USERNAME)
  throw new Error("STRAPI_USERNAME is not defined");
if (!process.env.STRAPI_PASSWORD)
  throw new Error("STRAPI_PASSWORD is not defined");
if (!process.env.STRAPI_SERVER_URL)
  throw new Error("STRAPI_SERVER_URL is not defined");
if (!process.env.EMAIL) throw new Error("EMAIL is not defined");
if (!process.env.PASS) throw new Error("PASS is not defined");
console.log("server has started");

let token: string | null = null;
(async () => {
  try {
    const { data } = await axios.post(
      `${process.env.STRAPI_SERVER_URL}/auth/local`,
      {
        identifier: process.env.STRAPI_USERNAME,
        password: process.env.STRAPI_PASSWORD,
      }
    );
    if (!data || !data.jwt) {
      throw new Error("could not retrieve token to authenticate server");
    }

    token = data.jwt;

    axios.defaults.headers.Authorization = `Bearer ${token}`;
    emailConfirmJob.start();
    console.log("started emailconfirm job");
    newestArticleJob.start();
    console.log("started newestArticle job");
  } catch (e) {
    throw e;
  }
})();

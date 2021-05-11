import { CronJob } from "cron";
import { newestPost } from "./index";
import nodemailer from "nodemailer";
import axios from "axios";

export const emailConfirmJob = new CronJob(
  "* * * * *",
  async () => {
    console.log(
      `emailConfrim job is being called at ${new Date().toISOString()}`
    );
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    const { data: subscribers } = await axios.get(
      `${process.env.STRAPI_SERVER_URL}/subscribers?initialEmail=false`
    );
    subscribers.forEach((sub: any) => {
      const mailOptions = {
        from: process.env.EMAIL,
        to: sub.email,
        subject: "Thanks for signing up for Jason's Space Newsletter!",
        html: `<h2>Thanks for signing up :D</h2> <br /> <p>We'll send you a new article whenever they come out! </p> <br /> <a href="https://my-blog-gules-seven.vercel.app">Click here to read more articles</a>`,
      };

      transporter.sendMail(mailOptions, async (err, response) => {
        if (err) {
          console.log(`there was an error sending a message to ${sub.email}`);
          console.log(err);
        } else {
          //email sent successful
          //turn off initial email so subscriber doesn't get this message again
          await axios.put(
            `${process.env.STRAPI_SERVER_URL}/subscribers/${sub.id}`,
            {
              initialEmail: true,
            }
          );
          console.log(`message sent to ${sub.email}`);
        }
      });
    });
  },
  null,
  false,
  "America/Los_Angeles"
);

//runs every 1030am on monday

export const newestArticleJob = new CronJob(
  " 30 10 * * 1",
  async () => {
    console.log(
      `newest article job is being called at ${new Date().toISOString()}`
    );
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    const { data: newestArticle } = await axios.get(
      `${process.env.STRAPI_SERVER_URL}/articles?_sort=id:DESC&_limit=1`
    );
    if (newestPost.id < newestArticle[0].id) {
      //there is a new post to send to subscribers
      newestPost.id = newestArticle[0].id;
      const { data: subscribers } = await axios.get(
        `${process.env.STRAPI_SERVER_URL}/subscribers?initialEmail=true`
      );
      subscribers.forEach((subscriber: any) => {
        const mailOptions = {
          from: process.env.EMAIL,
          to: subscriber.email,
          subject: `Jason's Space | ${newestArticle[0].title}`,
          html: `<h1>${newestArticle[0].title}</h1>  <a href="https://my-blog-gules-seven.vercel.app/blog/${newestPost.id}">Click here to read</a>`,
        };
        transporter.sendMail(mailOptions, (err, response) => {
          if (err) {
            console.log(
              `There was an error sending the newest article to ${subscriber.email}`
            );
            console.log(err);
          }
        });
      });
    }
  },
  null,
  false,
  "America/Los_Angeles"
);

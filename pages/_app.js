import App from "next/app";
import axios from "axios";
import { parseCookies, destroyCookie } from "nookies";
import baseUrl from "../utils/baseUrl";
import { redirectUser } from "../utils/authUser";
import Layout from "../components/Layout/Layout";
import "react-toastify/dist/ReactToastify.css";
import "semantic-ui-css/semantic.min.css";

class MyApp extends App {
  //it takes component current page as argument
  static async getInitialProps({ Component, ctx }) {
    //to exract token cookie
    const { token } = parseCookies(ctx);
    let pageProps = {};
    //declaring protected route
    const protectedRoutes = ctx.pathname === "/";

    //if token is not there redirect to login 
    if (!token) {
      protectedRoutes && redirectUser(ctx, "/login");
    }
    //get initial
    else {
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }

      try {
      
        const res = await axios.get(`${baseUrl}/api/auth`, {
          headers: { Authorization: token }
        });
        //destructure 2 objects from response from backend
        const { user, userFollowStats } = res.data;
        //we are not gonna allow logged in user to go to login page or sign page i.e not protected routes
        if (user) !protectedRoutes && redirectUser(ctx, "/");

        pageProps.user = user;
        pageProps.userFollowStats = userFollowStats;
      } catch (error) {
        destroyCookie(ctx, "token");
        redirectUser(ctx, "/login");
      }
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}

export default MyApp;



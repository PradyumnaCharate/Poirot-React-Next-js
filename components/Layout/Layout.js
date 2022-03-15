import React, { createRef } from "react";
import HeaderTags from "./HeaderTags";
import Navbar from "./Navbar";
import {
  Container,
  Visibility,
  Grid,
  Sticky,
  Ref,
  Divider,
  Segment
} from "semantic-ui-react";
import nprogress from "nprogress";
import Router from "next/router";
import SideMenu from "./SideMenu";
import Search from "./Search";


//we have spread pageprops in our app.js and pageprops have user info so receving it here
function Layout({ children, user }) {
  const contextRef = createRef();

  //this is progress bar configuration on page changes
  Router.onRouteChangeStart = () => nprogress.start();
  Router.onRouteChangeComplete = () => nprogress.done();
  Router.onRouteChangeError = () => nprogress.done();

  return (
    <>
      <HeaderTags />
      {user ? (
        <div style={{ marginLeft: "1rem", marginRight: "1rem" }}>
          <Ref innerRef={contextRef}>
            <Grid>
              <Grid.Column floated="left" width={2}>
                {//sticky means this column will not be scrollable
                }
                <Sticky context={contextRef}>
                  <SideMenu user={user} />
                </Sticky>
              </Grid.Column>

              <Grid.Column width={10}>
                {
                  //visibility means this component is scrollable
                }
                <Visibility context={contextRef}>{children}</Visibility>
              </Grid.Column>

              <Grid.Column floated="left" width={4}>
                <Sticky context={contextRef}>
                  <Segment basic>
                    <Search />
                  </Segment>
                </Sticky>
              </Grid.Column>
            </Grid>
          </Ref>
        </div>
      ) : (
        <>
          <Navbar />
          <Container text style={{ paddingTop: "1rem" }}>
            {children}
          </Container>
        </>
      )}
    </>
  );
}

export default Layout;


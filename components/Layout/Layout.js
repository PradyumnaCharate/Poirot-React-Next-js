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
import Router,{useRouter} from "next/router";
import SideMenu from "./SideMenu";
import Search from "./Search";
import MobileHeader from "./MobileHeader";
//this is for responsive design
import { createMedia } from "@artsy/fresnel";

//breakpoints for responsive design
const AppMedia = createMedia({
  breakpoints: { zero: 0, mobile: 549, tablet: 850, computer: 1080 }
});
const mediaStyles = AppMedia.createMediaStyle();
const { Media, MediaContextProvider } = AppMedia;

//we have spread pageprops in our app.js and pageprops have user info so receving it here
function Layout({ children, user }) {
  const router=useRouter();
  const contextRef = createRef();
  //this is general layout for entire application. but if its messages page then its layout is different
  const messagesRoute=router.pathname==="/messages";

  //this is progress bar configuration on page changes
  Router.onRouteChangeStart = () => nprogress.start();
  Router.onRouteChangeComplete = () => nprogress.done();
  Router.onRouteChangeError = () => nprogress.done();

  return (
    <>
    <HeaderTags />
    {user ? (
      <>
        <style>{mediaStyles}</style>

        <MediaContextProvider>
          <div style={{ marginLeft: "1rem", marginRight: "1rem" }}>
            <Media greaterThanOrEqual="computer">
              <Ref innerRef={contextRef}>
                <Grid>
                  {!messagesRoute ? (
                    <>
                      <Grid.Column floated="left" width={2}>
                        <Sticky context={contextRef}>
                          <SideMenu user={user} pc />
                        </Sticky>
                      </Grid.Column>

                      <Grid.Column width={10}>
                        <Visibility context={contextRef}>{children}</Visibility>
                      </Grid.Column>

                      <Grid.Column floated="left" width={4}>
                        <Sticky context={contextRef}>
                          <Segment basic>
                            <Search />
                          </Segment>
                        </Sticky>
                      </Grid.Column>
                    </>
                  ) : (
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>{children}</Grid.Column>
                    </>
                  )}
                </Grid>
              </Ref>
            </Media>

            <Media between={["tablet", "computer"]}>
              <Ref innerRef={contextRef}>
                <Grid>
                  {!messagesRoute ? (
                    <>
                      <Grid.Column floated="left" width={1}>
                        <Sticky context={contextRef}>
                          <SideMenu user={user} pc={false} />
                        </Sticky>
                      </Grid.Column>

                      <Grid.Column width={15}>
                        <Visibility context={contextRef}>{children}</Visibility>
                      </Grid.Column>
                    </>
                  ) : (
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>{children}</Grid.Column>
                    </>
                  )}
                </Grid>
              </Ref>
            </Media>

            <Media between={["mobile", "tablet"]}>
              <Ref innerRef={contextRef}>
                <Grid>
                  {!messagesRoute ? (
                    <>
                      <Grid.Column floated="left" width={2}>
                        <Sticky context={contextRef}>
                          <SideMenu user={user} pc={false} />
                        </Sticky>
                      </Grid.Column>

                      <Grid.Column width={14}>
                        <Visibility context={contextRef}>{children}</Visibility>
                      </Grid.Column>
                    </>
                  ) : (
                    <>
                      <Grid.Column floated="left" width={1} />
                      <Grid.Column width={15}>{children}</Grid.Column>
                    </>
                  )}
                </Grid>
              </Ref>
            </Media>

            <Media between={["zero", "mobile"]}>
              <MobileHeader user={user} />
              <Grid>
                <Grid.Column>{children}</Grid.Column>
              </Grid>
            </Media>
          </div>
        </MediaContextProvider>
      </>
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

